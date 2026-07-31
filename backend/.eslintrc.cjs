module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: ['eslint:recommended'],
  ignorePatterns: ['node_modules', 'prisma'],
  parserOptions: { ecmaVersion: 'latest' }
};
