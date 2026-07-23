import { bold, brightCyan, dim, green } from '../../core/color.js';
import type { PluginInstall } from '../../core/kernel.js';

const bullet = dim('-');
const cmd = brightCyan;
const section = green;

const CONTENT: string[] = [
  '',
  bold('skogix'),
  dim('ai enthusiast · systems tinkerer · open-source enjoyer'),
  '',
  section('background'),
  `${bullet} ai, ml, and the things that make them tick`,
  `${bullet} systems programming (c/c++, low-level tooling)`,
  `${bullet} frontend/backend (typescript, nodejs)`,
  '',
  section('current focus'),
  `${bullet} ai tooling and infrastructure`,
  `${bullet} systems programming`,
  `${bullet} security and exploitation`,
  `${bullet} understanding abstractions by breaking them`,
  '',
  section('approach'),
  `${bullet} prefer understanding systems over using abstractions blindly`,
  `${bullet} build small experiments to internalize concepts`,
  `${bullet} iterate: explore → understand → implement`,
  '',
  section('reach'),
  `${bullet} github:   [github.com/SkogAI](https://github.com/SkogAI)`,
  `${bullet} linkedin: [linkedin.com/in/SkogAI](https://linkedin.com/in/SkogAI)`,
  `${bullet} email:    [hello@skogai.dev](mailto:hello@skogai.dev)`,
  '',
  section('tip'),
  `${bullet} try: ${cmd('about')}, ${cmd('projects')}, ${cmd('help')}`,
  '',
  dim(
    'source code for this terminal lives at [github.com/SkogAI/term](https://github.com/SkogAI/term)'
  ),
];

const install: PluginInstall = kernel => {
  kernel.installExecutable('/bin/welcome', {
    describe: 'portfolio overview',
    exec(ctx) {
      ctx.stdout(CONTENT.join('\n') + '\n');
      return 0;
    },
  });
};

export default install;
