module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
  ],
  plugins: ['import', '@typescript-eslint'],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: '.',
      },
    },
  },
  rules: {
    // Typescript
    '@typescript-eslint/explicit-function-return-type': 'error',
  },
  // overrides: [
  //   {
  //     env: {
  //       jest: true,
  //     },
  //     files: ['**/__tests__/**/*.[jt]s', '**/?(*.)+(spec|test).[jt]s'],
  //     extends: ['plugin:jest/recommended'],
  //   },
  // ],
  ignorePatterns: ['**/*.js', 'node_modules', '.turbo', 'dist'],
}
