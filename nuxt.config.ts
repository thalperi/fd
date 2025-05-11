export default defineNuxtConfig({
  ssr: true, // Enable Server-Side Rendering
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
  plugins: [
    '~/plugins/pinia.ts',    // Run Pinia setup first
    '~/plugins/vuetify.ts'   // Run Vuetify setup second
  ],
  // app.head section with inline script and style is removed
  compatibilityDate: '2025-04-28'
})
