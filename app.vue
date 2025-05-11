<template>
  <v-app :key="appKey">
    <!-- Remove the 'dark' prop to let the app bar follow the global theme -->
    <v-app-bar app color="primary"> 
      <v-toolbar-title>Financial Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <NuxtLink to="/" custom v-slot="{ navigate }">
        <v-btn @click="navigate"> <!-- Use NuxtLink for navigation -->
          Home
        </v-btn>
      </NuxtLink>
      <NuxtLink to="/ThemeCustomization" custom v-slot="{ navigate }">
        <v-btn @click="navigate"> <!-- Use NuxtLink for navigation -->
          Theme Editor
        </v-btn>
      </NuxtLink>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <!-- NuxtPage will render the content of your pages -->
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// Imports for specific components like SymbolManager, ChartView, etc.,
// should now be in the respective page components (e.g., pages/index.vue)
// or a layout if they are part of a reusable layout structure.

// Global setup like klineStore initialization can remain if truly global,
// or be moved to a more appropriate plugin or composable if tied to specific functionalities.
import { useKlineStore } from '~/stores/klineStore'
import { useThemeStore } from '~/stores/themeStore'; // Import theme store
import { onMounted, computed } from 'vue' // Import computed

const klineStore = useKlineStore()
const themeStore = useThemeStore();

const appKey = computed(() => {
  const activeConfig = themeStore.activeThemeConfig;
  if (!activeConfig) return 'v-app-default-key'; // Fallback key
  // This key will change if the theme name changes OR if its dark status changes.
  return `v-app-${activeConfig.name}-${activeConfig.vuetifyTheme.dark}`;
});

onMounted(() => {
  // This initialization might be better suited for the klineStore itself
  // or a dedicated plugin if it needs to run on app startup.
  // Restore the initialization call
  if (process.client) {
    klineStore.initializeStore()
  }
})
</script>

<style scoped>
/* Scoped styles for app.vue can remain if they apply to v-app, v-main, etc. */
/* The colorful background styles might conflict with themes, consider removing or adjusting them. */
/* For example: */
/*
.app {
  background-color: #007bff;
}

.main {
  background-color: #28a745;
}

.container {
  background-color: #dc3545;
}
*/
</style>
