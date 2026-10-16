import type { PluginInstall } from '../core/kernel.js';
import {
  asDefaultUser,
  asGuest,
  DEFAULT_USER,
  dir,
  file,
  treeMount,
} from '../core/vfs.js';

const userHome = () =>
  dir(
    {
      '.bashrc': file(
        "# this shell doesn't read me yet. but nice of you to check.\n"
      ),
      '.bash_history': file(
        'ls -la\ncat /etc/passwd\ncd /tmp\nls -a\n/tmp/.pwn\nwhoami\nclear\nsudo su\nrm -rf /\ntheme crt\nexit',
        undefined,
        { mode: 0o600 }
      ),
    },
    { mode: 0o700 }
  );

const buildHome = () =>
  dir({
    [DEFAULT_USER]: asDefaultUser(userHome()),
    guest: asGuest(userHome()),
  });

const install: PluginInstall = kernel => {
  kernel.registerMount(treeMount('/home', buildHome));
};

export default install;
