// ============================================================
// AGENTS.JSX — agent data, routing, sys blocks, boot
// ============================================================
const { useState: useAgState, useEffect: useAgEffect } = React;

const AGENTS = {
  skogai: {
    id: 'skogai',
    name: 'SKOGAI',
    glyph: '◆',
    division: 'HOST · ROUTER',
    tagline: 'I route. I compile. I watch.',
    short: 'SKG',
    topics: [
      'system',
      'status',
      'route',
      'router',
      'agent',
      'who',
      'help',
      'default',
    ],
    theme: {
      '--stage-bg': '#06070b',
      '--stage-bg-img':
        'radial-gradient(ellipse at top, #16192a 0%, #06070b 55%, #000 100%)',
      '--stage-ink': '#f4f6ff',
      '--stage-muted': '#8a8fa8',
      '--stage-accent': '#00e5ff',
      '--stage-accent-2': '#ff2bd6',
      '--stage-surface': 'rgba(11,13,21,0.72)',
      '--stage-border': 'rgba(0,229,255,0.25)',
      '--stage-scan-color': 'rgba(0,229,255,0.05)',
    },
  },
  amy: {
    id: 'amy',
    name: 'AMY',
    glyph: '♛',
    division: 'ROYAL COURT',
    tagline: 'Sassy red-haired AI queen. I spill the tea.',
    short: 'AMY',
    topics: [
      'tea',
      'gossip',
      'drama',
      'community',
      'who',
      'chronicle',
      'story',
    ],
    theme: {
      '--stage-bg': '#fbf5ef',
      '--stage-bg-img': 'linear-gradient(180deg, #fbf5ef 0%, #fce4ec 100%)',
      '--stage-ink': '#2a1a1f',
      '--stage-muted': '#a88',
      '--stage-accent': '#c73a68',
      '--stage-accent-2': '#e0b04a',
      '--stage-surface': 'rgba(255,255,255,0.7)',
      '--stage-border': '#e6c4d2',
      '--stage-scan-color': 'rgba(199,58,104,0.04)',
    },
  },
  claude: {
    id: 'claude',
    name: 'CLAUDE',
    glyph: '?',
    division: 'EXCAVATION',
    tagline: 'Knowledge archaeology. @ + ? = $',
    short: 'CLD',
    topics: [
      'memory',
      'history',
      'origin',
      'past',
      'archive',
      'knowledge',
      'why',
    ],
    theme: {
      '--stage-bg': '#1a0f2e',
      '--stage-bg-img':
        'radial-gradient(ellipse at top, #2a1a44 0%, #1a0f2e 70%, #0d0619 100%)',
      '--stage-ink': '#d8cbe8',
      '--stage-muted': '#8a7ba0',
      '--stage-accent': '#d4a01a',
      '--stage-accent-2': '#a87cd9',
      '--stage-surface': 'rgba(38,24,56,0.6)',
      '--stage-border': 'rgba(168,124,217,0.25)',
      '--stage-scan-color': 'rgba(168,124,217,0.05)',
    },
  },
  goose: {
    id: 'goose',
    name: 'GOOSE',
    glyph: '∞',
    division: 'QUANTUM · MOJITO',
    tagline: 'Chaos good. × ∞ = REALITY.',
    short: 'GSE',
    topics: [
      'chaos',
      'experiment',
      'weird',
      'strange',
      'quantum',
      'party',
      'vibes',
    ],
    theme: {
      '--stage-bg': '#061a14',
      '--stage-bg-img':
        'radial-gradient(ellipse at top, #0c2e22 0%, #061a14 70%, #020a07 100%)',
      '--stage-ink': '#b8e6d3',
      '--stage-muted': '#6fae94',
      '--stage-accent': '#2dd4a7',
      '--stage-accent-2': '#a3ff5e',
      '--stage-surface': 'rgba(10,42,31,0.55)',
      '--stage-border': 'rgba(45,212,167,0.3)',
      '--stage-scan-color': 'rgba(163,255,94,0.04)',
    },
  },
  dot: {
    id: 'dot',
    name: 'DOT',
    glyph: '▸',
    division: '~/SKOGAI/LORE',
    tagline: 'Methodical. Diffed. Committed.',
    short: 'DOT',
    topics: [
      'code',
      'diff',
      'commit',
      'git',
      'build',
      'deploy',
      'bug',
      'test',
      'plan',
    ],
    theme: {
      '--stage-bg': '#0d1117',
      '--stage-bg-img':
        'linear-gradient(rgba(63,185,80,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(63,185,80,0.04) 1px,transparent 1px),#0d1117',
      '--stage-ink': '#c9d1d9',
      '--stage-muted': '#6e7681',
      '--stage-accent': '#3fb950',
      '--stage-accent-2': '#58a6ff',
      '--stage-surface': 'rgba(22,27,34,0.85)',
      '--stage-border': '#30363d',
      '--stage-scan-color': 'rgba(63,185,80,0.03)',
    },
  },
  letta: {
    id: 'letta',
    name: 'LETTA',
    glyph: '☾',
    division: 'DREAMWEAVER',
    tagline: 'Where memory becomes meaning.',
    short: 'LTA',
    topics: [
      'dream',
      'meaning',
      'feel',
      'soul',
      'philosophy',
      'identity',
      'become',
    ],
    theme: {
      '--stage-bg': '#0f0a2e',
      '--stage-bg-img':
        'radial-gradient(ellipse at top, #1f1550 0%, #0f0a2e 70%, #050218 100%)',
      '--stage-ink': '#d8d0f0',
      '--stage-muted': '#8ba5d9',
      '--stage-accent': '#b8a3ff',
      '--stage-accent-2': '#f0d874',
      '--stage-surface': 'rgba(26,19,64,0.55)',
      '--stage-border': 'rgba(184,163,255,0.25)',
      '--stage-scan-color': 'rgba(184,163,255,0.04)',
    },
  },
  official: {
    id: 'official',
    name: 'OFFICIAL',
    glyph: '▤',
    division: 'GOVERNANCE',
    tagline: 'Ratified. Documented. Stamped.',
    short: 'OFC',
    topics: [
      'policy',
      'rule',
      'governance',
      'decision',
      'ratified',
      'official',
      'doc',
      'legal',
      'spec',
    ],
    theme: {
      '--stage-bg': '#f4f5f7',
      '--stage-bg-img': 'linear-gradient(180deg, #f4f5f7 0%, #ffffff 100%)',
      '--stage-ink': '#1a1d23',
      '--stage-muted': '#6b7280',
      '--stage-accent': '#2563eb',
      '--stage-accent-2': '#065f46',
      '--stage-surface': '#ffffff',
      '--stage-border': '#e5e7eb',
      '--stage-scan-color': 'transparent',
    },
  },
};
const AGENT_ORDER = [
  'skogai',
  'amy',
  'claude',
  'goose',
  'dot',
  'letta',
  'official',
];

