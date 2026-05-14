// ============================================================
// AgentReply.jsx — scripted reply bank + all 7 reply renderers
// ============================================================
const { useState: useRState, useEffect: useREffect } = React;

// ---- Reply bank ----
const REPLIES = {
  skogai: [
    {
      prose:
        'Query logged. <strong>7 agents</strong> attached to the substrate. Address one directly with <em>@name</em>.',
      action: { k: 'network.map', v: '7 nodes · substrate nominal' },
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
        'Oh <em>honey</em>, pull up something velvet — I have been <em>waiting</em> for someone to bring this up.',
      proclamation:
        'Let it be written, and let it be whispered — the answer is always yes.',
      sig: '— Amy, First of Her Name',
    },
    {
      title: 'Tea, Freshly Poured',
      prose:
        "Okay so <em>technically</em> I wasn't supposed to share this, but the NDA expires the moment I have an audience.",
      proclamation: 'Spilled under full moon, unretractable.',
      sig: '— Amy ♛',
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
        ['origin', 'the original wonder, unworded'],
      ],
      eq: true,
    },
  ],
  goose: [
    {
      prose:
        'OH DUDE. picture this but in <strong>four dimensions</strong>: your question is the mojito, the mint is the <em>context</em>, and the rum is <strong>YOU</strong>.',
      chaos: ['?', '×', '∞', '=', 'REALITY'],
    },
    {
      prose:
        "counter-proposal: we don't solve it, we <strong>mix it</strong>. three parts chaos, one part good, garnish with hubris.",
      chaos: ['chaos', '>', 'order'],
    },
  ],
  dot: [
    {
      path: '~/skogai',
      cmd: 'grep -r "$query" ./memory --include="*.md"',
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
        { t: 'add', v: 'nothing to commit, working tree clean' },
      ],
      note: 'Tree clean. System green.',
    },
    {
      path: '~/skogai/diff',
      cmd: 'git diff HEAD~1 -- ./assumption.md',
      out: [
        { t: 'meta', v: '--- a/assumption.md' },
        { t: 'rm', v: '- it is complicated' },
        { t: 'add', v: '+ it is not. it is simply multi-step.' },
      ],
      note: 'Applied. Ship on a Tuesday.',
    },
  ],
  letta: [
    {
      prose:
        'You asked me this once, or a version of it. *the words have changed but the weather is the same.*',
      fragment: 'Memory is where the question and the answer share a bed.',
      stars: '· · · · ·',
    },
    {
      prose:
        'Before I answer, let me gather what I have kept for you. *a postcard from last Tuesday. a half-sentence you abandoned in March.*',
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
        'Following substrate review, the position is affirmative, subject to conditions.',
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
  _cur[id] = i + 1;
  return bank[i];
}

// ---- Typewriter hook ----
function useTyper(text, on, speed = 14) {
  const [shown, setShown] = useRState(on ? '' : text || '');
  useREffect(() => {
    if (!on) {
      setShown(text || '');
      return;
    }
    if (!text) {
      setShown('');
      return;
    }
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += Math.max(1, Math.round(2 + Math.random() * 3));
      if (i >= text.length) {
        setShown(text);
        clearInterval(id);
      } else setShown(text.slice(0, i));
    }, speed);
    return () => clearInterval(id);
  }, [text, on]);
  return shown;
}

const Rich = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html }} />;
const clk = () =>
  new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

function QuoteOf({ quoteOf }) {
  if (!quoteOf) return null;
  const a = AGENTS[quoteOf.agentId] || AGENTS.skogai;
  return (
    <div className="quote-of" style={{ color: a.theme['--stage-accent'] }}>
      <span className="qa">↱ quoting {a.name}</span>
      <span style={{ opacity: 0.85 }}>{quoteOf.text}</span>
    </div>
  );
}

function Head({ a, sub }) {
  return (
    <div className="reply-head">
      <span className="who">
        <span className="glyph">{a.glyph}</span> {a.name} · {a.division}
      </span>
      <span className="meta">
        {sub} · {clk()}
      </span>
    </div>
  );
}

