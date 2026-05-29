import type { PluginInstall } from '../../core/kernel.js';
import { aliasCat } from '../../core/shell.js';
import { asGuest, file } from '../../core/vfs.js';

const contactText =
  'github: [github.com/SkogAI](https://github.com/SkogAI)\n' +
  'email: skogai@proton.me\n';

const install: PluginInstall = kernel => {
  kernel.vfs.appendDir('/home/guest', {
    'contact.txt': asGuest(file(contactText)),
  });

  kernel.installExecutable('/bin/contact', {
    describe: 'contact links',
    exec: aliasCat('~/contact.txt'),
  });
};

export default install;
