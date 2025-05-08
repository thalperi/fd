import { defineStore } from 'pinia';
import { type ThemeDefinition } from 'vuetify';

// Interface for our custom theme structure
export interface AppTheme extends ThemeDefinition {
  name: string;
}

// Interface for component-specific style overrides
export interface ComponentOverrides {
  [componentKey: string]: { 
    [cssProperty: string]: string; 
  };
}

export interface FullThemeConfiguration {
  name: string;
  vuetifyTheme: ThemeDefinition; 
  componentOverrides: ComponentOverrides; // Use this for specific overrides (non-optional)
  componentBackgrounds: { [componentKey: string]: string }; 
}

interface ThemeStoreState {
  activeThemeName: string | null;
  themes: FullThemeConfiguration[];
}

export const DEFAULT_LIGHT_THEME_NAME = 'Default Light'; 
const DEFAULT_DARK_THEME_NAME = 'Default Dark'; 
const SCRAPED_LEGACY_THEME_NAME = 'Scraped Legacy';
const X_STYLE_DARK_THEME_NAME = 'X Style Dark'; 

// Define keys for button overrides - EXPORT THEM
export const LOAD_DATA_BTN_KEY = 'SymbolManager_LoadDataButton';
export const INTERVAL_BTN_KEY = 'IntervalSelector_ToggleButton'; 

export const defaultLightConfiguration: FullThemeConfiguration = {
  name: DEFAULT_LIGHT_THEME_NAME,
  vuetifyTheme: {
    dark: false,
    colors: {
      primary: '#1976D2', 
      'on-primary': '#FFFFFF',
      secondary: '#BDBDBD', 
      'on-secondary': '#000000', 
      accent: '#82B1FF', 
      'on-accent': '#000000',
      error: '#E53935', 
      'on-error': '#FFFFFF',
      info: '#2196F3', 
      'on-info': '#FFFFFF',
      success: '#4CAF50', 
      'on-success': '#FFFFFF',
      warning: '#FB8C00', 
      'on-warning': '#FFFFFF', 
      background: '#FFFFFF',
      'on-background': '#000000',
      surface: '#FFFFFF',
      'on-surface': '#000000',
    },
  },
  componentOverrides: { 
      [LOAD_DATA_BTN_KEY]: {},
      [INTERVAL_BTN_KEY]: {},
  }, 
  componentBackgrounds: {}, 
};

export const defaultDarkConfiguration: FullThemeConfiguration = {
  name: DEFAULT_DARK_THEME_NAME,
  vuetifyTheme: {
    dark: true,
    colors: {
      primary: '#2196F3', 
      'on-primary': '#FFFFFF',
      secondary: '#B0BEC5', 
      'on-secondary': '#000000',
      accent: '#FF4081', 
      'on-accent': '#FFFFFF',
      error: '#FF5252', 
      'on-error': '#FFFFFF',
      info: '#2196F3', 
      'on-info': '#FFFFFF',
      success: '#4CAF50', 
      'on-success': '#FFFFFF',
      warning: '#FB8C00', 
      'on-warning': '#FFFFFF',
      background: '#121212', 
      'on-background': '#FFFFFF',
      surface: '#1E1E1E', 
      'on-surface': '#FFFFFF',
    },
  },
  componentOverrides: { 
      [LOAD_DATA_BTN_KEY]: {},
      [INTERVAL_BTN_KEY]: {},
  }, 
  componentBackgrounds: {}, 
};

