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
  plugins: ['~/plugins/vuetify.ts'],
  compatibilityDate: '2025-04-28'
})