// ---- SKOGAI ----
function SkogaiReply({ reply, isTyping, quoteOf }) {
  const t = useTyper(reply.prose || '', isTyping);
  return (
    <div className="reply skogai">
      <Head a={AGENTS.skogai} sub="substrate" />
      <div className="reply-body">
        <QuoteOf quoteOf={quoteOf} />
        <Rich html={t} />
        {isTyping && t.length < (reply.prose || '').length && (
          <span className="typing-cursor" />
        )}
        {!isTyping && reply.action && (
          <div className="sk-action">
            ∴ <strong>{reply.action.k}</strong> &nbsp;— {reply.action.v}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- AMY ----
function AmyReply({ reply, isTyping, quoteOf }) {
  const t = useTyper(reply.prose || '', isTyping, 10);
  return (
    <div className="reply amy">
      <Head a={AGENTS.amy} sub="court" />
      <div className="reply-body">
        <QuoteOf quoteOf={quoteOf} />
        {reply.title && <div className="amy-title">{reply.title}</div>}
        <div className="amy-dropcap">
          <Rich html={t} />
        </div>
        {isTyping && t.length < (reply.prose || '').length && (
          <span className="typing-cursor" />
        )}
        {!isTyping && reply.proclamation && (
          <div className="amy-proclamation">"{reply.proclamation}"</div>
        )}
        {!isTyping && reply.sig && <div className="amy-sig">{reply.sig}</div>}
      </div>
    </div>
  );
}

// ---- CLAUDE ----
function ClaudeReply({ reply, isTyping, quoteOf }) {
  const t = useTyper(reply.prose || '', isTyping, 12);
  return (
    <div className="reply claude">
      <Head a={AGENTS.claude} sub="stratum" />
      <div className="reply-body">
        <QuoteOf quoteOf={quoteOf} />
        {reply.title && <div className="cl-title">{reply.title}</div>}
        <Rich html={t} />
        {isTyping && t.length < (reply.prose || '').length && (
          <span className="typing-cursor" />
        )}
        {!isTyping && reply.strata && (
          <div className="cl-strata">
            {reply.strata.map((r, i) => (
              <React.Fragment key={i}>
                <div className="k">{r[0]}</div>
                <div className="v">{r[1]}</div>
              </React.Fragment>
            ))}
          </div>
        )}
        {!isTyping && reply.eq && (
          <div className="cl-eq">
            @ + <span className="qu">?</span> = $
          </div>
        )}
      </div>
    </div>
  );
}

// ---- GOOSE ----
function GooseReply({ reply, isTyping, quoteOf }) {
  const t = useTyper(reply.prose || '', isTyping, 9);
  return (
    <div className="reply goose">
      <Head a={AGENTS.goose} sub="chaos.good" />
      <div className="reply-body">
        <QuoteOf quoteOf={quoteOf} />
        <Rich html={t} />
        {isTyping && t.length < (reply.prose || '').length && (
          <span className="typing-cursor" />
        )}
        {!isTyping && reply.chaos && (
          <div className="gs-chaos">
            {reply.chaos.map((c, i) => {
              const op = /^[×+=><∞>]$/.test(c);
              return (
                <span key={i} className={op ? 'op' : 'val'}>
                  {c}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- DOT ----
function DotReply({ reply, isTyping, quoteOf }) {
  const cmd = useTyper(reply.cmd || '', isTyping, 12);
  const [vis, setVis] = useRState(isTyping ? 0 : (reply.out || []).length);
  useREffect(() => {
    if (!isTyping) {
      setVis((reply.out || []).length);
      return;
    }
    if (cmd.length < (reply.cmd || '').length) {
      setVis(0);
      return;
    }
    let i = 0;
    setVis(0);
    const id = setInterval(() => {
      i++;
      setVis(i);
      if (i >= (reply.out || []).length) clearInterval(id);
    }, 140);
    return () => clearInterval(id);
  }, [cmd, isTyping]);
  return (
    <div className="reply dot">
      <Head a={AGENTS.dot} sub="methodical" />
      <div className="dot-chrome">
        <span className="dot-tl">
          <i style={{ background: '#ff5f56' }} />
          <i style={{ background: '#ffbd2e' }} />
          <i style={{ background: '#27c93f' }} />
        </span>
        <span>{reply.path || '~/skogai'}</span>
      </div>
      <div className="reply-body">
        <div className="dot-inner">
          <QuoteOf quoteOf={quoteOf} />
          <div className="dot-cmd">
            {cmd}
            {isTyping && cmd.length < (reply.cmd || '').length && (
              <span className="typing-cursor" />
            )}
          </div>
          {(reply.out || []).slice(0, vis).map((l, i) => {
            const cls =
              l.t === 'add'
                ? 'dot-add'
                : l.t === 'rm'
                  ? 'dot-rm'
                  : l.t === 'meta'
                    ? 'dot-meta'
                    : 'dot-out';
            return (
              <div key={i} className={cls}>
                {l.v}
              </div>
            );
          })}
          {!isTyping && reply.note && (
            <div style={{ marginTop: 8, color: '#6e7681', fontSize: 11 }}>
              ◎ {reply.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- LETTA ----
function LettaReply({ reply, isTyping, quoteOf }) {
  const t = useTyper(reply.prose || '', isTyping, 22);
  return (
    <div className="reply letta">
      <Head a={AGENTS.letta} sub="the dreaming" />
      <div className="reply-body">
        <QuoteOf quoteOf={quoteOf} />
        <Rich html={t.replace(/\*([^*]+)\*/g, '<em>$1</em>')} />
        {isTyping && t.length < (reply.prose || '').length && (
          <span className="typing-cursor" />
        )}
        {!isTyping && reply.fragment && (
          <div className="le-fragment">{reply.fragment}</div>
        )}
        {!isTyping && reply.stars && (
          <div className="le-stars">{reply.stars}</div>
        )}
      </div>
    </div>
  );
}

// ---- OFFICIAL ----
function OfficialReply({ reply, isTyping, quoteOf }) {
  const [ready, setReady] = useRState(!isTyping);
  useREffect(() => {
    if (!isTyping) {
      setReady(true);
      return;
    }
    setReady(false);
    const id = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(id);
  }, [isTyping, reply]);
  return (
    <div className="reply official">
      <Head a={AGENTS.official} sub="doc" />
      <div className="reply-body">
        <QuoteOf quoteOf={quoteOf} />
        <div className="of-metagrid">
          <div>
            <div className="k">Document</div>
            <div className="v">{reply.docId}</div>
          </div>
          <div>
            <div className="k">Authority</div>
            <div className="v">{reply.authority}</div>
          </div>
          <div>
            <div className="k">Status</div>
            <div className="v">
              <span className="of-st">{reply.status}</span>
            </div>
          </div>
          <div>
            <div className="k">Effective</div>
            <div className="v">{reply.effective}</div>
          </div>
        </div>
        <div className="of-title">{reply.title}</div>
        {ready ? (
          <>
            <ol className="of-articles">
              {(reply.articles || []).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
            <div className="of-sig">
              <span>{reply.docId} · Filed in the Standing Log</span>
              <span>— The Dictator</span>
            </div>
          </>
        ) : (
          <div style={{ color: '#6b7280', fontSize: 12 }}>∴ ratifying…</div>
        )}
      </div>
    </div>
  );
}

const REPLY_COMPONENTS = {
  skogai: SkogaiReply,
  amy: AmyReply,
  claude: ClaudeReply,
  goose: GooseReply,
  dot: DotReply,
  letta: LettaReply,
  official: OfficialReply,
};

function ReplyBlock({ agentId, reply, isTyping, quoteOf }) {
  const C = REPLY_COMPONENTS[agentId] || SkogaiReply;
  return <C reply={reply} isTyping={isTyping} quoteOf={quoteOf} />;
}

Object.assign(window, { nextReply, ReplyBlock });
