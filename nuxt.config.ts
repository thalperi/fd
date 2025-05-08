export default defineNuxtConfig({
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/css/global.css',
  ],
  build: {
    transpile: ['vuetify']
  },
  vite: {
    css: {},
    esbuild: {
      format: 'esm'
    }
  },
  // Plugins in the 'plugins/' directory are auto-registered.
  // The explicit entry for '~/plugins/vuetify.ts' is no longer needed
  // and was causing an error as the file was renamed to '02.vuetify.ts'.
  // Explicitly define plugin order now that numbered prefixes are removed.
  plugins: [
    '~/plugins/pinia.ts',    // Run Pinia setup first
    '~/plugins/vuetify.ts'   // Run Vuetify setup second
  ], 
  compatibilityDate: '2025-04-28'
})