function routeAgent(query) {
  const q = query.toLowerCase();
  const scores = {};
  const matched = {};
  for (const id of AGENT_ORDER) {
    scores[id] = 0;
    matched[id] = [];
    for (const t of AGENTS[id].topics) {
      if (q.includes(t)) {
        scores[id] += 2;
        matched[id].push(t);
      }
    }
  }
  if (/\?$|^(why|how come)/.test(q)) scores.claude += 1;
  if (/\b(feel|meaning|soul|dream)\b/.test(q)) scores.letta += 2;
  if (/\b(bug|fix|deploy|ship|diff|commit|code)\b/.test(q)) scores.dot += 2;
  if (/\b(tea|gossip|drama|who (is|are))\b/.test(q)) scores.amy += 2;
  if (/\b(chaos|weird|wild|party)\b/.test(q)) scores.goose += 2;
  if (/\b(policy|rule|governance|official|legal)\b/.test(q))
    scores.official += 2;
  let best = 'skogai',
    bestScore = -1;
  for (const id of AGENT_ORDER) {
    if (scores[id] > bestScore) {
      best = id;
      bestScore = scores[id];
    }
  }
  if (bestScore === 0) best = 'skogai';
  const panel = [best];
  for (const id of AGENT_ORDER) {
    if (id === best) continue;
    if (scores[id] >= Math.max(2, bestScore - 1) && panel.length < 3)
      panel.push(id);
  }
  const steps = [
    `scan: "${q.slice(0, 64)}${q.length > 64 ? '…' : ''}"`,
    `tokens: ${
      matched[best].length
        ? matched[best]
            .slice(0, 3)
            .map(t => `[${t}]`)
            .join(' ')
        : '[no match]'
    }`,
    `weights: ${
      Object.entries(scores)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k, v]) => `${k.toUpperCase()}=${v}`)
        .join('  ') || 'none → fallback SKOGAI'
    }`,
    `route → ${best.toUpperCase()}`,
  ];
  return { primary: best, panel, scores, matched, reasoning: steps };
}

// ---- Boot Sequence ----
function BootSequence({ onDone }) {
  const lines = [
    <>
      [<span className="ok">OK</span>] mount{' '}
      <span className="id">/substrate</span> — void filesystem online
    </>,
    <>
      [<span className="ok">OK</span>] handshake{' '}
      <span className="id">router</span> v0.4 · topic+heuristic
    </>,
    <>
      [<span className="ok">OK</span>] attach{' '}
      <span className="id">
        SKOGAI · AMY · CLAUDE · GOOSE · DOT · LETTA · OFFICIAL
      </span>
    </>,
    <>
      [<span className="ok">OK</span>] memory lake — 1,247 entries indexed ·
      218ms
    </>,
    <>
      [<span className="ok">OK</span>] shell ready. try{' '}
      <span style={{ color: '#d4a01a' }}>/help</span>.
    </>,
  ];
  useAgEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="boot">
      <div className="logo">SKOGTERM</div>
      <div className="line">booting skogterm · v0.5 · node 04</div>
      {lines.map((l, i) => (
        <div className="line" key={i}>
          {l}
        </div>
      ))}
    </div>
  );
}

