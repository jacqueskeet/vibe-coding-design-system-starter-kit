/**
 * Build runner — executes pnpm install, build, and test with inline spinners.
 */

import { spawnSync } from 'child_process';

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Run a shell command with a spinner indicator.
 * @param {string} label  — displayed next to spinner
 * @param {string} cmd    — shell command to execute
 * @param {string} cwd    — working directory
 * @returns {{ success: boolean, stdout: string, stderr: string }}
 */
function runWithSpinner(label, cmd, cwd) {
  process.stdout.write(`  ${SPINNER[0]} ${label}...`);

  let frame = 0;
  const interval = setInterval(() => {
    frame = (frame + 1) % SPINNER.length;
    process.stdout.write(`\r  ${SPINNER[frame]} ${label}...`);
  }, 80);

  const result = spawnSync(cmd, {
    shell: true,
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  clearInterval(interval);

  const success = result.status === 0;
  const icon = success ? '✓' : '✗';
  const suffix = success ? '' : ' (failed)';
  process.stdout.write(`\r  ${icon} ${label}${suffix}\n`);

  return {
    success,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

/**
 * Run the full setup sequence: install → build → test.
 *
 * @param {string}  root     — absolute path to repo root
 * @param {boolean} hasTests — whether to run the test step
 * @returns {{ success: boolean, failedPhase: string|null, error: string|null }}
 */
export function runSetup(root, hasTests) {
  console.log('\n  Setting up...\n');

  // 1. pnpm install — fatal if fails
  const install = runWithSpinner(
    'Installing dependencies',
    'pnpm install --no-frozen-lockfile',
    root
  );
  if (!install.success) {
    return {
      success: false,
      failedPhase: 'pnpm install',
      error: install.stderr || install.stdout,
    };
  }

  // 2. pnpm build — fatal if fails
  const build = runWithSpinner('Building everything', 'pnpm build', root);
  if (!build.success) {
    return {
      success: false,
      failedPhase: 'pnpm build',
      error: build.stderr || build.stdout,
    };
  }

  // 3. pnpm -w test — warn if fails, not fatal
  if (hasTests) {
    const test = runWithSpinner('Running tests', 'pnpm -w test', root);
    if (!test.success) {
      console.log(
        '\n  ⚠  Some tests failed. Run `pnpm -w test` for details.\n'
      );
    }
  }

  return { success: true, failedPhase: null, error: null };
}
