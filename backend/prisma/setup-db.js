const { execSync } = require('child_process');

function isTruthy(value) {
  if (value == null) return false;
  return ['1', 'true', 'yes', 'y', 'on'].includes(String(value).trim().toLowerCase());
}

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

const resetDb = isTruthy(process.env.RESET_DB);
const runSeed = isTruthy(process.env.RUN_SEED);

const pushCommand = resetDb ? 'npx prisma db push --force-reset' : 'npx prisma db push';
run(pushCommand);

if (runSeed) {
  run('node prisma/seed.js');
}