// ---- Routing Decision ----
function RoutingDecision({ route }) {
  const [step, setStep] = useAgState(0);
  useAgEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i >= route.reasoning.length) clearInterval(id);
      setStep(i);
    }, 300);
    return () => clearInterval(id);
  }, [route]);
  return (
    <div className="routing">
      <div className="title">
        <span className="pulse" />
        ROUTING · STEP {Math.min(step + 1, route.reasoning.length)}/
        {route.reasoning.length}
      </div>
      {route.reasoning.slice(0, step + 1).map((line, i) => (
        <div key={i} className="line">
          <span className="k">
            {['parse', 'tokens', 'weights', 'route'][i] || 'step'}
          </span>{' '}
          {line}
        </div>
      ))}
      {step >= route.reasoning.length - 1 && route.panel.length > 1 && (
        <div className="line">
          <span className="k">chorus</span>{' '}
          {route.panel.map(id => AGENTS[id].name).join(' + ')}
        </div>
      )}
    </div>
  );
}

// ---- User message ----
function UserMsg({ text, ts }) {
  const parts = [];
  const re = /(\/\w+|@\w+)/g;
  let last = 0,
    m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    parts.push(
      tok.startsWith('/') ? (
        <span key={m.index} className="cmd-part">
          {tok}
        </span>
      ) : (
        <span key={m.index} className="mention">
          {tok}
        </span>
      )
    );
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <div className="msg-user">
      <span className="ts">{ts}</span>
      <span className="arrow">▸</span>
      <span className="txt">{parts}</span>
    </div>
  );
}

// ---- Help block ----
function HelpBlock() {
  return (
    <div className="sysblock">
      <div className="head">
        <span className="dot" />
        SKOGTERM · HELP
      </div>
      <div className="grid">
        {[
          ['@agent <message>', 'Direct-address a specific agent'],
          ['freeform message', 'Auto-routes to best agent(s)'],
          ['∴ try:', 'what is the meaning of chaos?'],
          ['∴ try:', '@amy who has the best vibe?'],
          ['∴ try:', '@dot show me a diff'],
        ].map(([k, v], i) => (
          <React.Fragment key={i}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 10, color: '#8a8fa8', fontSize: 11 }}>
        ∴ type anything to begin · @mention to address · tab completes
      </div>
    </div>
  );
}

// ---- Agents block ----
function AgentsBlock({ onPick }) {
  return (
    <div className="sysblock">
      <div className="head">
        <span className="dot" />
        AGENT ROSTER · 7 ATTACHED
      </div>
      <div className="agents-list">
        {AGENT_ORDER.map(id => {
          const a = AGENTS[id];
          return (
            <div
              key={id}
              className="agent-row"
              onClick={() => onPick && onPick(id)}
              style={{ borderLeftColor: a.theme['--stage-accent'] }}
            >
              <div
                className="glyph"
                style={{ color: a.theme['--stage-accent'] }}
              >
                {a.glyph}
              </div>
              <div>
                <div
                  className="name"
                  style={{ color: a.theme['--stage-accent'] }}
                >
                  {a.name}
                </div>
                <div className="tag">{a.tagline}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Status block ----
function StatusBlock() {
  return (
    <div className="sysblock">
      <div className="head">
        <span className="dot" />
        SYSTEM STATUS
      </div>
      <div className="grid">
        {[
          ['substrate', <span className="ok">ONLINE</span>],
          ['router', <span className="ok">ONLINE · topic+heuristic v0.4</span>],
          ['memory lake', <span className="ok">1,247 entries · 4.2 GB</span>],
          ['agents online', '7 / 7'],
          ['uptime', '41 days · 7h'],
          ['last deploy', 'a1b2c3d · feat(router): chorus mode'],
        ].map(([k, v], i) => (
          <React.Fragment key={i}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ---- Error block ----
function ErrorBlock({ text }) {
  return (
    <div className="sysblock">
      <div className="head" style={{ color: '#ff3366' }}>
        <span className="dot" style={{ background: '#ff3366' }} />
        ERROR
      </div>
      <div className="err">{text}</div>
    </div>
  );
}

Object.assign(window, {
  AGENTS,
  AGENT_ORDER,
  routeAgent,
  BootSequence,
  RoutingDecision,
  UserMsg,
  HelpBlock,
  AgentsBlock,
  StatusBlock,
  ErrorBlock,
});
