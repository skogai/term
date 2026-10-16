import type { PluginInstall } from '../core/kernel.js';
import { dir, file, treeMount } from '../core/vfs.js';
import { system } from '../system.js';

const install: PluginInstall = kernel => {
  const buildEtc = () =>
    dir({
      passwd: file(
        'root:x:0:0:chop wood:/root:/bin/bash\n' +
          'daemon:x:1:1:carry water:/usr/sbin:/usr/sbin/nologin\n' +
          'skogix:x:1000:1000:SkogAI:/home/skogix:/bin/bash\n' +
          'guest:x:1001:1001:just visiting:/home/guest:/bin/bash'
      ),
      group: file(
        'root:x:0:root\n' +
          'daemon:x:1:\n' +
          'wheel:x:998:skogix\n' +
          'skogix:x:1000:\n' +
          'guest:x:1001:'
      ),
      shadow: file(
        'root:$6$rounds=656000$saltsalt$kFz9R3qPbMiDjqwHzkx1:19854:0:99999:7:::\n' +
          'daemon:*:19854:0:99999:7:::\n' +
          'skogix:$6$skogix$qK4xR7mNpPvYbTz0sK8d:19854:0:99999:7:::\n' +
          'guest:$6$guest$Wq3xR7mNpPvYbTz0sK8d:19854:0:99999:7:::',
        undefined,
        { mode: 0o600 }
      ),
      hostname: file(kernel.identity.current().hostname),
      motd: file(
        'before enlightenment, chop wood, carry water.\nafter enlightenment, chop wood, carry water.'
      ),
      'os-release': file(
        `NAME="${system.os.name}"\n` +
          `PRETTY_NAME="${system.os.prettyName}"\n` +
          `ID=${system.os.id}\n` +
          `BUILD_ID=${system.os.buildId}\n` +
          `HOME_URL="${system.os.homeUrl}"`
      ),
      'resolv.conf': file(`nameserver ${system.network.nameserver}`),
    });

  kernel.registerMount(treeMount('/etc', buildEtc));
};

export default install;
