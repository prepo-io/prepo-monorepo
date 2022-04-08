module.exports = {
  ...require('config/eslint-frontend'),
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  rules: {
    ...require('config/eslint-frontend').rules,
    'no-param-reassign': 'off',
  },
}
