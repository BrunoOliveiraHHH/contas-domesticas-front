module.exports = {
  root: true,
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential'],
  rules: {
    'no-unused-vars': 'warn'
  }
}