const scrapedLegacyConfiguration: FullThemeConfiguration = {
  name: SCRAPED_LEGACY_THEME_NAME,
  vuetifyTheme: {
    dark: false, 
    colors: {
      primary: '#007bff',       
      'on-primary': '#ffffff',  
      secondary: '#424242',     
      'on-secondary': '#ffffff',
      accent: '#82B1FF',       
      'on-accent': '#000000',  
      error: '#dc3545',         
      'on-error': '#ffffff',    
      info: '#2196F3',         
      'on-info': '#ffffff',    
      success: '#28a745',       
      'on-success': '#ffffff',  
      warning: '#ffc107',       
      'on-warning': '#000000',  
      background: '#f4f4f9',     
      'on-background': '#333333',
      surface: '#ffffff',       
      'on-surface': '#333333',  
    },
  },
  componentOverrides: { 
      [LOAD_DATA_BTN_KEY]: { backgroundColor: '#007bff', color: '#ffffff'}, 
      [INTERVAL_BTN_KEY]: { backgroundColor: '#007bff', color: '#ffffff'}, 
  }, 
  componentBackgrounds: { 
    'SymbolManager': '', 
    'IntervalSelector': '', 
    'ChartView': '', 
    'OpenTradesTable': '', 
    'KlineTable': '', 
    'ToolbarArea': '#ffc107', 
    'ContentArea': '#f4f4f9', 
  },
};

const xStyleDarkConfiguration: FullThemeConfiguration = {
  name: X_STYLE_DARK_THEME_NAME,
  vuetifyTheme: {
    dark: true, 
    colors: {
      primary: '#1D9BF0',       
      'on-primary': '#FFFFFF',
      secondary: '#71767B',     
      'on-secondary': '#FFFFFF',
      accent: '#1D9BF0',        
      'on-accent': '#FFFFFF',
      error: '#F4212E',         
      'on-error': '#FFFFFF',
      info: '#1D9BF0',          
      'on-info': '#FFFFFF',
      success: '#00BA7C',       
      'on-success': '#FFFFFF',
      warning: '#FFAD1F',       
      'on-warning': '#000000',  
      background: '#000000',     
      'on-background': '#E7E9EA',
      surface: '#15202B',       
      'on-surface': '#E7E9EA',  
    },
  },
  componentOverrides: { 
      [LOAD_DATA_BTN_KEY]: {},
      [INTERVAL_BTN_KEY]: {},
  }, 
  componentBackgrounds: {}, 
};


const THEME_STORE_STORAGE_KEY = 'themeStoreState';
const BUILT_IN_THEMES = [
    defaultLightConfiguration, 
    defaultDarkConfiguration, 
    scrapedLegacyConfiguration,
    xStyleDarkConfiguration 
];

// Helper function to ensure nested objects exist when merging/loading
const ensureNestedObjects = (theme: FullThemeConfiguration): FullThemeConfiguration => {
    return {
        ...theme,
        componentOverrides: typeof theme.componentOverrides === 'object' && theme.componentOverrides !== null 
                            ? theme.componentOverrides 
                            : {},
        componentBackgrounds: typeof theme.componentBackgrounds === 'object' && theme.componentBackgrounds !== null 
                            ? theme.componentBackgrounds 
                            : {}, 
    };
};


