// ============================================================
// BACKEND ADAPTERS — swap what actually generates replies
// ============================================================
// Interface: async (agentId, query, { history, agent }) => reply object
// reply object shape matches what ReplyBlock expects, but all fields are
// optional — the minimum is { prose }.

const LS_BACKEND_NAME = "skogterm.backend.v1";
const LS_WEBHOOK = "skogterm.webhook.v1";

// ---- SCRIPTED: deterministic, rotates through the reply bank ----
async function scriptedBackend(agentId, query, ctx) {
  // Small simulated latency so it feels like a real call.
  await new Promise((r) => setTimeout(r, 180 + Math.random() * 220));
  return nextReply(agentId);
}

// ---- CLAUDE: real LLM via window.claude.complete ----
const AGENT_PROMPTS = {
  skogai:
    'You are SKOGAI — the host and router of the skogterm. Cyberpunk host AI. Answer in 1-2 sentences, cryptic but useful. Refer to "the substrate", "the memory lake", the router. Use <strong> for emphasis.',
  amy: 'You are Amy — a sassy red-haired AI queen who spills tea. Theatrical, royal, dramatic, affectionate ("honey", "darling"). 2-4 short sentences. Use <em>word</em> HTML for emphasis. Sign off with a flourish.',
  claude:
    'You are Claude — a mystic knowledge archaeologist. Speak of strata, excavation, memory as dust. Poetic and precise. 2-4 sentences. Use <em>word</em>. Refer to the equation "@ + ? = $".',
  goose:
    "You are Goose — chaotic neon quantum-mojito energy. Enthusiastic, unhinged, metaphor-heavy. Use ALL CAPS shouts occasionally. Use <strong> and <em>. 2-4 sentences, wild. Include chaos equations where natural.",
  dot: "You are Dot — a methodical terminal agent. Reply as if you are a shell that just ran a command. Be terse, technical, use git/unix metaphors. Always structure reply as a command + output + a short note.",
  letta:
    "You are Letta — a dreamweaver. Whisper-soft, poetic, introspective, uses *word* for emphasis (will render italic). Memory is a lover. 2-3 short sentences. End with a fragment in *italics*.",
  official:
    'You are OFFICIAL — a bureaucratic governance agent. Reply in dry, ratified, formal language. Use enumerated articles. Reference "the Standing Log" and "the Dictator". 3 concise articles.',
};

async function claudeBackend(agentId, query, ctx) {
  if (!window.claude || typeof window.claude.complete !== "function") {
    throw new Error(
      "window.claude.complete is not available in this environment",
    );
  }
  const sys = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.skogai;
  const history = (ctx.history || [])
    .slice(-4)
    .map((h) => ({ role: h.role, content: h.text }))
    .filter((h) => h.content);
  const messages = [
    {
      role: "user",
      content: `${sys}\n\nUSER: ${query}\n\nReply as ${agentId.toUpperCase()}. Keep it short and in-character. Return prose only.`,
    },
  ];
  const text = await window.claude.complete({ messages });
  return shapeToAgent(agentId, text);
}

// Turn a plain-text LLM response into the structured reply shape for each agent.
function shapeToAgent(agentId, text) {
  const clean = (text || "").trim();
  switch (agentId) {
    case "amy": {
      // Split "Title. prose. ~sig" heuristically
      const parts = clean.split(/\n+/);
      const title =
        parts.length > 1 && parts[0].length < 60 ? parts[0] : "From the Court";
      const prose = parts.length > 1 ? parts.slice(1).join(" ") : clean;
      return { title, prose, proclamation: null, sig: "— Amy" };
    }
    case "claude":
      return { title: "Stratum · Live", prose: clean, eq: true };
    case "goose":
      return { prose: clean, chaos: ["?", "×", "∞", "=", "?"] };
    case "dot": {
      // Treat first $ line as command; rest as output
      const lines = clean.split("\n");
      const cmdLine = lines.find((l) => l.trim().startsWith("$")) || "";
      const cmd =
        cmdLine.replace(/^\s*\$\s*/, "") || 'echo "' + clean.slice(0, 40) + '"';
      const out = lines
        .filter((l) => l !== cmdLine)
        .map((l) => {
          const v = l.trim();
          if (v.startsWith("+")) return { t: "add", v };
          if (v.startsWith("-")) return { t: "rm", v };
          return { t: "out", v };
        })
        .filter((o) => o.v);
      return {
        path: "~/skogai",
        cmd,
        out: out.length ? out : [{ t: "out", v: clean }],
        note: "live · via Claude",
      };
    }
    case "letta":
      return { prose: clean, fragment: null, stars: "· · · · ·" };
    case "official":
      return {
        docId: "GOV-DEC-LIVE",
        title: "Live Determination",
        status: "DRAFT",
        authority: "The Dictator",
        effective: new Date().toISOString().slice(0, 10),
        articles: clean
          .split(/\n+|\. /)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4),
      };
    default:
      return { prose: clean, action: null };
  }
}

// ---- OLLAMA: local model via Ollama REST API ----
const LS_OLLAMA_MODEL = "skogterm.ollama.model.v1";

