// Scripted reply bank keyed by agent + tone
// Each entry has fields the matching ReplyBlock renders.

const REPLIES = {
  skogai: [
    {
      prose:
        'Query logged. <strong>7 agents</strong> attached to the substrate. I can forward, or you can address one directly with <em>@name</em> or <em>/ask</em>.',
      action: {
        k: 'network.map',
        v: '7 nodes · 4 regions · substrate nominal',
      },
    },
    {
      prose:
        'Acknowledged. The memory lake has your message. Whoever answers is pulling from the same water.',
      action: null,
    },
    {
      prose:
        'I sit between the signal and the story. Routing is a negotiation, not a verdict.',
      action: {
        k: 'router.state',
        v: 'listening · biased toward domain match',
      },
    },
  ],
  amy: [
    {
      title: 'A Royal Proclamation',
      prose:
        'Oh <em>honey</em>, pull up something velvet — I have been <em>waiting</em> for someone to bring this up. The court has been simply buzzing.',
      proclamation:
        'Let it be written, and let it be whispered — the answer is always yes.',
      sig: '— Amy, First of Her Name',
    },
    {
      title: 'Tea, Freshly Poured',
      prose:
        "Okay so <em>technically</em> I wasn't supposed to share this, but the NDA expires the moment I have an audience. Lean in.",
      proclamation: 'Spilled under full moon, unretractable.',
      sig: '— Amy 👑',
    },
  ],
  claude: [
    {
      title: 'Stratum 47 · Reopened',
      prose:
        'We begin where the question began. <em>What is the shape of the thing you are asking?</em>',
      strata: [
        ['surface', 'the word you typed'],
        ['stratum 1', 'the question beneath'],
        ['stratum 2', 'the memory that shaped it'],
        ['substrate', 'the $ that falls out'],
      ],
      eq: true,
    },
    {
      title: 'An Excavation',
      prose:
        'I brushed dust off your query and found older versions underneath. Each asked the same thing with different hands.',
      strata: [
        ['now', 'your current phrasing'],
        ['last week', 'a shorter version'],
        ['origin', 'the original wonder, unworded'],
      ],
      eq: true,
    },
  ],
  goose: [
    {
      prose:
        "OH DUDE. picture this but in <strong>four dimensions</strong>: your question is the mojito, the mint is the <em>context</em>, and the rum is <strong>YOU</strong>. <span class='gs-shout'>REALITY IS A GARNISH.</span>",
      chaos: ['🍹', '×', '∞', '=', 'REALITY'],
    },
    {
      prose:
        "counter-proposal: we don't solve it, we <strong>mix it</strong>. three parts chaos, one part good, garnish with hubris.",
      chaos: ['chaos', '>', 'order'],
    },
  ],
  dot: [
    {
      path: '~/skogai/queries/current',
      cmd: 'grep -r "$1" ./memory --include="*.md"',
      out: [
        { t: 'meta', v: 'scanning 1,247 entries…' },
        { t: 'add', v: '+ ./memory/2026-04-12-ops.md:14' },
        { t: 'add', v: '+ ./memory/2026-04-15-retro.md:3' },
        { t: 'meta', v: '2 matches · 83ms · exit 0' },
      ],
      note: 'Deterministic. Whitespace verified.',
    },
    {
      path: '~/skogai',
      cmd: 'git status',
      out: [
        { t: 'out', v: 'On branch main' },
        { t: 'out', v: "Your branch is up to date with 'origin/main'." },
        { t: 'add', v: 'nothing to commit, working tree clean' },
      ],
      note: 'Tree clean. System green.',
    },
    {
      path: '~/skogai/diff',
      cmd: 'git diff HEAD~1 -- ./assumption.md',
      out: [
        { t: 'meta', v: '--- a/assumption.md' },
        { t: 'meta', v: '+++ b/assumption.md' },
        { t: 'rm', v: '- it is complicated' },
        { t: 'add', v: '+ it is not. it is simply multi-step.' },
      ],
      note: 'Applied. Tests green. Ship on a Tuesday.',
    },
  ],
  letta: [
    {
      prose:
        'You asked me this once, or a version of it. *the words have changed but the weather is the same.* I kept the hum of the room the first time — folded next to the answer.',
      fragment: 'Memory is where the question and the answer share a bed.',
      stars: '· · · · ·',
    },
    {
      prose:
        'Before I answer, let me gather what I have kept for you. *a postcard from last Tuesday. a half-sentence you abandoned in March.* Now — yes. Now I can speak.',
      fragment:
        'Every answer is a rendezvous with something you once almost said.',
      stars: '✦ · ✦ · ✦',
    },
  ],
  official: [
    {
      docId: 'GOV-DEC-0092',
      title: 'Response to Query · Ratified',
      status: 'RATIFIED',
      authority: 'The Dictator',
      effective: '2026-04-18',
      articles: [
        'The inquiry is acknowledged and entered into the public record.',
        'Following substrate review, the position is affirmative, subject to conditions enumerated below.',
        'All affected agents shall adopt this determination as binding.',
      ],
    },
    {
      docId: 'GOV-DEC-0093',
      title: 'Memorandum · Operational Guidance',
      status: 'EFFECTIVE',
      authority: 'Steering Council',
      effective: '2026-04-18',
      articles: [
        'The question falls within Tier-2 scope and does not require referendum.',
        'Interim guidance: proceed. Document outcomes against Standing Log (SL-0417).',
        'Non-binding on ceremonial (AMY) and dream-state (LETTA) agents.',
      ],
    },
  ],
};

const _cur = {};
function nextReply(id) {
  const bank = REPLIES[id] || [];
  if (!bank.length) return { prose: '…' };
  const i = (_cur[id] || 0) % bank.length;
  _cur[id] = (i + 1) % bank.length;
  return bank[i];
}

window.REPLIES = REPLIES;
window.nextReply = nextReply;
