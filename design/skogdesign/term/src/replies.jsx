// Shapeshifter reply blocks — one per agent universe.
const { useState, useEffect } = React;

function useTyper(text, on, speed = 14) {
  const [shown, setShown] = useState(on ? '' : text || '');
  useEffect(() => {
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
  }, [text, on, speed]);
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
              const op = /^[×+=><∞]$/.test(c);
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

function DotReply({ reply, isTyping, quoteOf }) {
  const cmd = useTyper(reply.cmd || '', isTyping, 12);
  const [vis, setVis] = useState(isTyping ? 0 : (reply.out || []).length);
  useEffect(() => {
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
  }, [cmd, isTyping, reply]);
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
            <div style={{ marginTop: 10, color: '#6e7681', fontSize: 11 }}>
              ◎ {reply.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

function OfficialReply({ reply, isTyping, quoteOf }) {
  const [ready, setReady] = useState(!isTyping);
  useEffect(() => {
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

Object.assign(window, { ReplyBlock });
