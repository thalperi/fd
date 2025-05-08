<template>
  <v-container fluid> 
    
    <!-- Control Panel Section -->
    <v-sheet border rounded elevation="1" class="pa-4 mb-6">
      <v-row>
        <v-col cols="12">
          <h1>Theme Customization</h1> 
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
             :style="{ color: currentTextColor }"  
           ></v-select>
         </v-col>
         <v-col cols="12" md="8" class="d-flex align-center flex-wrap"> 
           <v-btn color="primary" class="mr-2 mb-2" @click="saveCurrentTheme">Save Current Theme</v-btn> 
           <v-text-field
             v-model="newThemeName"
             label="New Theme Name"
             class="mr-2 mb-2"
             style="max-width: 200px;"
             :style="{ color: currentTextColor }" 
             dense
             outlined
             hide-details
           ></v-text-field>
           <v-btn 
             color="secondary" 
             class="mr-2 mb-2" 
             @click="saveThemeAs" 
             :disabled="!newThemeName.trim()"
             :style="{ color: '#FFFFFF' }"  
            >Save As</v-btn> 
           <v-btn 
             color="error" 
             class="mb-2" 
             @click="deleteCurrentTheme" 
             :disabled="isDefaultThemeSelected"
             :style="{ color: '#000000' }" 
            >Delete</v-btn> 
        </v-col>
      </v-row>
    </v-sheet>

    <!-- Homepage Button Theming Section -->
     <v-sheet border rounded elevation="1" class="pa-4 mb-6">
        <v-row>
          <v-col cols="12"><div class="text-h6">Homepage Button Styles</div></v-col>
        </v-row>
        <v-row>
           <!-- Load Data Button Mockup -->
           <v-col cols="12" md="6">
              <v-sheet outlined rounded class="pa-2 d-flex align-center justify-space-between">
                 <span :style="{ color: currentTextColor }">"Load Data" Button</span>
                 <div>
                    <!-- Background Picker -->
                    <v-menu location="bottom end" :close-on-content-click="false">
                      <template v-slot:activator="{ props }">
                        <v-btn icon size="x-small" variant="tonal" title="Set Background" class="mr-1" v-bind="props"> 
                          <v-icon size="small">mdi-format-color-fill</v-icon> 
                        </v-btn>
                      </template>
                      <v-color-picker
                        :model-value="getButtonOverrideColor(LOAD_DATA_BTN_KEY, 'backgroundColor')"
                        @update:model-value="(newColor) => setButtonOverrideColor(LOAD_DATA_BTN_KEY, 'backgroundColor', newColor)"
                        show-swatches hide-inputs mode="hex" elevation="10"
                      ></v-color-picker>
                    </v-menu>
                    <!-- Text Color Picker -->
                     <v-menu location="bottom end" :close-on-content-click="false">
                      <template v-slot:activator="{ props }">
                        <v-btn icon size="x-small" variant="tonal" title="Set Text Color" v-bind="props"> 
                           <v-icon size="small">mdi-format-color-text</v-icon> 
                        </v-btn>
                      </template>
                       <v-color-picker
                        :model-value="getButtonOverrideColor(LOAD_DATA_BTN_KEY, 'color')"
                        @update:model-value="(newColor) => setButtonOverrideColor(LOAD_DATA_BTN_KEY, 'color', newColor)"
                        show-swatches hide-inputs mode="hex" elevation="10"
                      ></v-color-picker>
                    </v-menu>
                 </div>
              </v-sheet>
           </v-col>
           <!-- Interval Button Mockup -->
            <v-col cols="12" md="6">
              <v-sheet outlined rounded class="pa-2 d-flex align-center justify-space-between">
                 <span :style="{ color: currentTextColor }">Interval Buttons</span>
                 <div>
                    <!-- Background Picker -->
                     <v-menu location="bottom end" :close-on-content-click="false">
                      <template v-slot:activator="{ props }">
                         <v-btn icon size="x-small" variant="tonal" title="Set Background (Inactive)" class="mr-1" v-bind="props"> 
                           <v-icon size="small">mdi-format-color-fill</v-icon> 
                         </v-btn>
                      </template>
                       <v-color-picker
                        :model-value="getButtonOverrideColor(INTERVAL_BTN_KEY, 'backgroundColor')"
                        @update:model-value="(newColor) => setButtonOverrideColor(INTERVAL_BTN_KEY, 'backgroundColor', newColor)"
                        show-swatches hide-inputs mode="hex" elevation="10"
                      ></v-color-picker>
                    </v-menu>
                    <!-- Text Color Picker -->
                     <v-menu location="bottom end" :close-on-content-click="false">
                       <template v-slot:activator="{ props }">
                         <v-btn icon size="x-small" variant="tonal" title="Set Text Color (Inactive)" v-bind="props"> 
                           <v-icon size="small">mdi-format-color-text</v-icon> 
                         </v-btn>
                       </template>
                       <v-color-picker
                        :model-value="getButtonOverrideColor(INTERVAL_BTN_KEY, 'color')"
                        @update:model-value="(newColor) => setButtonOverrideColor(INTERVAL_BTN_KEY, 'color', newColor)"
                        show-swatches hide-inputs mode="hex" elevation="10"
                      ></v-color-picker>
                    </v-menu>
                    <!-- TODO: Add pickers for ACTIVE state background/text if needed -->
                 </div>
              </v-sheet>
           </v-col>
        </v-row>
     </v-sheet>

    <!-- Component Background Mockup Layout -->
    <v-sheet border rounded elevation="1" class="pa-4 mb-6">
       <v-row><v-col><div class="text-h6">Component Backgrounds</div></v-col></v-row>
       <div class="app-layout-mockup"> 
        <div class="toolbar-grid-mockup">
          <v-sheet 
            outlined rounded 
            class="component-placeholder pa-2 d-flex align-center justify-space-between" 
            min-height="60"
            :style="{ backgroundColor: getComponentBgColor('SymbolManager') }"
            >
            <div>
              <div :style="{ color: getContrastColor(getComponentBgColor('SymbolManager')) }">Symbol Manager</div> 
              <code v-if="getComponentBgColor('SymbolManager')" class="text-caption" :style="{ color: getContrastColor(getComponentBgColor('SymbolManager')) }">{{ getComponentBgColor('SymbolManager') }}</code>
            </div>
            <v-menu location="bottom end" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" variant="tonal" title="Set Background" v-bind="props">
                  <v-icon :color="getContrastColor(getComponentBgColor('SymbolManager'))">mdi-palette</v-icon> 
                </v-btn>
              </template>
              <v-color-picker
                :model-value="getComponentBgColor('SymbolManager')"
                @update:model-value="(newColor) => setComponentBgColor('SymbolManager', newColor)"
                show-swatches hide-inputs mode="hex" elevation="10"
              ></v-color-picker>
            </v-menu>
          </v-sheet>
          <v-sheet 
            outlined rounded 
            class="component-placeholder pa-2 d-flex align-center justify-space-between" 
            min-height="60"
            :style="{ backgroundColor: getComponentBgColor('IntervalSelector') }"
            >
            <div>
              <div :style="{ color: getContrastColor(getComponentBgColor('IntervalSelector')) }">Interval Selector</div> 
              <code v-if="getComponentBgColor('IntervalSelector')" class="text-caption" :style="{ color: getContrastColor(getComponentBgColor('IntervalSelector')) }">{{ getComponentBgColor('IntervalSelector') }}</code>
            </div>
             <v-menu location="bottom end" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" variant="tonal" title="Set Background" v-bind="props">
                  <v-icon :color="getContrastColor(getComponentBgColor('IntervalSelector'))">mdi-palette</v-icon> 
                </v-btn>
              </template>
              <v-color-picker
                :model-value="getComponentBgColor('IntervalSelector')"
                @update:model-value="(newColor) => setComponentBgColor('IntervalSelector', newColor)"
                show-swatches hide-inputs mode="hex" elevation="10"
              ></v-color-picker>
            </v-menu>
          </v-sheet>
        </div>
        <div class="content-mockup">
          <v-sheet 
            outlined rounded 
            class="component-placeholder pa-2 d-flex align-center justify-space-between content-section-mockup" 
            min-height="200"
            :style="{ backgroundColor: getComponentBgColor('ChartView') }"
            >
             <div>
               <div :style="{ color: getContrastColor(getComponentBgColor('ChartView')) }">Chart View</div> 
               <code v-if="getComponentBgColor('ChartView')" class="text-caption" :style="{ color: getContrastColor(getComponentBgColor('ChartView')) }">{{ getComponentBgColor('ChartView') }}</code>
             </div>
             <v-menu location="bottom end" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" variant="tonal" title="Set Background" v-bind="props">
                  <v-icon :color="getContrastColor(getComponentBgColor('ChartView'))">mdi-palette</v-icon> 
                </v-btn>
              </template>
              <v-color-picker
                :model-value="getComponentBgColor('ChartView')"
                @update:model-value="(newColor) => setComponentBgColor('ChartView', newColor)"
                show-swatches hide-inputs mode="hex" elevation="10"
              ></v-color-picker>
            </v-menu>
          </v-sheet>
          <v-sheet 
            outlined rounded 
            class="component-placeholder pa-2 d-flex align-center justify-space-between content-section-peer-mockup" 
            min-height="100"
            :style="{ backgroundColor: getComponentBgColor('OpenTradesTable') }"
            >
             <div>
               <div :style="{ color: getContrastColor(getComponentBgColor('OpenTradesTable')) }">Open Trades Table</div> 
               <code v-if="getComponentBgColor('OpenTradesTable')" class="text-caption" :style="{ color: getContrastColor(getComponentBgColor('OpenTradesTable')) }">{{ getComponentBgColor('OpenTradesTable') }}</code>
             </div>
             <v-menu location="bottom end" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" variant="tonal" title="Set Background" v-bind="props">
                  <v-icon :color="getContrastColor(getComponentBgColor('OpenTradesTable'))">mdi-palette</v-icon> 
                </v-btn>
              </template>
              <v-color-picker
                :model-value="getComponentBgColor('OpenTradesTable')"
                @update:model-value="(newColor) => setComponentBgColor('OpenTradesTable', newColor)"
                show-swatches hide-inputs mode="hex" elevation="10"
              ></v-color-picker>
            </v-menu>
          </v-sheet>
          <v-sheet 
            outlined rounded 
            class="component-placeholder pa-2 d-flex align-center justify-space-between content-section-peer-mockup" 
            min-height="100"
            :style="{ backgroundColor: getComponentBgColor('KlineTable') }"
            >
             <div>
               <div :style="{ color: getContrastColor(getComponentBgColor('KlineTable')) }">Kline Table</div> 
               <code v-if="getComponentBgColor('KlineTable')" class="text-caption" :style="{ color: getContrastColor(getComponentBgColor('KlineTable')) }">{{ getComponentBgColor('KlineTable') }}</code>
             </div>
             <v-menu location="bottom end" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" variant="tonal" title="Set Background" v-bind="props">
                  <v-icon :color="getContrastColor(getComponentBgColor('KlineTable'))">mdi-palette</v-icon> 
                </v-btn>
              </template>
              <v-color-picker
                :model-value="getComponentBgColor('KlineTable')"
                @update:model-value="(newColor) => setComponentBgColor('KlineTable', newColor)"
                show-swatches hide-inputs mode="hex" elevation="10"
              ></v-color-picker>
            </v-menu>
          </v-sheet>
        </div>
      </div>
    </v-sheet>

     <v-divider class="my-4"></v-divider>

     <!-- Global Theme Settings (Now Collapsible) -->
       <v-expansion-panels class="mb-4">
         <v-expansion-panel>
           <v-expansion-panel-title>
            Global Theme Settings (Colors, Dark Mode)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
             <!-- Global Theme Color Customization -->
               <v-row v-if="activeThemeConfigObject">
                 <v-col cols="12">
                   <v-switch
                       v-model="editableThemeDarkProperty"
                       label="Dark Mode"
                       @update:model-value="updateThemeDarkProperty"
                       hide-details density="compact" class="mb-2"
                     ></v-switch>
                 </v-col>
                 <v-col
                   v-for="(colorValue, colorName) in activeThemeConfigObject.vuetifyTheme.colors"
                   :key="colorName"
                   cols="12" sm="6" md="4" lg="3"
                 >
                   <v-card elevation="2"> 
                     <v-card-title class="text-capitalize text-caption">{{ colorName }}</v-card-title>
                     <v-card-text>
                       <v-color-picker
                         :model-value="colorValue"
                         @update:model-value="(newColor) => updateThemeColor(colorName as string, newColor)"
                         show-swatches hide-inputs mode="hex"
                         elevation="0" width="100%"
                       ></v-color-picker>
                       <v-text-field
                         :model-value="colorValue"
                         @update:model-value="(newColor) => updateThemeColor(colorName as string, newColor)"
                         class="mt-1" dense outlined hide-details density="compact"
                       ></v-text-field>
                     </v-card-text>
                   </v-card>
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

     <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from 'vue'; 
