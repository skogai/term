// ============================================================
// COMMAND EDITOR — full-screen overlay for managing /commands
// ============================================================
const {
  useState: useEditorState,
  useEffect: useEditorEffect,
  useMemo: useEditorMemo,
  useRef: useEditorRef,
} = React;

const EXAMPLE_BODY = `// ctx provides:
//   ctx.args[]         tokens after the command name
//   ctx.raw            everything after command name (string)
//   ctx.agents         read-only AGENTS map
//   ctx.route(q)       returns { primary, panel, scores, reasoning }
//   ctx.ask(id, q)     async: call the current backend for this agent
//   ctx.forceRoute(id, q)  ask agent via scripted / current backend, with routing pill
//   ctx.say(id, prose) quick-emit a reply with just prose
//   ctx.sys(kind,msg)  kind: 'info' | 'error' | 'ok'
//   ctx.theme(id)      reshape the shell
//   ctx.clear()        clear conversation
//   ctx.storage        per-user KV: get(k), set(k,v), all()
//   ctx.log(...)       appears in the Test pane

ctx.sys('ok', 'hello! you have ' + ctx.args.length + ' arguments');`;

function CommandEditor({ onClose }) {
  const [registry, bump] = useEditorState(0);
  useEditorEffect(
    () => window.commandRegistry.subscribe(() => bump(x => x + 1)),
    []
  );

  const list = useEditorMemo(() => window.commandRegistry.list(), [registry]);

  const [selectedName, setSelected] = useEditorState(
    () => list[0]?.name || 'help'
  );
  const selected = useEditorMemo(
    () => window.commandRegistry.get(selectedName),
    [selectedName, registry]
  );

  const [draft, setDraft] = useEditorState(null);
  const [testInput, setTestInput] = useEditorState('');
  const [testLog, setTestLog] = useEditorState([]);
  const [dirty, setDirty] = useEditorState(false);
  const [error, setError] = useEditorState(null);
  const bodyRef = useEditorRef(null);

  // Load selected into draft whenever selection changes.
  useEditorEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft({
      name: selected.name,
      args: selected.args || '',
      desc: selected.desc || '',
      body: selected.body || '',
      source: selected.source,
    });
    setDirty(false);
    setError(null);
  }, [selectedName, registry]);

  const isBuiltin = draft?.source === 'builtin';

  const onNew = () => {
    const base = 'mycmd';
    let n = base,
      i = 2;
    while (window.commandRegistry.get(n)) n = base + i++;
    setDraft({
      name: n,
      args: '',
      desc: 'my custom command',
      body: EXAMPLE_BODY,
      source: 'user',
    });
    setSelected(n);
    setDirty(true);
    setError(null);
  };

  const onSave = () => {
    if (!draft || isBuiltin) return;
    if (!/^[a-z][a-z0-9_-]*$/i.test(draft.name))
      return setError('name must start with a letter, only letters/digits/_/-');
    const compiled = window.compileHandler(draft.body);
    if (compiled.error) return setError('compile error: ' + compiled.error);
    try {
      window.commandRegistry.upsert(draft);
      setDirty(false);
      setError(null);
      setSelected(draft.name);
      setTestLog(l =>
        [{ t: 'ok', v: 'saved · /' + draft.name }, ...l].slice(0, 30)
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const onDelete = () => {
    if (!draft || isBuiltin) return;
    if (!confirm('delete /' + draft.name + '?')) return;
    window.commandRegistry.remove(draft.name);
    const remaining = window.commandRegistry.list();
    setSelected(remaining[0]?.name || 'help');
  };

  const onDuplicate = () => {
    if (!draft) return;
    let n = draft.name + '_copy',
      i = 2;
    while (window.commandRegistry.get(n)) n = draft.name + '_copy' + i++;
    setDraft({ ...draft, name: n, source: 'user' });
    setSelected(n);
    setDirty(true);
  };

  const onTest = async () => {
    if (!draft) return;
    setTestLog([]);
    const compiled = window.compileHandler(draft.body);
    if (compiled.error) {
      setTestLog([{ t: 'err', v: 'compile: ' + compiled.error }]);
      return;
    }
    const logs = [];
    const ctx = buildTestCtx(testInput, l => {
      logs.push(l);
      setTestLog([...logs].reverse().slice(0, 40));
    });
    try {
      setTestLog([{ t: 'run', v: '▸ /' + draft.name + ' ' + testInput }]);
      await compiled.fn(ctx);
      setTestLog(
        [
          ...logs,
          {
            t: 'done',
            v:
              '— finished in ' +
              ((performance.now() - ctx._startedAt) | 0) +
              'ms —',
          },
        ]
          .reverse()
          .slice(0, 40)
      );
    } catch (e) {
      setTestLog(
        [...logs, { t: 'err', v: 'runtime: ' + e.message }]
          .reverse()
          .slice(0, 40)
      );
    }
  };

  // Keyboard shortcuts
  useEditorEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onTest();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (!draft) return null;

  return (
    <div className="cmd-editor">
      <div className="ce-header">
        <div className="ce-title">
          ◇ COMMAND EDITOR ·{' '}
          <span className="ce-hint">ctx-based async handler registry</span>
        </div>
        <div className="ce-actions">
          <button onClick={onNew}>+ NEW</button>
          <button onClick={onClose}>✕ CLOSE · esc</button>
        </div>
      </div>

      <div className="ce-body">
        <aside className="ce-sidebar">
          <div className="ce-sb-head">COMMANDS · {list.length}</div>
          <div className="ce-sb-list">
            {list.map(c => (
              <button
                key={c.name}
                className={
                  'ce-sb-item ' +
                  (c.name === selectedName ? 'on' : '') +
                  ' ' +
                  c.source
                }
                onClick={() => setSelected(c.name)}
              >
                <span className="n">/{c.name}</span>
                <span className="s">{c.source === 'builtin' ? '■' : '◆'}</span>
                <span className="d">{c.desc}</span>
              </button>
            ))}
          </div>
          <div className="ce-legend">
            <span>
              <i className="sq b" /> builtin
            </span>
            <span>
              <i className="sq u" /> user
            </span>
          </div>
        </aside>

        <main className="ce-main">
          <div className="ce-meta">
            <div className="ce-field">
              <label>
                name <span className="sl">/</span>
              </label>
              <input
                value={draft.name}
                disabled={isBuiltin}
                onChange={e => {
                  setDraft({ ...draft, name: e.target.value.toLowerCase() });
                  setDirty(true);
                }}
              />
            </div>
            <div className="ce-field">
              <label>args signature</label>
              <input
                value={draft.args}
                disabled={isBuiltin}
                placeholder="<arg> [opt]"
                onChange={e => {
                  setDraft({ ...draft, args: e.target.value });
                  setDirty(true);
                }}
              />
            </div>
            <div className="ce-field grow">
              <label>description</label>
              <input
                value={draft.desc}
                disabled={isBuiltin}
                onChange={e => {
                  setDraft({ ...draft, desc: e.target.value });
                  setDirty(true);
                }}
              />
            </div>
            <div className="ce-badges">
              <span className={'ce-badge ' + draft.source}>{draft.source}</span>
              {dirty && <span className="ce-badge dirty">● unsaved</span>}
            </div>
          </div>

          <div className="ce-split">
            <div className="ce-code-pane">
              <div className="ce-pane-head">
                <span>handler(ctx) · async</span>
                <span className="ce-hint">⌘S save · ⌘↵ test</span>
              </div>
              <textarea
                ref={bodyRef}
                className="ce-code"
                spellCheck={false}
                value={draft.body}
                disabled={isBuiltin}
                onChange={e => {
                  setDraft({ ...draft, body: e.target.value });
                  setDirty(true);
                  setError(null);
                }}
              />
              {error && <div className="ce-error">⚠ {error}</div>}
              <div className="ce-btnbar">
                <button
                  onClick={onSave}
                  disabled={isBuiltin}
                  className="primary"
                >
                  SAVE
                </button>
                <button onClick={onDuplicate}>DUPLICATE</button>
                <button
                  onClick={onDelete}
                  disabled={isBuiltin}
                  className="danger"
                >
                  DELETE
                </button>
              </div>
            </div>

            <div className="ce-test-pane">
              <div className="ce-pane-head">
                <span>TEST · dry-run in sandbox</span>
                <span className="ce-hint">
                  output stays here, doesn't touch terminal
                </span>
              </div>
              <div className="ce-test-input">
                <span className="prm">/{draft.name}</span>
                <input
                  value={testInput}
                  placeholder="test arguments"
                  onChange={e => setTestInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onTest();
                  }}
                />
                <button onClick={onTest}>RUN</button>
              </div>
              <div className="ce-test-log">
                {testLog.length === 0 && (
                  <div className="ce-log-empty">
                    — run a test to see output —
                  </div>
                )}
                {testLog.map((l, i) => (
                  <div
                    key={i}
                    className={'ce-log-line ce-log-' + (l.t || 'info')}
                  >
                    <span className="ce-log-tag">{l.t}</span>
                    <span className="ce-log-msg">
                      {typeof l.v === 'string' ? l.v : JSON.stringify(l.v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ---- sandboxed ctx for the Test pane ----
function buildTestCtx(rawArgs, onLog) {
  const args = rawArgs.trim() ? rawArgs.trim().split(/\s+/) : [];
  const log = (t, v) => onLog({ t, v });
  const startedAt = performance.now();
  return {
    _startedAt: startedAt,
    args,
    raw: rawArgs,
    query: rawArgs,
    agents: AGENTS,
    route: q => routeAgent(q || rawArgs, AGENT_ORDER),
    ask: async (id, q) => {
      if (!AGENTS[id]) {
        log('err', 'unknown agent: ' + id);
        return;
      }
      log('call', 'ctx.ask → ' + id + ' · "' + (q || '').slice(0, 60) + '"');
      try {
        const reply = await window.backends.call(id, q, { history: [] });
        log(
          'reply',
          AGENTS[id].name +
            ' → ' +
            (
              reply.prose ||
              reply.title ||
              reply.cmd ||
              JSON.stringify(reply)
            ).slice(0, 120)
        );
      } catch (e) {
        log('err', e.message);
      }
    },
    forceRoute: (id, q) => log('emit', 'forceRoute ' + id + ' · ' + q),
    say: (id, prose) =>
      log('emit', 'say(' + id + ') · ' + (prose || '').slice(0, 80)),
    sys: (k, msg) => log(k === 'error' ? 'err' : k, String(msg)),
    theme: id => log('emit', 'theme → ' + id),
    clear: () => log('emit', 'clear()'),
    emit: m => log('emit', JSON.stringify(m).slice(0, 120)),
    openCommandEditor: () => log('emit', 'openCommandEditor()'),
    setBackend: n => log('emit', 'setBackend(' + n + ')'),
    currentBackend: () => window.backends.current,
    exportConfig: () => log('emit', 'exportConfig()'),
    importConfig: () => log('emit', 'importConfig()'),
    resetAll: () => log('emit', 'resetAll()'),
    storage: {
      get: k => {
        const v = window.userStorage.get(k);
        log('storage', 'get(' + k + ') = ' + JSON.stringify(v));
        return v;
      },
      set: (k, v) => {
        window.userStorage.set(k, v);
        log('storage', 'set(' + k + ', ...)');
      },
      all: () => window.userStorage.all(),
    },
    state: { history: [], messages: [] },
    log: (...xs) =>
      log(
        'log',
        xs.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')
      ),
  };
}

window.CommandEditor = CommandEditor;
