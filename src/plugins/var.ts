import type { PluginInstall } from '../core/kernel.js';
import { dir, file, treeMount } from '../core/vfs.js';
import { system } from '../system.js';

const install: PluginInstall = kernel => {
  const hostname = kernel.identity.current().hostname;

  const buildVar = () =>
    dir({
      log: dir({
        syslog: file(
          `[  0.000000] Linux version ${system.kernel.version}\n` +
            `[  0.123456] Booting ${hostname} ...\n` +
            `[  1.234567] ${system.hardware.storage.partitions[1]}: mounted successfully\n` +
            `[  1.345678] ${system.hardware.storage.partitions[2]}: mounted successfully\n` +
            '[  2.456789] All systems nominal'
        ),
        // Lore: someone brute-forces root, then gets in as guest and pokes
        // at sudo. The guest-owned /tmp/.pwn is what they left behind.
        'auth.log': file(
          `Apr 16 03:14:07 ${hostname} sshd[1337]: Failed password for root from 192.168.1.42 port 22 ssh2\n` +
            `Apr 16 03:14:12 ${hostname} sshd[1337]: Failed password for root from 192.168.1.42 port 22 ssh2\n` +
            `Apr 16 03:14:15 ${hostname} sudo: guest : user NOT in sudoers ; TTY=pts/0 ; PWD=/home/guest ; COMMAND=/bin/bash\n` +
            `Apr 16 03:14:20 ${hostname} sshd[1337]: Accepted publickey for guest from 10.0.0.1 port 22 ssh2`
        ),
      }),
    });

  kernel.registerMount(treeMount('/var', buildVar));
};

export default install;