import { useThemeStore, type FullThemeConfiguration, LOAD_DATA_BTN_KEY, INTERVAL_BTN_KEY } from '~/stores/themeStore'; // Import button keys
import type { ThemeDefinition } from 'vuetify';

const themeStore = useThemeStore();

// Ensure store is initialized (might be redundant if Nuxt plugin handles it well, but safe)
if (process.client && !themeStore.activeThemeName) {
  themeStore.loadThemesFromPersistence();
}

const selectedThemeName = ref(themeStore.activeThemeName);
const newThemeName = ref('');

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
});

const showSnackbar = (text: string, color: string = 'success') => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

// Use a computed property that returns a deep copy for editing, or the direct store object
// For direct modification via color pickers, we need to ensure reactivity triggers store actions.
const activeThemeConfigObject = computed<FullThemeConfiguration | null>(() => {
  if (!themeStore.activeThemeConfig) return null;
  return themeStore.activeThemeConfig;
});

const editableThemeDarkProperty = ref(activeThemeConfigObject.value?.vuetifyTheme.dark || false);

// Computed property for general text color based on theme mode
const currentTextColor = computed(() => {
  return activeThemeConfigObject.value?.vuetifyTheme.dark ? '#FFFFFF' : '#000000';
});

// Helper function to calculate contrast color (black/white) for a given hex background
const getContrastColor = (hexColor: string | undefined | null): string => {
  if (!hexColor) {
    return currentTextColor.value; 
  }
  try {
    let color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
    if (color.length === 3) {
      color = color.split('').map(char => char + char).join('');
    }
    if (color.length !== 6) { 
        throw new Error('Invalid hex color format');
    }
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF'; 
  } catch (e) {
    console.error("Error calculating contrast color for:", hexColor, e);
    return currentTextColor.value; 
  }
};


