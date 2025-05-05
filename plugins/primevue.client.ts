import { defineNuxtPlugin } from '#app';
import PrimeVue from 'primevue/config';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(PrimeVue, { ripple: true });
    nuxtApp.vueApp.component('TabView', TabView);
    nuxtApp.vueApp.component('TabPanel', TabPanel);
});
