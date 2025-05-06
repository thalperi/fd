import { defineNuxtPlugin } from '#app'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    defaults: {
      VSlideGroup: {
        mobileBreakpoint: 0 // Disable mobile behavior by setting to 0
      }
    }
  })
  nuxtApp.vueApp.use(vuetify)
})