watch(() => themeStore.activeThemeName, (newName) => {
  selectedThemeName.value = newName;
});

watch(() => activeThemeConfigObject.value?.vuetifyTheme.dark, (newDarkValue) => {
  if (typeof newDarkValue === 'boolean') {
    editableThemeDarkProperty.value = newDarkValue;
  }
}, { immediate: true });


const onThemeSelected = (themeName: string | null) => {
  if (themeName) {
    themeStore.setActiveTheme(themeName);
  }
};

const updateThemeColor = (colorName: string, newColor: string) => {
  if (activeThemeConfigObject.value) {
    const newColors = { ...activeThemeConfigObject.value.vuetifyTheme.colors, [colorName]: newColor };
    themeStore.updateActiveThemeConfiguration({ colors: newColors });
  }
};

const updateThemeDarkProperty = (isDark: boolean | null) => { 
   if (activeThemeConfigObject.value) {
    themeStore.updateActiveThemeConfiguration({ dark: isDark === null ? false : isDark });
  }
};

const saveCurrentTheme = () => {
  console.log('Button Clicked: Save Current'); 
  if (activeThemeConfigObject.value) {
    themeStore.saveTheme(activeThemeConfigObject.value); 
    showSnackbar(`Theme "${activeThemeConfigObject.value.name}" saved successfully!`);
  } else {
    showSnackbar('No active theme to save.', 'error');
  }
};