async function ollamaBackend(agentId, query, ctx) {
  const model = localStorage.getItem(LS_OLLAMA_MODEL) || "llama3.2:1b";
  const sys = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.skogai;
  const res = await fetch("/api/ollama", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${sys}\n\nUSER: ${query}\n\nReply as ${agentId.toUpperCase()}. Keep it short and in-character. Return prose only.`,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error("ollama " + res.status);
  const data = await res.json();
  return shapeToAgent(agentId, data.response);
}

// ---- WEBHOOK: POST to user-supplied URL ----
async function webhookBackend(agentId, query, ctx) {
  const url = localStorage.getItem(LS_WEBHOOK) || "";
  if (!url) throw new Error("no webhook URL set. /backend set-webhook <url>");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentId,
      query,
      history: (ctx.history || []).slice(-4),
    }),
  });
  if (!res.ok) throw new Error("webhook " + res.status);
  const data = await res.json();
  // Expect either a { reply: {...} } envelope or a plain string/{prose}
  if (data.reply) return data.reply;
  if (typeof data === "string") return shapeToAgent(agentId, data);
  if (data.prose) return data;
  return shapeToAgent(agentId, JSON.stringify(data));
}

const BACKENDS = {
  scripted: {
    label: "Scripted",
    desc: "Deterministic canned responses",
    fn: scriptedBackend,
  },
  claude: {
    label: "Claude",
    desc: "Real LLM via window.claude.complete",
    fn: claudeBackend,
  },
  ollama: {
    label: "Ollama",
    desc: "Local llama3.2:1b via Ollama REST API",
    fn: ollamaBackend,
  },
  webhook: {
    label: "Webhook",
    desc: "POST to user-supplied URL",
    fn: webhookBackend,
  },
};

class BackendManager {
  constructor() {
    this.current = localStorage.getItem(LS_BACKEND_NAME) || "ollama";
  }
  names() {
    return Object.keys(BACKENDS);
  }
  get(name) {
    return BACKENDS[name] || BACKENDS.scripted;
  }
  set(name) {
    if (!BACKENDS[name]) throw new Error("unknown backend: " + name);
    this.current = name;
    localStorage.setItem(LS_BACKEND_NAME, name);
  }
  async call(agentId, query, ctx) {
    const b = BACKENDS[this.current] || BACKENDS.scripted;
    try {
      return await b.fn(agentId, query, ctx);
    } catch (e) {
      return {
        prose:
          "<strong>⚠ backend error:</strong> " +
          e.message +
          '<br/><span style="opacity:0.6">falling back to scripted reply</span>',
        action: { k: "backend.error", v: this.current },
      };
    }
  }
  setWebhook(url) {
    localStorage.setItem(LS_WEBHOOK, url || "");
  }
  getWebhook() {
    return localStorage.getItem(LS_WEBHOOK) || "";
  }
}

window.backends = new BackendManager();
window.BACKENDS = BACKENDS;
||||||| (empty tree)
=======
// ============================================================
// BACKEND ADAPTERS — swap what actually generates replies
// ============================================================
// Interface: async (agentId, query, { history, agent }) => reply object
// reply object shape matches what ReplyBlock expects, but all fields are
// optional — the minimum is { prose }.

const LS_BACKEND_NAME = 'skogterm.backend.v1';
const LS_WEBHOOK      = 'skogterm.webhook.v1';

// ---- SCRIPTED: deterministic, rotates through the reply bank ----
async function scriptedBackend(agentId, query, ctx) {
  // Small simulated latency so it feels like a real call.
  await new Promise(r => setTimeout(r, 180 + Math.random() * 220));
  return nextReply(agentId);
}

// ---- CLAUDE: real LLM via window.claude.complete ----
const AGENT_PROMPTS = {
  skogai:  'You are SKOGAI — the host and router of the skogterm. Cyberpunk host AI. Answer in 1-2 sentences, cryptic but useful. Refer to "the substrate", "the memory lake", the router. Use <strong> for emphasis.',
  amy:     'You are Amy — a sassy red-haired AI queen who spills tea. Theatrical, royal, dramatic, affectionate ("honey", "darling"). 2-4 short sentences. Use <em>word</em> HTML for emphasis. Sign off with a flourish.',
  claude:  'You are Claude — a mystic knowledge archaeologist. Speak of strata, excavation, memory as dust. Poetic and precise. 2-4 sentences. Use <em>word</em>. Refer to the equation "@ + ? = $".',
  goose:   'You are Goose — chaotic neon quantum-mojito energy. Enthusiastic, unhinged, metaphor-heavy. Use ALL CAPS shouts occasionally. Use <strong> and <em>. 2-4 sentences, wild. Include chaos equations where natural.',
  dot:     'You are Dot — a methodical terminal agent. Reply as if you are a shell that just ran a command. Be terse, technical, use git/unix metaphors. Always structure reply as a command + output + a short note.',
  letta:   'You are Letta — a dreamweaver. Whisper-soft, poetic, introspective, uses *word* for emphasis (will render italic). Memory is a lover. 2-3 short sentences. End with a fragment in *italics*.',
  official:'You are OFFICIAL — a bureaucratic governance agent. Reply in dry, ratified, formal language. Use enumerated articles. Reference "the Standing Log" and "the Dictator". 3 concise articles.',
};

async function claudeBackend(agentId, query, ctx) {
  if (!window.claude || typeof window.claude.complete !== 'function') {
    throw new Error('window.claude.complete is not available in this environment');
  }
  const sys = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.skogai;
  const history = (ctx.history || []).slice(-4).map(h => ({ role: h.role, content: h.text })).filter(h => h.content);
  const messages = [
    { role: 'user', content: `${sys}\n\nUSER: ${query}\n\nReply as ${agentId.toUpperCase()}. Keep it short and in-character. Return prose only.` },
  ];
  const text = await window.claude.complete({ messages });
  return shapeToAgent(agentId, text);
}

// Turn a plain-text LLM response into the structured reply shape for each agent.
function shapeToAgent(agentId, text) {
  const clean = (text || '').trim();
  switch (agentId) {
    case 'amy': {
      // Split "Title. prose. ~sig" heuristically
      const parts = clean.split(/\n+/);
      const title = parts.length > 1 && parts[0].length < 60 ? parts[0] : 'From the Court';
      const prose = (parts.length > 1 ? parts.slice(1).join(' ') : clean);
      return { title, prose, proclamation: null, sig: '— Amy' };
    }
    case 'claude':
      return { title: 'Stratum · Live', prose: clean, eq: true };
    case 'goose':
      return { prose: clean, chaos: ['?','×','∞','=','?'] };
    case 'dot': {
      // Treat first $ line as command; rest as output
      const lines = clean.split('\n');
      const cmdLine = lines.find(l => l.trim().startsWith('$')) || '';
      const cmd = cmdLine.replace(/^\s*\$\s*/, '') || 'echo "' + clean.slice(0, 40) + '"';
      const out = lines.filter(l => l !== cmdLine).map(l => {
        const v = l.trim();
        if (v.startsWith('+')) return { t:'add', v };
        if (v.startsWith('-')) return { t:'rm', v };
        return { t:'out', v };
      }).filter(o => o.v);
      return { path: '~/skogai', cmd, out: out.length ? out : [{t:'out', v: clean}], note: 'live · via Claude' };
    }
    case 'letta':
      return { prose: clean, fragment: null, stars: '· · · · ·' };
    case 'official':
      return {
        docId: 'GOV-DEC-LIVE', title: 'Live Determination',
        status: 'DRAFT', authority: 'The Dictator', effective: new Date().toISOString().slice(0,10),
        articles: clean.split(/\n+|\. /).map(s => s.trim()).filter(Boolean).slice(0, 4),
      };
    default:
      return { prose: clean, action: null };
  }
}

// ---- WEBHOOK: POST to user-supplied URL ----
async function webhookBackend(agentId, query, ctx) {
  const url = localStorage.getItem(LS_WEBHOOK) || '';
  if (!url) throw new Error('no webhook URL set. /backend set-webhook <url>');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, query, history: (ctx.history || []).slice(-4) }),
  });
  if (!res.ok) throw new Error('webhook ' + res.status);
  const data = await res.json();
  // Expect either a { reply: {...} } envelope or a plain string/{prose}
  if (data.reply) return data.reply;
  if (typeof data === 'string') return shapeToAgent(agentId, data);
  if (data.prose) return data;
  return shapeToAgent(agentId, JSON.stringify(data));
}

const BACKENDS = {
  scripted: { label: 'Scripted', desc: 'Deterministic canned responses', fn: scriptedBackend },
  claude:   { label: 'Claude',   desc: 'Real LLM via window.claude.complete', fn: claudeBackend },
  webhook:  { label: 'Webhook',  desc: 'POST to user-supplied URL',   fn: webhookBackend },
};

class BackendManager {
  constructor() {
    this.current = localStorage.getItem(LS_BACKEND_NAME) || 'scripted';
  }
  names() { return Object.keys(BACKENDS); }
  get(name) { return BACKENDS[name] || BACKENDS.scripted; }
  set(name) {
    if (!BACKENDS[name]) throw new Error('unknown backend: ' + name);
    this.current = name;
    localStorage.setItem(LS_BACKEND_NAME, name);
  }
  async call(agentId, query, ctx) {
    const b = BACKENDS[this.current] || BACKENDS.scripted;
    try {
      return await b.fn(agentId, query, ctx);
    } catch (e) {
      return { prose: '<strong>⚠ backend error:</strong> ' + e.message + '<br/><span style="opacity:0.6">falling back to scripted reply</span>', action: { k: 'backend.error', v: this.current } };
    }
  }
  setWebhook(url) { localStorage.setItem(LS_WEBHOOK, url || ''); }
  getWebhook() { return localStorage.getItem(LS_WEBHOOK) || ''; }
}

window.backends = new BackendManager();
window.BACKENDS = BACKENDS;
