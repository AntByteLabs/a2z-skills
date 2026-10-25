import js from '@eslint/js';
import globals from 'globals';
import astro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';

const shared = {
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  // TypeScript resolves globals and ambient types; ESLint cannot see them.
  'no-undef': 'off',
  'no-console': 'off',
  eqeqeq: ['error', 'smart'],
  'prefer-const': 'error',
};

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.wrangler/**',
      'node_modules/**',
      'worker-configuration.d.ts',
      '.lighthouseci/**',
    ],
  },
  js.configs.recommended,
  // Brings its own parser for .astro files.
  ...astro.configs.recommended,
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: shared,
  },
  {
    files: ['**/*.astro'],
    rules: shared,
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node, ...globals.es2024 },
    },
    rules: shared,
  },
  {
    // lighthouserc.cjs and anything else CommonJS.
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.es2024 },
    },
    rules: shared,
  },
];
