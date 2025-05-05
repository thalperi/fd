export default defineNuxtConfig({
  css: [
    '@primevue/themes/lara/theme.css',
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    'primeflex/primeflex.css'
  ],

  build: {
    transpile: ['primevue']
  },

  vite: {
    esbuild: {
      format: 'esm'
    }
  },

  compatibilityDate: '2025-04-28'
})