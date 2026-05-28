import type { PluginInstall } from '../../core/kernel.js';
import { aliasCat } from '../../core/shell.js';
import { asGuest, file } from '../../core/vfs.js';

const aboutText =
  'software abuser since 2000, experience in memes, AI enthusiast and open-source user.\n' +
  'building things that think and occasionally explode.\n' +
  'find me at [github.com/SkogAI](https://github.com/SkogAI)';

const install: PluginInstall = kernel => {
  kernel.vfs.appendDir('/home/guest', {
    'about.txt': asGuest(file(aboutText)),
  });

  kernel.installExecutable('/bin/about', {
    describe: 'who is this',
    exec: aliasCat('~/about.txt'),
  });
};

export default install;
