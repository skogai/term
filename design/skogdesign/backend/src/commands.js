// ============================================================
// COMMAND REGISTRY — dynamic, editable, persistable
// ============================================================
// A command entry:
//   { name: 'hello', desc: '...', args: 'name', source: 'builtin'|'user',
//     body: "ctx.reply({...})", handler: function compiled from body }
//
// Each handler is called with ctx:
//   ctx.args      — string[]  tokens after the command name
//   ctx.raw       — string    everything after command name
//   ctx.query     — string    full input string
//   ctx.agents    — object    AGENTS map (read-only view)
//   ctx.route     — (query, agents?) => routing result
//   ctx.ask       — async (agentId, query) => reply from active backend
//   ctx.reply     — (agentId, reply) => emit an agent reply into the stream
//   ctx.say       — (agentId, prose) => quick reply wrapper
//   ctx.sys       — (kind, data?) => emit a system block ('info'|'error'|'ok')
//   ctx.theme     — (agentId) => reshape shell
//   ctx.clear     — () => clear stream
//   ctx.emit      — (msg) => raw push to stream
//   ctx.state     — { history, messages }  read-only snapshot
//   ctx.storage   — { get(k), set(k,v) }   user-scoped localStorage
//   ctx.log       — (...args) => console.log, shown in editor test pane

const LS_COMMANDS = 'skogterm.commands.v1';
const LS_BACKEND = 'skogterm.backend.v1';
const LS_STORAGE = 'skogterm.userstate.v1';

// ---- BUILTINS ----
const BUILTIN_COMMANDS = [
  {
    name: 'help',
    args: '',
    desc: 'Show commands',
    source: 'builtin',
    body: "ctx.emit({ kind: 'help' });",
  },
  {
    name: 'agents',
    args: '',
    desc: 'List agent roster',
    source: 'builtin',
    body: "ctx.emit({ kind: 'agents' });",
  },
  {
    name: 'status',
    args: '',
    desc: 'System status',
    source: 'builtin',
    body: "ctx.emit({ kind: 'status' });",
  },
  {
    name: 'clear',
    args: '',
    desc: 'Clear conversation',
    source: 'builtin',
    body: 'ctx.clear();',
  },
  {
    name: 'commands',
    args: '',
    desc: 'Open the command editor',
    source: 'builtin',
    body: 'ctx.openCommandEditor();',
  },
  {
    name: 'backend',
    args: '[name]',
    desc: 'Switch or show backend',
    source: 'builtin',
    body: "if (ctx.args[0]) { ctx.setBackend(ctx.args[0]); ctx.sys('ok', 'backend → ' + ctx.args[0]); } else ctx.sys('info', 'current backend: ' + ctx.currentBackend());",
  },
  {
    name: 'theme',
    args: '<agent>',
    desc: 'Reshape shell to agent',
    source: 'builtin',
    body: "const id = ctx.args[0]; if (!ctx.agents[id]) return ctx.sys('error', 'unknown agent: ' + (id||'(empty)')); ctx.theme(id);",
  },
  {
    name: 'ask',
    args: '<agent> <query>',
    desc: 'Force-route to an agent',
    source: 'builtin',
    body: "const [id, ...rest] = ctx.args; const q = rest.join(' '); if (!ctx.agents[id]) return ctx.sys('error', 'unknown agent: ' + (id||'(empty)')); ctx.forceRoute(id, q);",
  },
  {
    name: 'save',
    args: '',
    desc: 'Export config as downloadable JSON',
    source: 'builtin',
    body: 'ctx.exportConfig();',
  },
  {
    name: 'load',
    args: '',
    desc: 'Import config from JSON file',
    source: 'builtin',
    body: 'ctx.importConfig();',
  },
  {
    name: 'reset',
    args: '',
    desc: 'Reset commands/backend to defaults',
    source: 'builtin',
    body: "ctx.resetAll(); ctx.sys('ok', 'reset to factory defaults');",
  },
];

