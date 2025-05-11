export default defineNuxtConfig({
  ssr: false, // Disable Server-Side Rendering
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
  compatibilityDate: '2025-04-28'
})
