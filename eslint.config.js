const reactNative = require('@react-native/eslint-config/flat');
const { fixupConfigRules } = require('@eslint/compat');
const prettier = require('eslint-plugin-prettier/recommended');
const detox = require('eslint-plugin-detox');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/vendor/**',
      'lib/**',
      'docs/**',
      '**/build/**',
      '**/Pods/**',
    ],
  },
  // The preset's Flow plugin still uses the ESLint 8 rule API.
  ...fixupConfigRules(reactNative),
  prettier,
  {
    files: ['e2e/**/*.js'],
    languageOptions: {
      globals: {
        ...detox.environments.detox.globals,
        describe: 'readonly',
        it: 'readonly',
      },
    },
  },
];
