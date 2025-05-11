<template>
  <v-sheet border rounded elevation="1" class="pa-4 mb-6">
    <v-row>
      <v-col cols="12">
        <div class="text-h4 mb-2">Theme Customization Controls</div> 
      </v-col>
    </v-row>
    <v-row align="center" class="mb-n2"> 
       <v-col cols="12" md="4">
         <v-select
          v-model="selectedThemeName"
          :items="themeStore.availableThemeNames"
           label="Select Theme"
           outlined
           dense
           hide-details 
           @update:model-value="onThemeSelected"
           class="mb-2"
         ></v-select>
         <v-checkbox
            v-if="activeThemeConfigObject"
            :model-value="activeThemeConfigObject.isBuiltIn"
            @update:model-value="handleToggleBuiltIn"
            label="Built-in" 
            dense
            hide-details
            class="mt-1 built-in-checkbox"
          ></v-checkbox>
       </v-col>
       <v-col cols="12" md="8" class="d-flex align-center flex-wrap"> 
         <v-btn 
           :color="getButtonOverrideStyle(THEME_EDITOR_SAVE_BTN_KEY, 'backgroundColor') || 'primary'" 
           class="mr-2 mb-2 theme-editor-save-button" 
           @click="saveCurrentTheme"
           :disabled="isBuiltInThemeSelected" 
           :style="saveBtnStyles"
          >Save Current Theme</v-btn> 
         <v-text-field
           v-model="newThemeName"
           label="New Theme Name (for Save As)"
           class="mr-2 mb-2"
           style="max-width: 200px;"
           dense
           outlined
           hide-details
         ></v-text-field>
         <v-btn 
           :color="getButtonOverrideStyle(THEME_EDITOR_SAVE_AS_BTN_KEY, 'backgroundColor') || 'secondary'" 
           class="mr-2 mb-2 theme-editor-save-as-button" 
           @click="saveThemeAs" 
           :disabled="!newThemeName.trim()"
           :style="saveAsBtnStyles"
          >Save As</v-btn> 
         <v-btn 
           :color="getButtonOverrideStyle(THEME_EDITOR_DELETE_BTN_KEY, 'backgroundColor') || 'error'" 
           class="mb-2 theme-editor-delete-button" 
           @click="deleteCurrentTheme" 
           :disabled="isBuiltInThemeSelected" 
           :style="deleteBtnStyles"
          >Delete</v-btn> 
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue'; 
import { 
  useThemeStore, 
  type FullThemeConfiguration,
  type ComponentStyleOverride,
  THEME_EDITOR_SAVE_BTN_KEY,
  THEME_EDITOR_SAVE_AS_BTN_KEY,
  THEME_EDITOR_DELETE_BTN_KEY,
  DEFAULT_LIGHT_THEME_NAME,
  DEFAULT_DARK_THEME_NAME,
  SCRAPED_LEGACY_THEME_NAME,
  X_STYLE_DARK_THEME_NAME
} from '~/stores/themeStore'; 
import { useThemeStyleManagement } from '~/composables/useThemeStyleManagement';
import { useNuxtApp } from '#app';
import type { createVuetify } from 'vuetify';

const themeStore = useThemeStore();
const nuxtApp = useNuxtApp();
const vuetifyInstance = nuxtApp.$vuetify as ReturnType<typeof createVuetify>;

const selectedThemeName = ref(themeStore.activeThemeName);
const newThemeName = ref('');

const emit = defineEmits(['show-snackbar']);

const activeThemeConfigObject = computed<FullThemeConfiguration | undefined>(() => {
  return themeStore.activeThemeConfig;
});

const appliedVuetifyThemeIsDark = computed(() => { 
  return vuetifyInstance?.theme?.global?.current?.value?.dark || false;
});

const { getButtonOverrideStyle } = useThemeStyleManagement(activeThemeConfigObject, appliedVuetifyThemeIsDark);

const getDynamicButtonStyles = (buttonKey: string): CSSProperties => {
  const styles: CSSProperties = {};
  const baseBg = getButtonOverrideStyle(buttonKey, 'backgroundColor');
  if (baseBg) { styles.backgroundColor = baseBg; }
  
  const textColor = getButtonOverrideStyle(buttonKey, 'color');
  if (textColor) { styles.color = textColor; } 
  else if (activeThemeConfigObject.value) {
    const colors = activeThemeConfigObject.value.vuetifyTheme.colors;
    const defaultText = appliedVuetifyThemeIsDark.value ? '#FFFFFF' : '#000000';
    if (buttonKey === THEME_EDITOR_SAVE_AS_BTN_KEY) styles.color = colors?.['on-secondary'] || defaultText;
    else if (buttonKey === THEME_EDITOR_DELETE_BTN_KEY) styles.color = colors?.['on-error'] || defaultText;
    else if (buttonKey === THEME_EDITOR_SAVE_BTN_KEY) styles.color = colors?.['on-primary'] || defaultText;
  }

  const hoverBg = getButtonOverrideStyle(buttonKey, 'hoverBackgroundColor');
  if (hoverBg) styles['--theme-editor-btn-hover-bg'] = hoverBg;
  
  const hoverText = getButtonOverrideStyle(buttonKey, 'hoverColor');
  if (hoverText) styles['--theme-editor-btn-hover-text'] = hoverText;
  
  return styles;
};

