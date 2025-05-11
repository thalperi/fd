<template>
  <v-expansion-panels class="mb-4" v-model="panelModel">
    <v-expansion-panel>
      <v-expansion-panel-title> 
        Global Theme Settings (Colors, Dark Mode, Charts)
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row v-if="activeThemeConfigObject">
          <!-- Column 1: Lists of Color Names -->
          <v-col cols="12" md="3">
            <div class="text-subtitle-2 mb-1">Set App & UI Colors:</div>
            <v-list dense nav class="color-name-list mb-3" :style="{ maxHeight: '260px', overflowY: 'auto' }" density="compact">
              <v-list-item
                v-for="colorName in vuetifyColorKeys" 
                :key="'vuetify-' + colorName"
                @click="selectedColorKey = colorName; selectedColorType = 'vuetify'"
                :active="selectedColorKey === colorName && selectedColorType === 'vuetify'"
                :title="formatColorName(colorName)"
                density="compact"
                color="primary"
              >
                <template v-slot:append>
                  <v-sheet :color="activeThemeConfigObject.vuetifyTheme.colors![colorName]" height="14" width="14" border rounded class="mr-1"></v-sheet>
                </template>
              </v-list-item>
            </v-list>

            <div class="text-subtitle-2 mb-1 mt-2">Set Chart Colors:</div>
            <v-list dense nav class="color-name-list" :style="{ maxHeight: '130px', overflowY: 'auto' }" density="compact">
              <v-list-item
                v-for="colorName in chartColorKeys" 
                :key="'chart-' + colorName"
                @click="selectedColorKey = colorName; selectedColorType = 'chart'"
                :active="selectedColorKey === colorName && selectedColorType === 'chart'"
                :title="formatColorName(colorName)"
                density="compact"
                color="primary"
              >
                <template v-slot:append>
                  <v-sheet :color="activeThemeConfigObject.chartTheme![colorName as keyof ChartThemeColors]" height="14" width="14" border rounded class="mr-1"></v-sheet>
                </template>
              </v-list-item>
            </v-list>
          </v-col>

          <!-- Column 2: Color Picker & Text Field -->
          <v-col cols="12" md="6" v-if="selectedColorDetails">
            <div class="text-subtitle-1 mb-2">
              Editing: {{ formatColorName(selectedColorKey) }} ({{ selectedColorType === 'vuetify' ? 'UI' : 'Chart' }})
            </div>
            <v-color-picker
              :model-value="selectedColorDetails.value"
              @update:model-value="(newColor) => updateSelectedColor(newColor)"
              show-swatches
              hide-inputs
              mode="hex"
              elevation="0"
              width="100%"
              class="mb-2"
            ></v-color-picker>
            <v-text-field
              :model-value="selectedColorDetails.value"
              @update:model-value="(newColor) => updateSelectedColor(newColor)"
              density="compact"
              outlined
              hide-details
            ></v-text-field>
          </v-col>
          
          <!-- Column 3: Preview Swatch -->
          <v-col cols="12" md="3" v-if="selectedColorDetails" class="d-flex flex-column align-center">
             <div class="text-caption mb-1">Preview:</div>
             <v-sheet 
                :color="selectedColorDetails.value" 
                height="60" 
                width="100%" 
                rounded 
                class="elevation-1 d-flex align-center justify-center mb-1">
                <span :style="{ color: getContrastForColor(selectedColorDetails.value) }">
                  Aa
                </span>
             </v-sheet>
             <code>
                {{ selectedColorDetails.value }}
             </code>
          </v-col>
        </v-row>
        <v-row v-if="activeThemeConfigObject">
             <v-col cols="12" class="mt-4">
               <v-switch
                   v-model="editableThemeDarkProperty"
                   label="Dark Mode for this Theme"
                   @update:model-value="updateThemeDarkProperty"
                   hide-details density="compact" class="mb-2"
                   :color="appliedVuetifyThemeIsDark ? undefined : 'primary'"
                 ></v-switch>
             </v-col>
        </v-row>
        <v-row v-else>
          <v-col>
            <p>No active theme configuration found.</p> 
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'; 
import { useThemeStore, type FullThemeConfiguration, type ChartThemeColors } from '~/stores/themeStore'; 
import { useNuxtApp } from '#app';
import type { createVuetify } from 'vuetify';
import type { ThemeDefinition } from 'vuetify';

const themeStore = useThemeStore();
const nuxtApp = useNuxtApp();
const vuetifyInstance = nuxtApp.$vuetify as ReturnType<typeof createVuetify>;

const activeThemeConfigObject = computed<FullThemeConfiguration | undefined>(() => {
  return themeStore.activeThemeConfig;
});

const appliedVuetifyThemeIsDark = computed(() => {
  return vuetifyInstance?.theme?.global?.current?.value?.dark || false;
});

const editableThemeDarkProperty = ref(activeThemeConfigObject.value?.vuetifyTheme.dark || false);
const panelModel = ref([0]); 

const vuetifyColorKeys = computed(() => {
  return activeThemeConfigObject.value?.vuetifyTheme?.colors ? Object.keys(activeThemeConfigObject.value.vuetifyTheme.colors) : [];
});

