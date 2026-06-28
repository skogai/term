import { bold } from '../core/color.js';
import type { PluginInstall } from '../core/kernel.js';
import { system } from '../system.js';

const ESC = '\x1b';
const fg256 = (n: number) => (s: string) => `${ESC}[38;5;${n}m${s}${ESC}[39m`;

const treeTop = fg256(76); // bright fresh green — new growth at the crown
const treeMid = fg256(34); // medium green — main foliage
const treeDark = fg256(28); // deep forest green — base of each tier
const trunk = fg256(94); // earthy brown
const labelClr = fg256(34); // green for info labels
const headerClr = fg256(76); // bright green for user@host

// Visual width of the logo column (all lines padded to this)
const LOGO_W = 22;

// Build one logo line: apply color then pad with plain spaces to LOGO_W
const lo = (content: string, clr: (s: string) => string): string =>
  clr(content) + ' '.repeat(Math.max(0, LOGO_W - content.length));

//  A Scandinavian pine (skog = forest)
//  Two foliage tiers, trunk, surface roots — 12 lines
const LOGO: string[] = [
  lo('          ^', treeTop), // crown
  lo('         ^^^', treeTop),
  lo('        ^^^^^', treeMid),
  lo('       ^^^^^^^', treeMid),
  lo('      ^^^^^^^^^', treeDark),
  lo('     ^^^^^^^^^^^', treeDark),
  lo('         ^^^', treeTop), // second tier
  lo('        ^^^^^', treeMid),
  lo('       ^^^^^^^', treeDark),
  lo('      ^^^^^^^^^', treeDark),
  lo('         |||', trunk), // trunk
  lo('       ~~~~~~~', trunk), // surface roots
];

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  parts.push(`${mins} min${mins !== 1 ? 's' : ''}`);
  return parts.join(', ');
}

const label = (s: string): string => bold(labelClr(s));

const install: PluginInstall = kernel => {
  kernel.installExecutable('/bin/neofetch', {
    describe: 'display system info with a forest logo',
    exec(ctx) {
      const id = kernel.identity.current();
      const user = id.name;
      const hostname = id.hostname;
      const title = `${user}@${hostname}`;

      const uptimeR = ctx.fs.read('/proc/uptime');
      const uptimeSec = uptimeR.ok ? parseInt(uptimeR.content, 10) : 0;

      const totalMB = system.hardware.memoryMB;
      const usedMB = totalMB - Math.round(totalMB * 0.83);

      const cpu = system.hardware.cpu;
      // Strip the integrated GPU suffix ("w/ Radeon 890M") from the CPU display name
      const cpuName = cpu.model.replace(/\s+w\/\s+.+$/, '');
      const cpuStr = `${cpuName} (${cpu.threads}) @ ${(cpu.mhz / 1000).toFixed(1)}GHz`;

      // Extract integrated GPU from CPU model string
      const gpuMatch = cpu.model.match(/w\/\s+(.+)$/);
      const gpuStr = gpuMatch ? `AMD ${gpuMatch[1]}` : 'AMD Radeon Graphics';

      // Color swatches — two rows of 8 blocks each
      const swatchRow = (base: number): string =>
        Array.from(
          { length: 8 },
          (_, i) => `${ESC}[${base + i}m   ${ESC}[49m`
        ).join('');

      const INFO: string[] = [
        headerClr(bold(title)),
        headerClr('-'.repeat(title.length)),
        `${label('OS:')}       ${system.os.prettyName} ${system.kernel.arch}`,
        `${label('Kernel:')}   ${system.kernel.version}`,
        `${label('Uptime:')}   ${formatUptime(uptimeSec)}`,
        `${label('CPU:')}      ${cpuStr}`,
        `${label('GPU:')}      ${gpuStr}`,
        `${label('Memory:')}   ${usedMB}MiB / ${totalMB}MiB`,
        `${label('Shell:')}    bash`,
        `${label('Term:')}     [term](https://github.com/SkogAI/term)`,
        '',
        swatchRow(40), // normal colors
      ];

      const count = Math.max(LOGO.length, INFO.length);
      const lines: string[] = [''];

      for (let i = 0; i < count; i++) {
        const left = LOGO[i] ?? ' '.repeat(LOGO_W);
        const right = INFO[i] ?? '';
        lines.push(`${left}  ${right}`);
      }

      // Bright swatch row — indented past the logo column
      lines.push(' '.repeat(LOGO_W + 2) + swatchRow(100));
      lines.push('');

      ctx.stdout(lines.join('\n'));
      return 0;
    },
  });
};

export default install;