const saveThemeAs = () => {
  console.log('Button Clicked: Save As'); 
  if (!newThemeName.value.trim()) {
    showSnackbar('Please enter a name for the new theme.', 'warning');
    return;
  }
  if (themeStore.availableThemeNames.includes(newThemeName.value.trim())) {
    showSnackbar(`Theme name "${newThemeName.value.trim()}" already exists.`, 'error');
    return;
  }
  if (activeThemeConfigObject.value) {
    const success = themeStore.saveThemeAs(newThemeName.value.trim(), activeThemeConfigObject.value);
    if (success) {
      showSnackbar(`Theme saved as "${newThemeName.value.trim()}"!`);
      newThemeName.value = ''; 
    } else {
      showSnackbar(`Failed to save theme as "${newThemeName.value.trim()}". Check console.`, 'error');
    }
  } else {
     showSnackbar('No active theme to copy.', 'error');
  }
};

const isDefaultThemeSelected = computed(() => {
  const name = activeThemeConfigObject.value?.name;
  return name === 'Default Light' || name === 'Default Dark' || name === 'Scraped Legacy'; 
});

const deleteCurrentTheme = () => {
  console.log('Button Clicked: Delete Current'); 
  if (activeThemeConfigObject.value && !isDefaultThemeSelected.value) {
    const nameToDelete = activeThemeConfigObject.value.name;
    // TODO: Add confirmation dialog
    themeStore.deleteTheme(nameToDelete);
    showSnackbar(`Theme "${nameToDelete}" deleted.`);
  } else if (isDefaultThemeSelected.value) {
     showSnackbar('Cannot delete default or legacy themes.', 'warning');
  } else {
    showSnackbar('No active theme to delete.', 'error');
  }
};

