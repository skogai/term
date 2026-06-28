import type { PluginInstall } from '../../core/kernel.js';
import { file } from '../../core/vfs.js';

const install: PluginInstall = kernel => {
  kernel.vfs.appendDir('/root', {
    'flag.txt': file(
      '[pwn.college/hacker/123598](https://pwn.college/hacker/123598)\n',
      undefined,
      { owner: 'root', group: 'root', mode: 0o600 }
    ),
  });
};

export default install;
