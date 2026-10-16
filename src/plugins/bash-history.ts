import type { PluginInstall } from '../core/kernel.js';
import { HOME } from '../core/vfs.js';

const install: PluginInstall = kernel => {
  kernel.on('boot-ready', () => {
    const result = kernel.vfs.read(`${HOME}/.bash_history`, '/', {
      name: 'root',
    });
    if (!result.ok) {
      return;
    }
    const lines = (result.content || '').split('\n').filter(l => l);
    kernel.term.seedHistory(lines);
  });
};

export default install;