const saveBtnStyles = computed(() => getDynamicButtonStyles(THEME_EDITOR_SAVE_BTN_KEY));
const saveAsBtnStyles = computed(() => getDynamicButtonStyles(THEME_EDITOR_SAVE_AS_BTN_KEY));
const deleteBtnStyles = computed(() => getDynamicButtonStyles(THEME_EDITOR_DELETE_BTN_KEY));

const isBuiltInThemeSelected = computed(() => { 
  return activeThemeConfigObject.value?.isBuiltIn === true;
});

const isOriginalBuiltInTheme = computed(() => {
    const name = activeThemeConfigObject.value?.name;
    return name === DEFAULT_LIGHT_THEME_NAME || 
           name === DEFAULT_DARK_THEME_NAME || 
           name === SCRAPED_LEGACY_THEME_NAME || 
           name === X_STYLE_DARK_THEME_NAME;
});

watch(() => themeStore.activeThemeName, (newName) => {
  if (newName) selectedThemeName.value = newName;
});

const onThemeSelected = (themeName: string | null) => {
  if (themeName) themeStore.setActiveTheme(themeName); 
};

const handleToggleBuiltIn = (newVal: boolean | null) => {
  if (newVal === null || !activeThemeConfigObject.value) {
    return;
  }
  // The check for original built-in themes preventing unmarking has been removed 
  // to allow full control as per user request.
  // The store action toggleThemeBuiltInStatus might still have safeguards.

  const result = themeStore.toggleThemeBuiltInStatus(activeThemeConfigObject.value.name);
  emit('show-snackbar', { text: result.message || 'Status updated.', color: result.success ? 'success' : 'error' });
};

const saveCurrentTheme = () => {
  if (activeThemeConfigObject.value) {
    if (isBuiltInThemeSelected.value) {
        emit('show-snackbar', { text: `Built-in themes cannot be overwritten. Use 'Save As' to create a new version.`, color: 'warning' });
        return;
    }
    const result = themeStore.saveTheme(activeThemeConfigObject.value); 
    emit('show-snackbar', { text: result.message || 'Theme saved.', color: result.success ? 'success' : 'warning' });
  } else {
    emit('show-snackbar', { text: 'No active theme to save.', color: 'error' });
  }
};

const saveThemeAs = () => {
  const nameToSave = newThemeName.value.trim();
  if (!nameToSave) { emit('show-snackbar', { text: 'Please enter a name for the new theme.', color: 'warning' }); return; }
  if (activeThemeConfigObject.value) {
    const result = themeStore.saveThemeAs(nameToSave, activeThemeConfigObject.value);
    if (result.success) { newThemeName.value = ''; }
    emit('show-snackbar', { text: result.message || 'Theme saved.', color: result.success ? 'success' : 'error' });
  } else {
     emit('show-snackbar', { text: 'No active theme to copy.', color: 'error' });
  }
};

const deleteCurrentTheme = () => {
  if (activeThemeConfigObject.value) {
    if (isBuiltInThemeSelected.value) {
        emit('show-snackbar', { text: `Built-in themes cannot be deleted. You can mark it as not 'Built-in' first if it's not an original built-in theme.`, color: 'warning' });
        return;
    }
    const result = themeStore.deleteTheme(activeThemeConfigObject.value.name); 
    emit('show-snackbar', { text: result.message || 'Theme action processed.', color: result.success ? 'info' : 'warning' });
  } else {
    emit('show-snackbar', { text: 'No active theme to delete.', color: 'error' });
  }
};

</script>

<style scoped>
.built-in-checkbox {
  max-width: fit-content; 
}
.v-btn.theme-editor-save-button:hover {
  background-color: var(--theme-editor-btn-hover-bg, revert);
  color: var(--theme-editor-btn-hover-text, revert);
}
.v-btn.theme-editor-save-as-button:hover {
  background-color: var(--theme-editor-btn-hover-bg, revert);
  color: var(--theme-editor-btn-hover-text, revert);
}
.v-btn.theme-editor-delete-button:hover {
  background-color: var(--theme-editor-btn-hover-bg, revert);
  color: var(--theme-editor-btn-hover-text, revert);
}
</style>
