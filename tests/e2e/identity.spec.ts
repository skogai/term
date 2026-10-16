import { expect, test } from '@playwright/test';
import { awaitRoot, bootAndReady, runCmd } from '../fixtures/harness.js';

test.describe('default identity', () => {
  test('id reports skogix with wheel membership', async ({ page }) => {
    await bootAndReady(page);
    expect((await runCmd(page, 'id')).trim()).toBe(
      'uid=1000(skogix) gid=1000(skogix) groups=1000(skogix),998(wheel)'
    );
  });

  test('groups lists skogix and wheel', async ({ page }) => {
    await bootAndReady(page);
    expect((await runCmd(page, 'groups')).trim()).toBe('skogix wheel');
  });

  test('who puts skogix on pts/0', async ({ page }) => {
    await bootAndReady(page);
    expect(await runCmd(page, 'who')).toMatch(/^skogix\s+pts\/0\s/m);
  });

  test('home contents are owned by skogix', async ({ page }) => {
    await bootAndReady(page);
    const out = await runCmd(page, 'ls -la ~');
    for (const name of [
      '.bashrc',
      '.bash_history',
      'about.txt',
      'contact.txt',
    ]) {
      expect(out).toMatch(
        new RegExp(`skogix\\s+skogix\\s.*\\s${name.replace('.', '\\.')}$`, 'm')
      );
    }
    expect(out).not.toMatch(/\bguest\b/);
  });

  test("guest's home is private", async ({ page }) => {
    await bootAndReady(page);
    expect(await runCmd(page, 'ls /home/guest')).toMatch(/Permission denied/);
  });

  test('about and contact still work after becoming root', async ({ page }) => {
    test.setTimeout(60_000);
    await bootAndReady(page);
    await runCmd(page, '/tmp/.pwn');
    expect(await awaitRoot(page)).toBe(true);
    expect(await runCmd(page, 'about')).toMatch(/software abuser/);
    expect(await runCmd(page, 'contact')).toMatch(/github/);
    expect((await runCmd(page, 'echo $LOGNAME')).trim()).toBe('root');
  });
});
