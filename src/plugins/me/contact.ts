import type { PluginInstall } from '../../core/kernel.js';
import { aliasCat } from '../../core/shell.js';
import { asDefaultUser, file, HOME } from '../../core/vfs.js';

const contactText =
  'github: [github.com/skogai](https://github.com/skogai)\n' +
  'email: info@skogai.se\n';

const install: PluginInstall = kernel => {
  kernel.vfs.appendDir(HOME, {
    'contact.txt': asDefaultUser(file(contactText)),
  });

  kernel.installExecutable('/bin/contact', {
    describe: 'contact links',
    exec: aliasCat(`${HOME}/contact.txt`),
  });
};

export default install;
