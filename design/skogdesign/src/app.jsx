const { useState, useEffect, useRef, useMemo, useCallback } = React;

const clk = () =>
  new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
let _nid = 1;
const nid = () => 'm' + _nid++;

function useAutocomplete(buffer, caret, cmdNames) {
  return useMemo(() => {
    const before = buffer.slice(0, caret);
    const slashM = /^\/(\w*)$/.exec(before);
    if (slashM) {
      const q = slashM[1].toLowerCase();
      return cmdNames
        .filter(n => n.startsWith(q))
        .map(n => ({
          group: 'COMMANDS',
          key: '/' + n,
          desc: window.commandRegistry.get(n)?.desc || '',
          insert: '/' + n + ' ',
          replaceLen: slashM[0].length,
        }));
    }
    const askM = /^\/(ask|theme)\s+(\w*)$/.exec(before);
    if (askM) {
      const q = askM[2].toLowerCase();
      return AGENT_ORDER.filter(id => id.startsWith(q)).map(id => ({
        group: 'AGENTS',
        key: id,
        desc: AGENTS[id].tagline,
        accent: AGENTS[id].theme['--stage-accent'],
        glyph: AGENTS[id].glyph,
        insert: '/' + askM[1] + ' ' + id + ' ',
        replaceLen: askM[0].length,
      }));
    }
    const mM = /(^|\s)@(\w*)$/.exec(before);
    if (mM) {
      const q = mM[2].toLowerCase();
      const tok = '@' + mM[2];
      return AGENT_ORDER.filter(id => id.startsWith(q)).map(id => ({
        group: 'MENTIONS',
        key: '@' + id,
        desc: AGENTS[id].tagline,
        accent: AGENTS[id].theme['--stage-accent'],
        glyph: AGENTS[id].glyph,
        insert: '@' + id + ' ',
        replaceLen: tok.length,
      }));
    }
    if (before === '')
      return cmdNames.slice(0, 10).map(n => ({
        group: 'COMMANDS',
        key: '/' + n,
        desc: window.commandRegistry.get(n)?.desc || '',
        insert: '/' + n + ' ',
        replaceLen: 0,
      }));
    return [];
  }, [buffer, caret, cmdNames]);
}

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/ {
  scanlines: true,
  typewriter: true,
  routing: true,
  shapeshift: true,
  density: 'often',
  layout: 'stacked',
}; /*EDITMODE-END*/

function applyAgentTheme(id) {
  const a = AGENTS[id];
  if (!a) return;
  const root = document.documentElement;
  Object.entries(a.theme).forEach(([k, v]) => root.style.setProperty(k, v));
}

