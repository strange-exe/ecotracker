import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),

  // ── Source Files ──────────────────────────────────────────────────────────
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['src/__tests__/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Warn on console.log to prevent debug output reaching production.
      // console.warn and console.error are still permitted.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── Test Files ────────────────────────────────────────────────────────────
  {
    files: ['src/__tests__/**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Vitest globals — scoped to test files only
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
]);

