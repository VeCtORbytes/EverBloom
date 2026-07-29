module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'import'],
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': 'error',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Engine cannot import Gameplay, Worlds, or Content
          {
            target: './src/engine',
            from: './src/gameplay',
            message: 'Layer Violation: Engine cannot import from Gameplay.',
          },
          {
            target: './src/engine',
            from: './src/worlds',
            message: 'Layer Violation: Engine cannot import from Worlds.',
          },
          {
            target: './src/engine',
            from: './src/content',
            message: 'Layer Violation: Engine cannot import from Content.',
          },
          // Gameplay cannot import Worlds
          {
            target: './src/gameplay',
            from: './src/worlds',
            message: 'Layer Violation: Gameplay cannot import from Worlds.',
          },
          // Content cannot import Engine, Gameplay, or Worlds
          {
            target: './src/content',
            from: './src/engine',
            message: 'Layer Violation: Content cannot import from Engine.',
          },
          {
            target: './src/content',
            from: './src/gameplay',
            message: 'Layer Violation: Content cannot import from Gameplay.',
          },
          {
            target: './src/content',
            from: './src/worlds',
            message: 'Layer Violation: Content cannot import from Worlds.',
          },
        ],
      },
    ],
  },
};
