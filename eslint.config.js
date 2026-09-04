// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // supabase/functions/ es Deno, no Node: otro runtime, otra resolución de
    // módulos (jsr:, npm: specifiers) y su propio linter (ver deno.json ahí).
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'supabase/functions/**'],
  },
]);
