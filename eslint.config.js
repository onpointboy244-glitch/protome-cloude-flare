import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // Frontend (React + JSX) — JSX parser on for all .jsx files
  {
    files: ['**/*.jsx'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Client-side .js modules (src/)
  {
    files: ['src/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
  },
  // Server / API / build scripts (Node.js globals, no JSX)
  {
    files: ['api/**/*.js', 'server/**/*.js', 'scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
  },
])
