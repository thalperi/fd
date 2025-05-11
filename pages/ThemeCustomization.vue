<template>
  <v-container fluid> 
    
    <ThemeControlPanel @show-snackbar="handleShowSnackbar" />
    
    <ThemeEditorMainContent /> 

    <v-divider class="my-4"></v-divider>

    <ThemeGlobalSettings />

     <!-- Snackbar for notifications (remains on the page level) -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbarTextColor" variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup lang="ts">
// Import the new components
import ThemeControlPanel from '~/components/theme/ThemeControlPanel.vue';
import ThemeEditorMainContent from '~/components/theme/ThemeEditorMainContent.vue'; 
import ThemeGlobalSettings from '~/components/theme/ThemeGlobalSettings.vue';

import { reactive, onMounted, computed } from 'vue'; 
import { useThemeStore } from '~/stores/themeStore'; 

const themeStore = useThemeStore(); 

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success', 
  timeout: 3000,
});

// Handler for the snackbar event emitted by ThemeControlPanel
const handleShowSnackbar = (payload: { text: string, color?: string }) => {
  snackbar.text = payload.text;
  snackbar.color = payload.color || 'success';
  snackbar.show = true;
};

// Computed property for snackbar action button text color for better contrast
const snackbarTextColor = computed(() => {
  const darkColors = ['error', 'success', 'info', 'primary', 'secondary', 'black']; 
  if (snackbar.color && darkColors.includes(snackbar.color.toLowerCase())) {
    return 'white';
  }
  return undefined; 
});

onMounted(() => {
  if (process.client && !themeStore.activeThemeName) {
    themeStore.loadThemesFromPersistence();
  }
  console.log('ThemeCustomization page mounted. Active theme name:', themeStore.activeThemeName);
});

</script>

<style scoped>
.v-container {
  min-height: 100%; 
}
</style>
