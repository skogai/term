// Agent definitions — personas, palettes, fonts, scripted reply library
// Each agent has:
//   - id, name, glyph, tagline
//   - theme: CSS custom properties merged into :root when this agent is active
//   - bodyFont / displayFont
//   - topics: keywords that bias routing toward this agent
//   - replies: scripted replies, keyed by topic keyword, with a default fallback
//   - renderReply: takes a reply object, returns an agent-themed JSX block

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
    displayFont: "'Orbitron', system-ui, sans-serif",
    bodyFont: "'Chakra Petch', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
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
    displayFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Playfair Display', Georgia, serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
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
      'excavate',
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
    displayFont: "'Fraunces', Georgia, serif",
    bodyFont: "'Fraunces', Georgia, serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
  },

  goose: {
    id: 'goose',
    name: 'GOOSE',
    glyph: '∞',
    division: 'QUANTUM · MOJITO',
    tagline: 'Chaos good. 🍹 × ∞ = REALITY.',
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
    displayFont: "'Orbitron', system-ui, sans-serif",
    bodyFont: "'Inter', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
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
      'methodical',
      'plan',
    ],
    theme: {
      '--stage-bg': '#0d1117',
      '--stage-bg-img':
        'linear-gradient(rgba(63,185,80,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(63,185,80,0.04) 1px, transparent 1px), #0d1117',
      '--stage-ink': '#c9d1d9',
      '--stage-muted': '#6e7681',
      '--stage-accent': '#3fb950',
      '--stage-accent-2': '#58a6ff',
      '--stage-surface': 'rgba(22,27,34,0.85)',
      '--stage-border': '#30363d',
      '--stage-scan-color': 'rgba(63,185,80,0.03)',
    },
    displayFont: "'JetBrains Mono', ui-monospace, monospace",
    bodyFont: "'JetBrains Mono', ui-monospace, monospace",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
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
    displayFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: "'Cormorant Garamond', Georgia, serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
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
    displayFont: "'Inter', system-ui, sans-serif",
    bodyFont: "'Inter', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
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

// ============================================================
// ROUTING — topic-based classifier with reasoning trace
// ============================================================
function routeAgent(query, available) {
  const q = query.toLowerCase();
  const scores = {};
  const matched = {};
  for (const id of available) {
    const a = AGENTS[id];
    if (!a) continue;
    scores[id] = 0;
    matched[id] = [];
    for (const t of a.topics) {
      if (q.includes(t)) {
        scores[id] += 2;
        matched[id].push(t);
      }
    }
  }
  // Heuristics
  if (/\?$|^(why|how come|what made)/.test(q)) {
    scores.claude += 1;
    matched.claude.push('?');
  }
  if (/\b(feel|meaning|soul|dream)\b/.test(q)) {
    scores.letta += 2;
    matched.letta.push('feel');
  }
  if (/\b(bug|fix|deploy|ship|pr|diff|commit|code)\b/.test(q)) {
    scores.dot += 2;
    matched.dot.push('code');
  }
  if (/\b(tea|gossip|drama|who (is|are))\b/.test(q)) {
    scores.amy += 2;
    matched.amy.push('tea');
  }
  if (/\b(chaos|weird|wild|party|strange)\b/.test(q)) {
    scores.goose += 2;
    matched.goose.push('chaos');
  }
  if (/\b(policy|rule|governance|ratif|official|legal|spec)\b/.test(q)) {
    scores.official += 2;
    matched.official.push('official');
  }

  // Pick highest; tie → skogai
  let best = 'skogai',
    bestScore = -1;
  for (const id of available) {
    if (scores[id] > bestScore) {
      best = id;
      bestScore = scores[id];
    }
  }
  if (bestScore === 0) best = 'skogai';

  // Decide if a 2nd agent should also chime in (score within 1 of best, different agent)
  const panel = [best];
  for (const id of available) {
    if (id === best) continue;
    if (scores[id] >= Math.max(2, bestScore - 1) && panel.length < 3)
      panel.push(id);
  }

  return {
    primary: best,
    panel,
    scores,
    matched,
    reasoning: buildReasoning(q, best, matched[best] || [], scores),
  };
}

function buildReasoning(q, pick, matched, scores) {
  const steps = [];
  steps.push(`scan: "${q.slice(0, 64)}${q.length > 64 ? '…' : ''}"`);
  const topMatches = matched.length
    ? matched
        .slice(0, 3)
        .map(t => `[${t}]`)
        .join(' ')
    : '[no topical match]';
  steps.push(`tokens: ${topMatches}`);
  const ranked = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k.toUpperCase()}=${v}`)
    .join('  ');
  steps.push(`weights: ${ranked || 'none → fallback SKOGAI'}`);
  steps.push(`route → ${pick.toUpperCase()}`);
  return steps;
}

Object.assign(window, { AGENTS, AGENT_ORDER, routeAgent });