const chartColorKeys = computed(() => {
  return activeThemeConfigObject.value?.chartTheme ? Object.keys(activeThemeConfigObject.value.chartTheme) : [];
});

const selectedColorKey = ref<string | null>(null);
const selectedColorType = ref<'vuetify' | 'chart' | null>(null);

watch(activeThemeConfigObject, (newConfig) => {
  if (newConfig) {
    const vKeys = newConfig.vuetifyTheme?.colors ? Object.keys(newConfig.vuetifyTheme.colors) : [];
    const cKeys = newConfig.chartTheme ? Object.keys(newConfig.chartTheme) : [];
    
    let currentKeyStillValid = false;
    if (selectedColorKey.value && selectedColorType.value) {
        if (selectedColorType.value === 'vuetify' && vKeys.includes(selectedColorKey.value)) {
            currentKeyStillValid = true;
        } else if (selectedColorType.value === 'chart' && cKeys.includes(selectedColorKey.value)) {
            currentKeyStillValid = true;
        }
    }

    if (!currentKeyStillValid) { 
      if (vKeys.length > 0) {
        selectedColorKey.value = vKeys[0];
        selectedColorType.value = 'vuetify';
      } else if (cKeys.length > 0) {
        selectedColorKey.value = cKeys[0];
        selectedColorType.value = 'chart';
      } else {
        selectedColorKey.value = null;
        selectedColorType.value = null;
      }
    }
  } else {
    selectedColorKey.value = null;
    selectedColorType.value = null;
  }

  if (typeof newConfig?.vuetifyTheme?.dark === 'boolean') {
     editableThemeDarkProperty.value = newConfig.vuetifyTheme.dark;
  }
}, { immediate: true, deep: true });


const selectedColorDetails = computed(() => {
  if (!selectedColorKey.value || !activeThemeConfigObject.value || !selectedColorType.value) return null;
  
  const key = selectedColorKey.value;
  if (selectedColorType.value === 'vuetify' && activeThemeConfigObject.value.vuetifyTheme.colors && key in activeThemeConfigObject.value.vuetifyTheme.colors) {
    return { type: 'vuetify', value: activeThemeConfigObject.value.vuetifyTheme.colors[key] };
  }
  if (selectedColorType.value === 'chart' && activeThemeConfigObject.value.chartTheme && key in activeThemeConfigObject.value.chartTheme) {
    return { type: 'chart', value: activeThemeConfigObject.value.chartTheme[key as keyof ChartThemeColors] };
  }
  return null;
});

const formatColorName = (name: string | null): string => { 
  if (!name) return 'Select a Color'; 
  if (name.startsWith('on-')) {
    return `On ${name.substring(3).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
  }
  return name.replace(/([A-Z0-9])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const getContrastForColor = (hexColor: string | undefined | null): string => {
  if (!hexColor) return appliedVuetifyThemeIsDark.value ? '#FFFFFF' : '#000000';
  try {
    let color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
    if (color.length === 3) color = color.split('').map(char => char + char).join('');
    if (color.length !== 6) return '#000000'; 
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF'; 
  } catch (e) {
    return '#000000'; 
  }
};

const updateSelectedColor = (newColor: string) => {
    if (!selectedColorKey.value || !activeThemeConfigObject.value || !selectedColorType.value) return;

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
        console.warn(`Invalid hex color format entered: ${newColor} for ${selectedColorKey.value}`);
        return; 
    }

    const key = selectedColorKey.value;
    if (selectedColorType.value === 'vuetify') {
        const updatedColors = { 
          ...(activeThemeConfigObject.value.vuetifyTheme.colors || {}), 
          [key]: newColor 
        };
        themeStore.updateActiveThemeConfiguration({ colors: updatedColors });
    } else if (selectedColorType.value === 'chart') {
        const updatedChartColors: Partial<ChartThemeColors> = {
            [key as keyof ChartThemeColors]: newColor
        };
        themeStore.updateActiveThemeConfiguration(undefined, undefined, undefined, updatedChartColors);
    }
};

const updateThemeDarkProperty = (isDark: boolean | null) => { 
   if (activeThemeConfigObject.value) {
    themeStore.updateActiveThemeConfiguration({ dark: isDark === null ? false : isDark });
  }
};
</script>

<style scoped>
.v-color-picker {
  border-radius: 4px; 
}
.color-name-list {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}
.color-name-list :deep(.v-list-item.v-list-item--density-compact) {
    min-height: 20px;
    padding-top: 0;
    padding-bottom: 0;
    padding-inline-start: 4px;
    padding-inline-end: 4px;
}
.color-name-list :deep(.v-list-item__content) {
    padding-top: 0px;
    padding-bottom: 0px;
}
.color-name-list :deep(.v-list-item-title) {
    font-size: 0.7rem;
    line-height: 0.8rem;
}
.color-name-list :deep(.v-list-item__append) {
    align-items: center;
    padding-inline-start: 4px;
}
.color-name-list :deep(.v-list-item__append .v-list-item__spacer) {
    width: 2px;
}
</style>