function TweaksPanel({
  tweaks,
  setTweaks,
  visible,
  openEditor,
  backend,
  setBackend,
}) {
  if (!visible) return null;
  const set = (k, v) => setTweaks(t => ({ ...t, [k]: v }));
  const tog = k => setTweaks(t => ({ ...t, [k]: !t[k] }));
  const Tog = ({ k, label }) => (
    <div
      className={'t-toggle ' + (tweaks[k] ? 'on' : '')}
      onClick={() => tog(k)}
    >
      <span>{label}</span>
      <span className="sw" />
    </div>
  );
  const Opts = ({ k, label, opts }) => (
    <div className="t-row">
      <label>{label}</label>
      <div className="t-opts">
        {opts.map(o => (
          <button
            key={o}
            className={tweaks[k] === o ? 'on' : ''}
            onClick={() => set(k, o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="tweaks">
      <div className="t-head">
        <span>◇ TWEAKS</span>
        <span style={{ color: '#8a8fa8' }}>v0.5</span>
      </div>
      <div className="t-body">
        <div className="t-row">
          <label>backend</label>
          <div className="t-opts">
            {Object.keys(window.BACKENDS).map(n => (
              <button
                key={n}
                className={backend === n ? 'on' : ''}
                onClick={() => setBackend(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button className="t-big" onClick={openEditor}>
          ◆ COMMAND EDITOR · /commands
        </button>
        <Tog k="scanlines" label="scanlines" />
        <Tog k="typewriter" label="typewriter" />
        <Tog k="routing" label="show routing" />
        <Tog k="shapeshift" label="agent reshapes shell" />
        <Opts
          k="density"
          label="chorus density"
          opts={['never', 'sometimes', 'often']}
        />
        <Opts
          k="layout"
          label="reply layout"
          opts={['stacked', 'panel', 'inline']}
        />
      </div>
    </div>
  );
}

function seedMessages() {
  return [
    { id: nid(), kind: 'help' },
    {
      id: nid(),
      kind: 'sysblock',
      head: 'WELCOME',
      body: 'try /commands to add your own · /backend claude to wire a real LLM · /poll to ask all 7 agents at once',
    },
  ];
}

function App() {
  const [messages, setMessages] = useState(() => seedMessages());
  const [buffer, setBuffer] = useState('');
  const [caret, setCaret] = useState(0);
  const [selIdx, setSelIdx] = useState(0);
  const [acOpen, setAcOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [booted, setBooted] = useState(true);
  const [tweakMode, setTweakMode] = useState(false);
  const [tweaks, setTweaks] = useState(DEFAULT_TWEAKS);
  const [activeTheme, setActiveTheme] = useState('skogai');
  const [editorOpen, setEditorOpen] = useState(false);
  const [backend, setBackendState] = useState(window.backends.current);
  const [regVer, setRegVer] = useState(0);
  const inputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(
    () => window.commandRegistry.subscribe(() => setRegVer(v => v + 1)),
    []
  );
  const cmdNames = useMemo(
    () => window.commandRegistry.list().map(c => c.name),
    [regVer]
  );
  const suggestions = useAutocomplete(buffer, caret, cmdNames);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 2600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);
  useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);
  useEffect(() => {
    applyAgentTheme(activeTheme);
  }, [activeTheme]);
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const onMsg = e => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweakMode(true);
      if (e.data.type === '__deactivate_edit_mode') setTweakMode(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const push = useCallback(
    m => setMessages(prev => [...prev, { id: nid(), ...m }]),
    []
  );

  const setBackend = useCallback(
    name => {
      try {
        window.backends.set(name);
        setBackendState(name);
        push({
          kind: 'sysblock',
          head: 'BACKEND',
          body: 'switched to ' + name,
        });
      } catch (e) {
        push({ kind: 'error', text: e.message });
      }
    },
    [push]
  );

  // ---- Build ctx passed to every command handler ----
  const buildCtx = useCallback(
    (args, raw, fullQuery) => {
      const self = {
        args,
        raw,
        query: fullQuery,
        agents: AGENTS,
        route: q => routeAgent(q || raw, AGENT_ORDER),
        ask: async (id, q) => {
          if (!AGENTS[id]) {
            push({ kind: 'error', text: 'unknown agent: ' + id });
            return;
          }
          push({
            kind: 'routing',
            route: {
              primary: id,
              panel: [id],
              scores: { [id]: 99 },
              matched: { [id]: ['/ask'] },
              reasoning: [
                `ctx.ask → ${id.toUpperCase()}`,
                `backend: ${window.backends.current}`,
              ],
            },
          });
          if (tweaks.shapeshift) setActiveTheme(id);
          const reply = await window.backends.call(id, q, {
            history: history.slice(-6).map(h => ({ role: 'user', text: h })),
          });
          push({
            kind: 'reply',
            agentId: id,
            reply,
            isTyping: tweaks.typewriter,
          });
        },
        forceRoute: async (id, q) => {
          await self.ask(id, q);
        },
        say: (id, prose) =>
          push({
            kind: 'reply',
            agentId: id,
            reply: { prose },
            isTyping: tweaks.typewriter,
          }),
        sys: (kind, msg) =>
          push({
            kind: kind === 'error' ? 'error' : 'sysblock',
            head: kind === 'ok' ? 'OK' : kind === 'info' ? 'INFO' : 'SYSTEM',
            body: msg,
            text: msg,
          }),
        theme: id => {
          if (AGENTS[id]) {
            setActiveTheme(id);
            push({
              kind: 'sysblock',
              head: 'SHELL RESHAPED',
              body: 'now channeling ' + AGENTS[id].name,
            });
          }
        },
        clear: () => setMessages([]),
        emit: m => push(m),
        openCommandEditor: () => setEditorOpen(true),
        setBackend: n => setBackend(n),
        currentBackend: () => window.backends.current,
        exportConfig: () => {
          const config = {
            version: 1,
            commands: window.commandRegistry
              .list()
              .filter(c => c.source === 'user')
              .map(({ name, args, desc, body }) => ({
                name,
                args,
                desc,
                body,
              })),
            backend: window.backends.current,
            webhook: window.backends.getWebhook(),
            tweaks,
          };
          const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'skogterm-config.json';
          a.click();
          URL.revokeObjectURL(url);
          push({
            kind: 'sysblock',
            head: 'SAVED',
            body:
              'skogterm-config.json · ' +
              config.commands.length +
              ' user commands',
          });
        },
        importConfig: () => {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = 'application/json';
          inp.onchange = async () => {
            const f = inp.files[0];
            if (!f) return;
            try {
              const cfg = JSON.parse(await f.text());
              (cfg.commands || []).forEach(c =>
                window.commandRegistry.upsert(c)
              );
              if (cfg.backend) {
                window.backends.set(cfg.backend);
                setBackendState(cfg.backend);
              }
              if (cfg.webhook) window.backends.setWebhook(cfg.webhook);
              if (cfg.tweaks) setTweaks(cfg.tweaks);
              push({
                kind: 'sysblock',
                head: 'LOADED',
                body: 'imported ' + (cfg.commands || []).length + ' commands',
              });
            } catch (e) {
              push({ kind: 'error', text: 'import failed: ' + e.message });
            }
          };
          inp.click();
        },
        resetAll: () => {
          window.commandRegistry.reset();
          window.backends.set('scripted');
          setBackendState('scripted');
        },
        storage: {
          get: k => window.userStorage.get(k),
          set: (k, v) => window.userStorage.set(k, v),
          all: () => window.userStorage.all(),
        },
        state: { history: history.slice(), messages: messages.slice() },
        log: (...xs) => console.log('[cmd]', ...xs),
      };
      return self;
    },
    [push, history, messages, tweaks, setBackend]
  );

  const execCommand = useCallback(
    async (name, rest, fullQuery) => {
      const cmd = window.commandRegistry.get(name);
      if (!cmd) {
        push({
          kind: 'error',
          text: 'unknown command: /' + name + ' — try /help',
        });
        return;
      }
      if (!cmd.fn) {
        push({
          kind: 'error',
          text: '/' + name + ' failed to compile: ' + cmd.error,
        });
        return;
      }
      const args = rest.trim() ? rest.trim().split(/\s+/) : [];
      const ctx = buildCtx(args, rest, fullQuery);
      try {
        const compiled = window.compileHandler(cmd.body);
        if (compiled.error) throw new Error(compiled.error);
        await compiled.fn(ctx);
      } catch (e) {
        push({ kind: 'error', text: '/' + name + ' runtime: ' + e.message });
      }
    },
    [buildCtx, push]
  );

  const submit = useCallback(
    async txt => {
      const input = (txt !== undefined ? txt : buffer).trim();
      if (!input) return;
      setHistory(h => [...h, input]);
      setHistIdx(-1);
      setBuffer('');
      setAcOpen(false);

      push({ kind: 'user', text: input, ts: clk() });

      if (input.startsWith('/')) {
        const m = /^\/(\w+)\s*(.*)$/.exec(input);
        const name = m[1];
        const rest = m[2] || '';
        await execCommand(name, rest, input);
        return;
      }

      const mentions = [...input.matchAll(/@(\w+)/g)]
        .map(m => m[1])
        .filter(a => AGENTS[a]);
      if (mentions.length) {
        const uniq = Array.from(new Set(mentions));
        push({
          kind: 'routing',
          route: {
            primary: uniq[0],
            panel: uniq,
            scores: {},
            matched: {},
            reasoning: [
              `@mention → ${uniq.map(x => x.toUpperCase()).join(' + ')}`,
            ],
          },
        });
        if (tweaks.shapeshift) setActiveTheme(uniq[0]);
        for (let i = 0; i < uniq.length; i++) {
          const id = uniq[i];
          const reply = await window.backends.call(id, input, {
            history: history.slice(-6),
          });
          push({
            kind: 'reply',
            agentId: id,
            reply,
            isTyping: tweaks.typewriter,
            quoteOf: i > 0 ? { agentId: uniq[0], text: 'co-addressed' } : null,
          });
        }
        return;
      }

      const route = routeAgent(input, AGENT_ORDER);
      if (tweaks.routing) push({ kind: 'routing', route });
      const density = tweaks.density || 'often';
      const max = density === 'never' ? 1 : density === 'sometimes' ? 2 : 3;
      const panel = route.panel.slice(0, max);
      if (tweaks.shapeshift) setActiveTheme(panel[0]);
      for (let i = 0; i < panel.length; i++) {
        const id = panel[i];
        const reply = await window.backends.call(id, input, {
          history: history.slice(-6),
        });
        const quoteOf =
          i > 0 && Math.random() < 0.5
            ? { agentId: panel[0], text: 'co-routed' }
            : null;
        push({
          kind: 'reply',
          agentId: id,
          reply,
          isTyping: tweaks.typewriter,
          quoteOf,
        });
      }
    },
    [buffer, tweaks, push, execCommand, history]
  );

  const onKey = e => {
    if (acOpen && suggestions.length) {
      if (
        e.key === 'Tab' ||
        (e.key === 'Enter' &&
          suggestions[selIdx] &&
          /^[/@]\w*$/.test(buffer.slice(0, caret).split(/\s/).pop()))
      ) {
        e.preventDefault();
        const s = suggestions[selIdx] || suggestions[0];
        const before = buffer.slice(0, caret - s.replaceLen);
        const after = buffer.slice(caret);
        const next = before + s.insert + after;
        setBuffer(next);
        const nc = before.length + s.insert.length;
        setTimeout(() => inputRef.current?.setSelectionRange(nc, nc), 0);
        setCaret(nc);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelIdx(i => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelIdx(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Escape') {
        setAcOpen(false);
        return;
      }
    }
    if (!acOpen && e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setBuffer(history[next] || '');
      return;
    }
    if (!acOpen && e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      if (histIdx < 0) return;
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(-1);
        setBuffer('');
      } else {
        setHistIdx(next);
        setBuffer(history[next]);
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onChange = e => {
    setBuffer(e.target.value);
    setCaret(e.target.selectionStart || e.target.value.length);
    setSelIdx(0);
    setAcOpen(true);
  };
  const onSelect = e => setCaret(e.target.selectionStart || 0);

  const insertMention = id => {
    const add = '@' + id + ' ';
    const next =
      buffer + (buffer === '' || buffer.endsWith(' ') ? '' : ' ') + add;
    setBuffer(next);
    setTimeout(() => {
      inputRef.current?.focus();
      const p = next.length;
      inputRef.current?.setSelectionRange(p, p);
      setCaret(p);
    }, 0);
  };

  const renderMsg = m => {
    switch (m.kind) {
      case 'user':
        return <UserMsg key={m.id} text={m.text} ts={m.ts} />;
      case 'help':
        return <HelpBlock key={m.id} />;
      case 'agents':
        return <AgentsBlock key={m.id} onPick={insertMention} />;
      case 'status':
        return <StatusBlock key={m.id} />;
      case 'error':
        return <ErrorBlock key={m.id} text={m.text} />;
      case 'sysblock':
        return (
          <div key={m.id} className="sysblock">
            <div className="head">
              <span className="dot" />
              {m.head || 'SYSTEM'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
          </div>
        );
      case 'routing':
        return <RoutingDecision key={m.id} route={m.route} />;
      case 'reply':
        return (
          <ReplyBlock
            key={m.id}
            agentId={m.agentId}
            reply={m.reply}
            isTyping={m.isTyping}
            quoteOf={m.quoteOf}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!booted && <BootSequence />}
      <div className="term-app">
        <div className="term-header">
          <div className="left">
            <span className="brand">SKOGTERM</span>
            <span className="version">
              v0.5 · {AGENTS[activeTheme].short} · backend: {backend}
            </span>
          </div>
          <div className="status">
            <span>
              <span className="sdot" />
              {cmdNames.length} CMDS
            </span>
            <span>
              <span className="sdot" />
              7/7
            </span>
            <span>{clk()}</span>
          </div>
        </div>

        <div className="term-stream" ref={streamRef}>
          {messages.map(renderMsg)}
        </div>

        <div className="term-inputbar">
          <span className="prompt">▸</span>
          <input
            ref={inputRef}
            value={buffer}
            placeholder="type a message · /commands to edit · /backend claude · @agent · tab completes"
            onChange={onChange}
            onSelect={onSelect}
            onKeyDown={onKey}
            onFocus={() => setAcOpen(true)}
            onBlur={() => setTimeout(() => setAcOpen(false), 150)}
            spellCheck={false}
            autoComplete="off"
          />
          <span className="hints">
            <kbd>tab</kbd>ac <kbd>↑</kbd>hist <kbd>↵</kbd>send
          </span>

          {acOpen && suggestions.length > 0 && (
            <div className="autocomplete">
              {(() => {
                const rows = [];
                let last = null;
                suggestions.forEach((s, idx) => {
                  if (s.group !== last) {
                    rows.push(
                      <div className="ac-group" key={'g' + idx}>
                        {s.group}
                      </div>
                    );
                    last = s.group;
                  }
                  rows.push(
                    <div
                      key={idx}
                      className={'ac-item ' + (idx === selIdx ? 'sel' : '')}
                      onMouseDown={e => {
                        e.preventDefault();
                        setSelIdx(idx);
                        setTimeout(() => {
                          const before = buffer.slice(0, caret - s.replaceLen);
                          const after = buffer.slice(caret);
                          const next = before + s.insert + after;
                          setBuffer(next);
                          const nc = before.length + s.insert.length;
                          inputRef.current?.focus();
                          inputRef.current?.setSelectionRange(nc, nc);
                          setCaret(nc);
                        }, 0);
                      }}
                    >
                      <span
                        className="ac-key"
                        style={s.accent ? { color: s.accent } : null}
                      >
                        {s.glyph ? (
                          <span style={{ marginRight: 6 }}>{s.glyph}</span>
                        ) : null}
                        {s.key}
                      </span>
                      <span className="ac-desc">{s.desc}</span>
                    </div>
                  );
                });
                return rows;
              })()}
            </div>
          )}
        </div>
      </div>

      <TweaksPanel
        tweaks={tweaks}
        setTweaks={setTweaks}
        visible={tweakMode}
        openEditor={() => setEditorOpen(true)}
        backend={backend}
        setBackend={setBackend}
      />

      {editorOpen && <CommandEditor onClose={() => setEditorOpen(false)} />}
    </>
  );
}

const _root = ReactDOM.createRoot(document.getElementById('root'));
_root.render(<App />);
