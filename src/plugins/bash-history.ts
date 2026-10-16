import type { PluginInstall } from '../core/kernel.js';
import { homeOf } from '../core/vfs.js';

// The vfs is rebuilt on every page load and reboot, so each user's
// ~/.bash_history is mirrored to localStorage and written back at boot.
const STORAGE_PREFIX = 'term:bash_history:';
const HISTFILESIZE = 500;
const ROOT_ID = { name: 'root' };

const storage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const historyPath = (user: string) => `${homeOf(user)}/.bash_history`;

const install: PluginInstall = kernel => {
  const restore = () => {
    const store = storage();
    if (!store) {
      return;
    }
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key?.startsWith(STORAGE_PREFIX)) {
        continue;
      }
      const user = key.slice(STORAGE_PREFIX.length);
      const content = store.getItem(key);
      if (content !== null) {
        kernel.vfs.write(historyPath(user), '/', ROOT_ID, content);
      }
    }
  };

  kernel.on('boot-ready', () => {
    restore();
    const user = kernel.identity.current().name;
    const result = kernel.vfs.read(historyPath(user), '/', ROOT_ID);
    if (!result.ok) {
      return;
    }
    const lines = (result.content || '').split('\n').filter(l => l);
    kernel.term.seedHistory(lines);
  });

  // Append like `history -a` after every command: re-read the file first so
  // edits made from inside the shell stick.
  kernel.on('history', ({ line }) => {
    const user = kernel.identity.current().name;
    const path = historyPath(user);
    const prior = kernel.vfs.read(path, '/', ROOT_ID);
    const lines = prior.ok
      ? (prior.content || '').split('\n').filter(l => l)
      : [];
    lines.push(line);
    const content = lines.slice(-HISTFILESIZE).join('\n');
    if (!kernel.vfs.write(path, '/', ROOT_ID, content).ok) {
      return;
    }
    storage()?.setItem(STORAGE_PREFIX + user, content);
  });
};

export default install;
