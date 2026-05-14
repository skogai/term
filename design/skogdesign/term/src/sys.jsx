// Routing decision, sys blocks (help/agents/status), user message row, boot.
function RoutingDecision({ route }) {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const steps = route.reasoning.length;
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i >= steps) clearInterval(id);
      else setStep(i);
    }, 320);
    return () => clearInterval(id);
  }, [route]);
  const prim = AGENTS[route.primary];
  return (
    <div className="routing">
      <div className="title">
        <span className="pulse" />
        ROUTING · STEP {step + 1}/{route.reasoning.length}
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

function HelpBlock() {
  const cmds = [
    ['/ask <agent> <query>', 'Force-route to a specific agent'],
    ['/agents', 'List all agents and their vibes'],
    ['/status', 'System status · online agents · uptime'],
    ['/theme <agent>', "Reshape the whole terminal to an agent's universe"],
    ['/clear', 'Clear the conversation'],
    ['/help', 'This screen'],
  ];
  return (
    <div className="sysblock">
      <div className="head">
        <span className="dot" />
        SKOGTERM · HELP
      </div>
      <div className="grid">
        {cmds.map(([k, v], i) => (
          <React.Fragment key={i}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 12, color: '#8a8fa8', fontSize: 12 }}>
        ∴ freeform messages auto-route · tab completes · ↑↓ history · @mentions
        force-address
      </div>
    </div>
  );
}

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
      <div style={{ marginTop: 10, color: '#8a8fa8', fontSize: 11 }}>
        ∴ click to @mention · type{' '}
        <span style={{ color: '#d4a01a' }}>/ask &lt;agent&gt;</span> · type{' '}
        <span style={{ color: '#d4a01a' }}>/theme &lt;agent&gt;</span> to
        reshape the shell
      </div>
    </div>
  );
}

function StatusBlock() {
  const rows = [
    ['substrate', <span className="ok">ONLINE</span>],
    ['router', <span className="ok">ONLINE · topic+heuristic v0.4</span>],
    ['memory lake', <span className="ok">1,247 entries · 4.2 GB indexed</span>],
    ['agents online', '7 / 7'],
    ['uptime', '41 days · 7h · 12m'],
    ['last deploy', 'a1b2c3d · feat(router): chorus mode'],
  ];
  return (
    <div className="sysblock">
      <div className="head">
        <span className="dot" />
        SYSTEM STATUS
      </div>
      <div className="grid">
        {rows.map(([k, v], i) => (
          <React.Fragment key={i}>
            <div className="k">{k}</div>
            <div className="v">{v}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

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

function BootSequence() {
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
  return (
    <div className="boot">
      <div className="logo">SKOGTERM</div>
      <div className="line">booting skogterm · v0.4 · node 04</div>
      {lines.map((l, i) => (
        <div className="line" key={i}>
          {l}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  RoutingDecision,
  UserMsg,
  HelpBlock,
  AgentsBlock,
  StatusBlock,
  ErrorBlock,
  BootSequence,
});