// ---- USER COMMAND EXAMPLES (shown on first boot) ----
const SEED_USER_COMMANDS = [
  {
    name: 'debate',
    args: '<topic>',
    desc: 'Make two agents debate a topic',
    source: 'user',
    body: `// Pick two contrasting agents and have them both weigh in.
const topic = ctx.raw.trim();
if (!topic) return ctx.sys('error', 'usage: /debate <topic>');

const a = ctx.route(topic).primary;
// Pick a contrasting agent (never the same as a).
const contrast = { skogai:'amy', amy:'dot', claude:'goose', goose:'official', dot:'letta', letta:'dot', official:'amy' };
const b = contrast[a] || 'claude';

ctx.sys('info', 'DEBATE · ' + ctx.agents[a].name + ' vs ' + ctx.agents[b].name + ' · ' + topic);
await ctx.ask(a, topic);
await ctx.ask(b, 'Counterpoint to ' + ctx.agents[a].name + ' on: ' + topic);`,
  },
  {
    name: 'poll',
    args: '<question>',
    desc: 'Ask ALL agents the same question',
    source: 'user',
    body: `const q = ctx.raw.trim();
if (!q) return ctx.sys('error', 'usage: /poll <question>');
ctx.sys('info', 'POLL · asking all 7 agents');
for (const id of Object.keys(ctx.agents)) {
  await ctx.ask(id, q);
}`,
  },
  {
    name: 'note',
    args: '<text>',
    desc: 'Save a note to local storage',
    source: 'user',
    body: `const text = ctx.raw.trim();
const notes = ctx.storage.get('notes') || [];
if (!text) {
  ctx.sys('info', 'NOTES (' + notes.length + ')\\n' + notes.map((n,i)=>(i+1)+'. '+n).join('\\n') || '(no notes)');
  return;
}
notes.push(text);
ctx.storage.set('notes', notes);
ctx.sys('ok', 'noted · ' + notes.length + ' total');`,
  },
];

// ---- COMPILE handler body string -> async function ----
function compileHandler(body) {
  // Wrap the body as an async function with `ctx` param. Errors during compile
  // are caught so the registry stays intact.
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      'ctx',
      `"use strict"; return (async () => { ${body}\n })();`
    );
    return { fn, error: null };
  } catch (e) {
    return { fn: null, error: e.message };
  }
}

// ---- Registry class, exposed on window ----
class CommandRegistry {
  constructor() {
    this.listeners = new Set();
    this.commands = {};
    this.load();
  }
  load() {
    let user = [];
    try {
      const raw = localStorage.getItem(LS_COMMANDS);
      if (raw) user = JSON.parse(raw);
      else user = SEED_USER_COMMANDS; // first run
    } catch {
      user = SEED_USER_COMMANDS;
    }
    const all = {};
    for (const c of BUILTIN_COMMANDS)
      all[c.name] = { ...c, ...compileHandler(c.body) };
    for (const c of user)
      all[c.name] = { ...c, source: 'user', ...compileHandler(c.body) };
    this.commands = all;
  }
  persist() {
    const user = Object.values(this.commands)
      .filter(c => c.source === 'user')
      .map(({ name, args, desc, body }) => ({ name, args, desc, body }));
    localStorage.setItem(LS_COMMANDS, JSON.stringify(user));
    this.emit();
  }
  list() {
    return Object.values(this.commands).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  get(name) {
    return this.commands[name];
  }
  upsert(entry) {
    const existing = this.commands[entry.name];
    if (existing && existing.source === 'builtin')
      throw new Error('cannot overwrite builtin: ' + entry.name);
    const compiled = compileHandler(entry.body);
    this.commands[entry.name] = { ...entry, source: 'user', ...compiled };
    this.persist();
    return this.commands[entry.name];
  }
  remove(name) {
    const c = this.commands[name];
    if (!c) return;
    if (c.source === 'builtin') throw new Error('cannot delete builtin');
    delete this.commands[name];
    this.persist();
  }
  reset() {
    localStorage.removeItem(LS_COMMANDS);
    this.load();
    this.emit();
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit() {
    for (const fn of this.listeners) fn();
  }
}

// ---- User-scoped storage helper for command handlers ----
const userStorage = {
  _load() {
    try {
      return JSON.parse(localStorage.getItem(LS_STORAGE) || '{}');
    } catch {
      return {};
    }
  },
  _save(o) {
    localStorage.setItem(LS_STORAGE, JSON.stringify(o));
  },
  get(k) {
    return this._load()[k];
  },
  set(k, v) {
    const o = this._load();
    o[k] = v;
    this._save(o);
  },
  all() {
    return this._load();
  },
  clear() {
    localStorage.removeItem(LS_STORAGE);
  },
};

window.commandRegistry = new CommandRegistry();
window.userStorage = userStorage;
window.LS_COMMANDS = LS_COMMANDS;
window.LS_BACKEND = LS_BACKEND;
window.LS_STORAGE = LS_STORAGE;
window.compileHandler = compileHandler;