// --- Component Background Color Helpers ---
const getComponentBgColor = (componentKey: string): string => {
  return activeThemeConfigObject.value?.componentBackgrounds?.[componentKey] || ''; 
};

const setComponentBgColor = (componentKey: string, color: string | null) => {
  if (activeThemeConfigObject.value) {
    const newBackgrounds = { 
      [componentKey]: color || '' 
    };
    themeStore.updateActiveThemeConfiguration(undefined, undefined, newBackgrounds);
  }
};

// --- Button Override Color Helpers ---
const getButtonOverrideColor = (componentKey: string, property: 'backgroundColor' | 'color'): string => {
    return activeThemeConfigObject.value?.componentOverrides?.[componentKey]?.[property] || '';
};

const setButtonOverrideColor = (componentKey: string, property: 'backgroundColor' | 'color', color: string | null) => {
     if (activeThemeConfigObject.value) {
        // Construct the update for the specific property within the component key
        const propUpdate = { [property]: color || undefined }; // Use undefined to signal deletion to the store action

        // Construct the update object for the componentOverrides part of the store action
        const componentUpdate = { [componentKey]: propUpdate };

        // Call the store action
        themeStore.updateActiveThemeConfiguration(undefined, componentUpdate, undefined);
    }
};


onMounted(() => {
  console.log('ThemeCustomization page mounted. Active theme name:', themeStore.activeThemeName);
  console.log('Active theme config:', activeThemeConfigObject.value); 
});

</script>

<style scoped>
/* Styles to mimic the layout of pages/index.vue */
.app-layout-mockup {
   border: 1px dashed grey; 
   padding: 10px;
}

.toolbar-grid-mockup {
  display: grid;
  grid-template-columns: auto auto 1fr; 
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.content-mockup {
  display: grid;
  gap: 16px;
  grid-template-areas: 
    "chart"
    "trades"
    "klines";
}

@media (min-width: 960px) { /* md breakpoint */
  .content-mockup {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "chart trades"
      "chart klines";
  }
  .content-section-mockup { 
    grid-area: chart;
  }
  .content-section-peer-mockup:nth-of-type(1) { 
    grid-area: trades;
  }
  .content-section-peer-mockup:nth-of-type(2) { 
    grid-area: klines;
  }
}

.component-placeholder {
  border: 1px solid rgba(0,0,0,0.1);
}
.component-placeholder .v-icon {
  /* color: inherit; */ /* Let direct binding handle color */
}

/* Styles for the expansion panel content */
.v-card {
  margin-bottom: 16px;
}
.v-color-picker {
  border-radius: 4px; 
}
</style>
