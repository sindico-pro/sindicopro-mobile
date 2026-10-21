const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['src/lib/graphql/__generated__/**', 'graphql/**', 'coverage/**'],
  },
])