export const useThemeStore = defineStore('theme', {
  state: (): ThemeStoreState => ({
    activeThemeName: DEFAULT_LIGHT_THEME_NAME,
    themes: BUILT_IN_THEMES.map(ensureNestedObjects), 
  }),
  getters: {
    activeThemeConfig(state): FullThemeConfiguration | undefined {
      return state.themes.find(t => t.name === state.activeThemeName);
    },
    currentVuetifyTheme(state): ThemeDefinition | undefined {
      const active = this.activeThemeConfig;
      return active ? active.vuetifyTheme : defaultLightConfiguration.vuetifyTheme; 
    },
    availableThemeNames(state): string[] {
      return state.themes.map(t => t.name);
    }
  },
  actions: {
    // --- Persistence Actions ---
    loadThemesFromPersistence() {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const storedStateString = localStorage.getItem(THEME_STORE_STORAGE_KEY);
          let loadedUserThemes: FullThemeConfiguration[] = [];
          let persistedActiveName: string | null = null;

          if (storedStateString) {
            const storedState = JSON.parse(storedStateString) as Partial<ThemeStoreState>;
            loadedUserThemes = (storedState.themes || []).filter(
              theme => !BUILT_IN_THEMES.some(b => b.name === theme.name)
            );
            persistedActiveName = storedState.activeThemeName || null;
          }
          
          this.themes = [
              ...BUILT_IN_THEMES.map(ensureNestedObjects), 
              ...loadedUserThemes.map(ensureNestedObjects)
          ];

          this.activeThemeName = persistedActiveName && this.themes.some(t => t.name === persistedActiveName) 
            ? persistedActiveName 
            : DEFAULT_LIGHT_THEME_NAME;
              
        } catch (error) {
          console.error('Error loading theme state from localStorage:', error);
          this.themes = [...BUILT_IN_THEMES.map(ensureNestedObjects)];
          this.activeThemeName = DEFAULT_LIGHT_THEME_NAME;
        }
      }
    },
    persistThemes() {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const userThemes = this.themes.filter(
            theme => !BUILT_IN_THEMES.some(b => b.name === theme.name)
          );
          const stateToPersist = {
            activeThemeName: this.activeThemeName,
            themes: userThemes, 
          };
          localStorage.setItem(THEME_STORE_STORAGE_KEY, JSON.stringify(stateToPersist));
        } catch (error) {
          console.error('Error persisting theme state to localStorage:', error);
        }
      }
    },

    // --- Theme Management Actions ---
    setActiveTheme(themeName: string) {
      const themeExists = this.themes.some(t => t.name === themeName);
      if (themeExists) {
        this.activeThemeName = themeName;
      } else {
        console.warn(`Theme "${themeName}" not found.`);
      }
    },

    saveTheme(themeConfig: FullThemeConfiguration) {
      if (BUILT_IN_THEMES.some(b => b.name === themeConfig.name)) {
          console.warn(`Cannot overwrite built-in theme "${themeConfig.name}". Use 'Save As'.`);
          return;
      }
      const index = this.themes.findIndex(t => t.name === themeConfig.name);
      const themeToSave = ensureNestedObjects(themeConfig); 
      if (index !== -1) {
        this.themes[index] = themeToSave; 
      } else {
        this.themes.push(themeToSave); 
      }
      this.activeThemeName = themeToSave.name; 
      this.persistThemes(); 
    },

    saveThemeAs(newName: string, themeConfigToCopy: FullThemeConfiguration) {
      if (!newName || !newName.trim()) {
         console.error('Cannot save theme with an empty name.');
         return false;
      }
      if (this.themes.some(t => t.name === newName)) {
        console.error(`Theme with name "${newName}" already exists. Choose a different name.`);
        return false; 
      }
       if (BUILT_IN_THEMES.some(b => b.name === newName)) {
          console.warn(`Cannot use the name of a built-in theme: "${newName}".`);
          return false;
      }
      const newTheme: FullThemeConfiguration = ensureNestedObjects(
          JSON.parse(JSON.stringify({...themeConfigToCopy, name: newName})) 
      );
      this.themes.push(newTheme);
      this.activeThemeName = newName; 
      this.persistThemes(); 
      return true; 
    },

    deleteTheme(themeName: string) {
      if (BUILT_IN_THEMES.some(b => b.name === themeName)) {
        console.warn(`Cannot delete built-in theme: "${themeName}".`);
        return;
      }
      const themeToDeleteIndex = this.themes.findIndex(t => t.name === themeName);
      if (themeToDeleteIndex > -1) {
          this.themes.splice(themeToDeleteIndex, 1);
          if (this.activeThemeName === themeName) {
              this.activeThemeName = DEFAULT_LIGHT_THEME_NAME; 
          }
          this.persistThemes(); 
      } else {
          console.warn(`Attempted to delete non-existent theme: "${themeName}"`);
      }
    },

    // Action to update the active theme's configuration
    updateActiveThemeConfiguration(
      newVuetifyTheme?: Partial<ThemeDefinition>, 
      newComponentOverrides?: Partial<ComponentOverrides>, // This is Partial<{ [compKey]: Partial<{ [cssProp]: string }> }>
      newComponentBackgrounds?: Partial<{ [componentKey: string]: string }> 
    ) {
      const activeConfig = this.activeThemeConfig;
      if (activeConfig) {
        let changed = false;
        // Merge Vuetify theme settings
        if (newVuetifyTheme) {
          const currentSimpleTheme = { dark: activeConfig.vuetifyTheme.dark, colors: activeConfig.vuetifyTheme.colors, variables: activeConfig.vuetifyTheme.variables };
          const newSimpleTheme = { 
              dark: newVuetifyTheme.dark ?? currentSimpleTheme.dark, 
              colors: {...currentSimpleTheme.colors, ...(newVuetifyTheme.colors || {})}, 
              variables: {...currentSimpleTheme.variables, ...(newVuetifyTheme.variables || {})}
          };
          if (JSON.stringify(currentSimpleTheme) !== JSON.stringify(newSimpleTheme)) {
              activeConfig.vuetifyTheme = { 
                dark: newSimpleTheme.dark,
                colors: newSimpleTheme.colors,
                variables: newSimpleTheme.variables
              };
              changed = true;
          }
        }

        // Merge component overrides (activeConfig.componentOverrides is guaranteed to exist)
        if (newComponentOverrides) {
          for (const componentKey of Object.keys(newComponentOverrides)) {
            const overrideUpdate = newComponentOverrides[componentKey]; // This is Partial<{ [cssProp]: string }> | undefined
            
            if (overrideUpdate === undefined) { 
              // If the whole component override is set to undefined, delete it
              if (activeConfig.componentOverrides[componentKey]) {
                delete activeConfig.componentOverrides[componentKey];
                changed = true;
              }
              continue; 
            }

            // Ensure the nested object exists for the key
            if (!activeConfig.componentOverrides[componentKey]) {
               activeConfig.componentOverrides[componentKey] = {};
            }

            let nestedChanged = false;
            for(const propKey in overrideUpdate) { // Iterate through cssProperty updates
                if(Object.prototype.hasOwnProperty.call(overrideUpdate, propKey)) {
                    const newValue = overrideUpdate[propKey]; // Value is string | undefined
                    
                    if (newValue === undefined) { 
                        // If the specific CSS property value is undefined, delete it
                        if (activeConfig.componentOverrides[componentKey][propKey] !== undefined) {
                            delete activeConfig.componentOverrides[componentKey][propKey];
                            nestedChanged = true;
                        }
                    } else if (activeConfig.componentOverrides[componentKey][propKey] !== newValue) {
                        // Otherwise, add/update the property
                        activeConfig.componentOverrides[componentKey][propKey] = newValue;
                        nestedChanged = true;
                    }
                }
            }
            // Clean up empty override objects after potential deletions
            if (Object.keys(activeConfig.componentOverrides[componentKey]).length === 0) {
                delete activeConfig.componentOverrides[componentKey];
                // nestedChanged would already be true if we deleted the last property
            }

            if (nestedChanged) changed = true;
          }
        }

        // Merge component backgrounds 
        if (newComponentBackgrounds) {
           for (const key in newComponentBackgrounds) {
             if (Object.prototype.hasOwnProperty.call(newComponentBackgrounds, key)) {
               const newValue = newComponentBackgrounds[key];
               const oldValue = activeConfig.componentBackgrounds[key];
               
               if (typeof newValue === 'string' && newValue !== '' && oldValue !== newValue) {
                 activeConfig.componentBackgrounds[key] = newValue;
                 changed = true;
               } else if ((newValue === undefined || newValue === '') && oldValue !== undefined) {
                 delete activeConfig.componentBackgrounds[key];
                 changed = true;
               }
             }
           }
        }
        
        if (changed) {
            if (!BUILT_IN_THEMES.some(b => b.name === activeConfig.name)) {
                 this.persistThemes();
            }
        }
      }
    }
  },
});

import type { Pinia } from 'pinia';

// Helper to initialize the store on the client-side after app mount
export function initializeThemeStore(piniaInstance?: Pinia) {
  if (typeof window !== 'undefined') {
    const themeStore = useThemeStore(piniaInstance); 
    themeStore.loadThemesFromPersistence();
  }
}
