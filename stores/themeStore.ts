import { defineStore } from 'pinia';
import { type ThemeDefinition } from 'vuetify';
import { useCookie } from '#app'; // For Nuxt 3

// --- Interfaces ---
export interface AppTheme extends ThemeDefinition {
  name: string;
}
export interface ComponentStyleOverride {
  backgroundColor?: string;
  color?: string;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  fontFamily?: string;
  fontSize?: string; 
  fontWeight?: string | number; 
  fontStyle?: string; 
}
export interface ComponentOverrides {
  [componentKey: string]: ComponentStyleOverride; 
}
export interface ChartThemeColors {
  chartBackground: string;
  chartGridColor: string;
  chartTextColor: string;
  chartCandleUp: string;
  chartCandleDown: string;
  chartCandleWick: string;
  tooltipBackground: string;
  tooltipTextColor: string;
}
export interface FullThemeConfiguration {
  name: string;
  isBuiltIn?: boolean; 
  vuetifyTheme: ThemeDefinition; 
  componentOverrides: ComponentOverrides; 
  componentBackgrounds: { [componentKey: string]: string }; 
  chartTheme: ChartThemeColors; 
}

interface ThemeStoreState {
  activeThemeName: string; 
  themes: FullThemeConfiguration[];
  themeVersion: number;
}

// --- Constants ---
export const DEFAULT_LIGHT_THEME_NAME = 'Default Light'; 
export const DEFAULT_DARK_THEME_NAME = 'Default Dark'; 
export const SCRAPED_LEGACY_THEME_NAME = 'Scraped Legacy';
export const X_STYLE_DARK_THEME_NAME = 'X Style Dark'; 

export const LOAD_DATA_BTN_KEY = 'SymbolManager_LoadDataButton';
export const INTERVAL_BTN_KEY = 'IntervalSelector_ToggleButton'; 
export const INTERVAL_BTN_ACTIVE_KEY = 'IntervalSelector_ToggleButton_Active'; 
export const THEME_EDITOR_SAVE_BTN_KEY = 'ThemeEditor_SaveButton';
export const THEME_EDITOR_SAVE_AS_BTN_KEY = 'ThemeEditor_SaveAsButton';
export const THEME_EDITOR_DELETE_BTN_KEY = 'ThemeEditor_DeleteButton';

const COMPONENT_STYLE_OVERRIDE_KEYS: ReadonlyArray<keyof ComponentStyleOverride> = [
  'backgroundColor', 'color', 'hoverBackgroundColor', 'hoverColor',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
];

const defaultChartColorsLight: ChartThemeColors = {
  chartBackground: '#FFFFFF', chartGridColor: 'rgba(0, 0, 0, 0.1)', chartTextColor: '#666666',
  chartCandleUp: '#26A69A', chartCandleDown: '#EF5350', chartCandleWick: '#BDBDBD',
  tooltipBackground: 'rgba(0, 0, 0, 0.8)', tooltipTextColor: '#FFFFFF',
};

const defaultChartColorsDark: ChartThemeColors = {
  chartBackground: '#1E1E1E', chartGridColor: 'rgba(255, 255, 255, 0.1)', chartTextColor: '#B0BEC5',
  chartCandleUp: '#26A69A', chartCandleDown: '#EF5350', chartCandleWick: '#787878', 
  tooltipBackground: 'rgba(20, 20, 20, 0.9)', tooltipTextColor: '#E0E0E0',
};

const initialComponentOverrides: ComponentOverrides = {
  [LOAD_DATA_BTN_KEY]: { hoverBackgroundColor: '#E0E0E0', hoverColor: '#000000' },
  [INTERVAL_BTN_KEY]: {}, [INTERVAL_BTN_ACTIVE_KEY]: {},
  [THEME_EDITOR_SAVE_BTN_KEY]: {}, [THEME_EDITOR_SAVE_AS_BTN_KEY]: {}, [THEME_EDITOR_DELETE_BTN_KEY]: {},
};

const defaultLightConfigurationObject: FullThemeConfiguration = { 
  name: DEFAULT_LIGHT_THEME_NAME,
  isBuiltIn: true,
  vuetifyTheme: { 
    dark: false, 
    colors: { 
      primary: '#82B1FF', 'on-primary': '#000000', 
      secondary: '#BDBDBD', 'on-secondary': '#000000',
      accent: '#1976D2', 'on-accent': '#FFFFFF', error: '#E53935', 'on-error': '#FFFFFF', 
      info: '#2196F3', 'on-info': '#FFFFFF', success: '#4CAF50', 'on-success': '#FFFFFF', 
      warning: '#FB8C00', 'on-warning': '#000000', background: '#FFFFFF', 'on-background': '#000000', 
      surface: '#FFFFFF', 'on-surface': '#000000'
    },
    variables: { 'hover-opacity': 0.04, 'focus-opacity': 0.08, 'activated-opacity': 0.08 }
  },
  componentOverrides: { ...initialComponentOverrides, [LOAD_DATA_BTN_KEY]: { hoverBackgroundColor: '#6C9EFF', hoverColor: '#000000' }}, 
  componentBackgrounds: {}, 
  chartTheme: defaultChartColorsLight,
};

const defaultDarkConfigurationObject: FullThemeConfiguration = { 
  name: DEFAULT_DARK_THEME_NAME,
  isBuiltIn: true,
  vuetifyTheme: { 
    dark: true, 
    colors: { 
      primary: '#2196F3', 'on-primary': '#FFFFFF', 
      secondary: '#37474F', 'on-secondary': '#FFFFFF', 
      accent: '#FF4081', 'on-accent': '#FFFFFF', 
      error: '#FF5252', 'on-error': '#FFFFFF', 
      info: '#2196F3', 'on-info': '#FFFFFF', 
      success: '#4CAF50', 'on-success': '#FFFFFF', 
      warning: '#FB8C00', 'on-warning': '#FFFFFF', 
      background: '#121212', 'on-background': '#FFFFFF', 
      surface: '#1E1E1E', 'on-surface': '#FFFFFF' 
    },
    variables: { 'hover-opacity': 0.08, 'focus-opacity': 0.12, 'activated-opacity': 0.12 }
  },
  componentOverrides: { ...initialComponentOverrides, [LOAD_DATA_BTN_KEY]: { hoverBackgroundColor: '#1976D2', hoverColor: '#FFFFFF' }},
  componentBackgrounds: {}, 
  chartTheme: defaultChartColorsDark, 
};

const scrapedLegacyConfigurationObject: FullThemeConfiguration = { 
  name: SCRAPED_LEGACY_THEME_NAME,
  isBuiltIn: true,
  vuetifyTheme: { 
    dark: false, 
    colors: { 
      primary: '#007bff', 'on-primary': '#ffffff', secondary: '#424242', 'on-secondary': '#ffffff', 
      accent: '#82B1FF', 'on-accent': '#000000', error: '#dc3545', 'on-error': '#ffffff', 
      info: '#2196F3', 'on-info': '#ffffff', success: '#28a745', 'on-success': '#ffffff', 
      warning: '#ffc107', 'on-warning': '#000000', background: '#f4f4f9', 'on-background': '#333333', 
      surface: '#ffffff', 'on-surface': '#333333' 
    }, 
  },
  componentOverrides: { 
      ...initialComponentOverrides,
      [LOAD_DATA_BTN_KEY]: { backgroundColor: '#007bff', color: '#ffffff', hoverBackgroundColor: '#0069d9', hoverColor: '#ffffff'}, 
      [INTERVAL_BTN_KEY]: { backgroundColor: '#007bff', color: '#ffffff'}, 
      [INTERVAL_BTN_ACTIVE_KEY]: {}, 
  }, 
  componentBackgrounds: { 'SymbolManager': '', 'IntervalSelector': '', 'ChartView': '', 'OpenTradesTable': '', 'KlineTable': '', 'ToolbarArea': '#ffc107', 'ContentArea': '#f4f4f9', },
  chartTheme: defaultChartColorsLight, 
};

const xStyleDarkConfigurationObject: FullThemeConfiguration = { 
  name: X_STYLE_DARK_THEME_NAME,
  isBuiltIn: true,
  vuetifyTheme: { 
    dark: true, 
    colors: { 
      primary: '#1D9BF0', 'on-primary': '#FFFFFF', 
      secondary: '#71767B', 'on-secondary': '#FFFFFF', 
      accent: '#1D9BF0', 'on-accent': '#FFFFFF', 
      error: '#F4212E', 'on-error': '#FFFFFF', 
      info: '#1D9BF0', 'on-info': '#FFFFFF', 
      success: '#00BA7C', 'on-success': '#FFFFFF', 
      warning: '#FFAD1F', 'on-warning': '#FFFFFF', 
      background: '#000000', 'on-background': '#E7E9EA', 
      surface: '#15202B', 'on-surface': '#E7E9EA' 
    }, 
  },
  chartTheme: { 
      chartBackground: '#000000', chartGridColor: 'rgba(255, 255, 255, 0.08)', chartTextColor: '#71767B', 
      chartCandleUp: '#00BA7C', chartCandleDown: '#F4212E', chartCandleWick: '#71767B', 
      tooltipBackground: 'rgba(21, 32, 43, 0.9)', tooltipTextColor: '#E7E9EA',
  },
  componentOverrides: { ...initialComponentOverrides, [LOAD_DATA_BTN_KEY]: { hoverBackgroundColor: '#1A8CD8', hoverColor: '#FFFFFF' }}, 
  componentBackgrounds: {}, 
};

const BUILT_IN_THEMES_DEFINITIONS: ReadonlyArray<FullThemeConfiguration> = [ 
  defaultLightConfigurationObject, 
  defaultDarkConfigurationObject, 
  scrapedLegacyConfigurationObject, 
  xStyleDarkConfigurationObject 
];

const THEME_STORE_STORAGE_KEY = 'themeStoreState'; // For localStorage (full theme objects)
const ACTIVE_THEME_NAME_COOKIE_KEY = 'active-theme-name'; // For cookie (just the active theme name)

const getBuiltInThemeByName = (name: string): FullThemeConfiguration | undefined => {
    return BUILT_IN_THEMES_DEFINITIONS.find(t => t.name === name);
};

const baseLightForEnsure = defaultLightConfigurationObject; 
const baseDarkForEnsure = defaultDarkConfigurationObject;

const ensureFullThemeObject = (themePartial: Partial<FullThemeConfiguration>, baseName?: string): FullThemeConfiguration => {
  const name = themePartial.name || baseName || 'Unnamed Theme';
  const isDark = themePartial.vuetifyTheme?.dark || false;
  const baseBuiltInThemeForDefaults = getBuiltInThemeByName(name) || (isDark ? baseDarkForEnsure : baseLightForEnsure);
  return {
    name: name,
    isBuiltIn: themePartial.isBuiltIn || BUILT_IN_THEMES_DEFINITIONS.some(spt => spt.name === name),
    vuetifyTheme: { 
        dark: isDark,
        colors: { ...baseBuiltInThemeForDefaults.vuetifyTheme.colors, ...(themePartial.vuetifyTheme?.colors || {}) },
        variables: { ...baseBuiltInThemeForDefaults.vuetifyTheme.variables, ...(themePartial.vuetifyTheme?.variables || {}) },
    },
    componentOverrides: { ...initialComponentOverrides, ...baseBuiltInThemeForDefaults.componentOverrides, ...(themePartial.componentOverrides || {}) },
    componentBackgrounds: { ...baseBuiltInThemeForDefaults.componentBackgrounds, ...(themePartial.componentBackgrounds || {}) }, 
    chartTheme: { ...(isDark ? defaultChartColorsDark : defaultChartColorsLight), ...baseBuiltInThemeForDefaults.chartTheme, ...(themePartial.chartTheme || {}) },
  };
};

export const useThemeStore = defineStore('theme', {
  state: (): ThemeStoreState => ({
    activeThemeName: DEFAULT_LIGHT_THEME_NAME, 
    themes: BUILT_IN_THEMES_DEFINITIONS.map(config => ensureFullThemeObject(config, config.name)),
    themeVersion: 0,
  }),
  getters: { 
    activeThemeConfig(state): FullThemeConfiguration | undefined {
      return state.themes.find(t => t.name === state.activeThemeName);
    },
    currentVuetifyTheme(state): ThemeDefinition | undefined {
      const active = this.activeThemeConfig;
      const fallbackTheme = getBuiltInThemeByName(DEFAULT_LIGHT_THEME_NAME) || BUILT_IN_THEMES_DEFINITIONS[0];
      return active ? active.vuetifyTheme : fallbackTheme.vuetifyTheme; 
    },
    availableThemeNames(state): string[] {
      return state.themes.map(t => t.name);
    }
  },
  actions: {
    loadThemesFromPersistence() { 
      let persistedActiveNameByCookie: string | null = null;
      const activeThemeNameCookie = useCookie<string | null>(ACTIVE_THEME_NAME_COOKIE_KEY);
      if (activeThemeNameCookie.value) {
        persistedActiveNameByCookie = activeThemeNameCookie.value;
        // console.log(`[ThemeStore] Loaded activeThemeName from cookie: ${persistedActiveNameByCookie}`);
      }

      let finalPersistedActiveName = persistedActiveNameByCookie; // Prioritize cookie

      const builtInThemes = BUILT_IN_THEMES_DEFINITIONS.map(config => ensureFullThemeObject(config, config.name));
      let themesFromStorage: FullThemeConfiguration[] = [];

      if (typeof window !== 'undefined') { // localStorage is client-side only
        try {
          const storedStateString = localStorage.getItem(THEME_STORE_STORAGE_KEY);
          if (storedStateString) {
            const storedState = JSON.parse(storedStateString) as { activeThemeName?: string, themes?: Partial<FullThemeConfiguration>[] };
            themesFromStorage = (storedState.themes || []).map(themePartial => ensureFullThemeObject(themePartial, themePartial.name));
            
            if (!finalPersistedActiveName && storedState.activeThemeName) { // If cookie didn't provide it, use localStorage's active name
              finalPersistedActiveName = storedState.activeThemeName;
              // console.log(`[ThemeStore] Loaded activeThemeName from localStorage (cookie fallback): ${finalPersistedActiveName}`);
            }
          }
        } catch (error) {
          console.error('[ThemeStore] Error reading from localStorage:', error);
        }
      }
      
      finalPersistedActiveName = finalPersistedActiveName || DEFAULT_LIGHT_THEME_NAME; // Ultimate fallback

      const mergedThemesMap = new Map<string, FullThemeConfiguration>();
      builtInThemes.forEach(theme => mergedThemesMap.set(theme.name, theme));
      themesFromStorage.forEach(theme => mergedThemesMap.set(theme.name, theme)); 

      this.themes = Array.from(mergedThemesMap.values());
      
      if (this.themes.some(t => t.name === finalPersistedActiveName)) {
        this.activeThemeName = finalPersistedActiveName;
      } else {
        this.activeThemeName = DEFAULT_LIGHT_THEME_NAME;
      }
      this.themeVersion++;
    },
    persistActiveThemeNameToCookie() {
      const activeThemeNameCookie = useCookie(ACTIVE_THEME_NAME_COOKIE_KEY, { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
      });
      if (activeThemeNameCookie.value !== this.activeThemeName) {
        activeThemeNameCookie.value = this.activeThemeName;
      }
    },
    persistFullThemesToLocalStorage() { 
      if (typeof window === 'undefined') return; 
      try {
        const stateToPersist = { activeThemeName: this.activeThemeName, themes: this.themes }; // Still save activeThemeName here for non-SSR/client-only fallback
        localStorage.setItem(THEME_STORE_STORAGE_KEY, JSON.stringify(stateToPersist));
      } catch (error) { console.error('[ThemeStore] Error persisting themes to localStorage:', error); }
    },
    setActiveTheme(themeName: string) { 
      const themeExists = this.themes.some(t => t.name === themeName);
      if (themeExists) { 
        this.activeThemeName = themeName; 
        this.persistActiveThemeNameToCookie();
        this.persistFullThemesToLocalStorage(); // Keep this for full theme data
        this.themeVersion++;
      } 
      else { console.warn(`[ThemeStore] Theme "${themeName}" not found during setActiveTheme.`); }
    },
    saveTheme(themeConfigInput: FullThemeConfiguration): { success: boolean; message?: string } { 
      const themeToSave = ensureFullThemeObject(themeConfigInput, themeConfigInput.name);
      const index = this.themes.findIndex(t => t.name === themeToSave.name);
      if (index !== -1) { 
        this.themes.splice(index, 1, themeToSave); 
      } else { 
        this.themes.push(themeToSave); 
      }
      this.activeThemeName = themeToSave.name; 
      this.persistActiveThemeNameToCookie();
      this.persistFullThemesToLocalStorage();
      this.themeVersion++;
      return { success: true, message: `Theme "${themeToSave.name}" saved successfully!` };
    },
    saveThemeAs(newName: string, themeConfigToCopy: FullThemeConfiguration): { success: boolean; message?: string } { 
      if (!newName || !newName.trim()) { const message = 'Cannot save theme with an empty name.'; return { success: false, message };}
      if (this.themes.some(t => t.name === newName)) { const message = `Theme with name "${newName}" already exists.`; return { success: false, message }; }
      
      const newThemeObject = JSON.parse(JSON.stringify(themeConfigToCopy));
      newThemeObject.name = newName;
      newThemeObject.isBuiltIn = false; 
      const fullyEnsuredNewTheme = ensureFullThemeObject(newThemeObject, newName);
      this.themes.push(fullyEnsuredNewTheme); 
      this.activeThemeName = newName; 
      this.persistActiveThemeNameToCookie();
      this.persistFullThemesToLocalStorage();
      this.themeVersion++;
      return { success: true, message: `Theme saved as "${newName}"!` };
    },
    deleteTheme(themeName: string): {success: boolean, message?: string} { 
      const themeToDeleteIndex = this.themes.findIndex(t => t.name === themeName);
      if (themeToDeleteIndex > -1) {
        const deletedThemeIsBuiltIn = this.themes[themeToDeleteIndex].isBuiltIn;
        if (deletedThemeIsBuiltIn) {
            const message = `Built-in theme "${themeName}" cannot be deleted.`;
            return {success: false, message};
        }
        this.themes.splice(themeToDeleteIndex, 1); 
        if (this.activeThemeName === themeName) { 
          this.activeThemeName = DEFAULT_LIGHT_THEME_NAME; 
        } 
        this.persistActiveThemeNameToCookie();
        this.persistFullThemesToLocalStorage();
        this.themeVersion++;
        return {success: true, message: `Theme "${themeName}" deleted.`};
      } 
      else { 
        const message = `Attempted to delete non-existent theme: "${themeName}"`;
        console.warn(`[ThemeStore] ${message}`); 
        return {success: false, message};
      }
    },
    toggleThemeBuiltInStatus(themeName: string): {success: boolean, message?: string} {
        const themeIndex = this.themes.findIndex(t => t.name === themeName);
        if (themeIndex === -1) {
            return {success: false, message: `Theme "${themeName}" not found.`};
        }
        const theme = this.themes[themeIndex];
        // const isOriginalBuiltInTheme = BUILT_IN_THEMES_DEFINITIONS.some(st => st.name === theme.name); // Check removed
        // if (isOriginalBuiltInTheme && theme.isBuiltIn && !theme.isBuiltIn === false) {  // Condition removed to allow toggling for all themes
        //      const message = `Cannot mark original built-in theme "${themeName}" as not built-in.`;
        //      return {success: false, message};
        // }
        theme.isBuiltIn = !theme.isBuiltIn;
        this.themes.splice(themeIndex, 1, theme); 
        this.persistActiveThemeNameToCookie(); // Persist change that might affect active theme indirectly if it was this one
        this.persistFullThemesToLocalStorage();
        this.themeVersion++;
        const message = theme.isBuiltIn 
            ? `Your "${themeName}" theme has been secured as a built-in theme.`
            : `Your "${themeName}" theme is no longer secured as a built-in theme.`;
        return {success: true, message: message};
    },
    updateActiveThemeConfiguration(
      newVuetifyTheme?: Partial<ThemeDefinition>, 
      newComponentOverrides?: Partial<ComponentOverrides>, 
      newComponentBackgrounds?: Partial<{ [componentKey: string]: string }>,
      newChartTheme?: Partial<ChartThemeColors> 
    ) {
      const activeConfig = this.activeThemeConfig;
      if (!activeConfig) return;
      let targetConfig = JSON.parse(JSON.stringify(activeConfig)); 
      let changed = false;
      if (newVuetifyTheme) {
        const currentSimpleTheme = { dark: targetConfig.vuetifyTheme.dark, colors: targetConfig.vuetifyTheme.colors, variables: targetConfig.vuetifyTheme.variables };
        const newSimpleTheme = {
          dark: newVuetifyTheme.dark ?? currentSimpleTheme.dark,
          colors: { ...currentSimpleTheme.colors, ...(newVuetifyTheme.colors || {}) },
          variables: { ...currentSimpleTheme.variables, ...(newVuetifyTheme.variables || {}) }
        };
        if (JSON.stringify(currentSimpleTheme) !== JSON.stringify(newSimpleTheme)) {
          targetConfig.vuetifyTheme = { dark: newSimpleTheme.dark, colors: newSimpleTheme.colors, variables: newSimpleTheme.variables };
          changed = true;
        }
      }
      if (newComponentOverrides) {
        targetConfig.componentOverrides = targetConfig.componentOverrides || {};
        for (const componentKey of Object.keys(newComponentOverrides)) {
          const overrideUpdate = newComponentOverrides[componentKey];
          if (overrideUpdate === undefined) { 
            if (targetConfig.componentOverrides[componentKey]) {
              delete targetConfig.componentOverrides[componentKey];
              changed = true;
            }
            continue;
          }
          targetConfig.componentOverrides[componentKey] = targetConfig.componentOverrides[componentKey] || {};
          const currentOverridesForComponent = targetConfig.componentOverrides[componentKey];
          let nestedChanged = false;
          for (const propKey in overrideUpdate) {
            if (Object.prototype.hasOwnProperty.call(overrideUpdate, propKey)) {
              const typedKey = propKey as keyof ComponentStyleOverride;
              if ((COMPONENT_STYLE_OVERRIDE_KEYS as ReadonlyArray<string>).includes(typedKey)) {
                const valueToSet = overrideUpdate[typedKey];
                if (valueToSet === undefined || valueToSet === null || (typeof valueToSet === 'string' && valueToSet.trim() === '')) {
                  if (currentOverridesForComponent[typedKey] !== undefined) {
                    delete currentOverridesForComponent[typedKey];
                    nestedChanged = true;
                  }
                } else {
                  if (currentOverridesForComponent[typedKey] !== valueToSet) {
                     if (typedKey === 'fontWeight') {
                        if (typeof valueToSet === 'string' || typeof valueToSet === 'number') {
                            currentOverridesForComponent.fontWeight = valueToSet;
                            nestedChanged = true;
                        } else {
                            console.warn(`[ThemeStore] Invalid type for fontWeight: expected string or number, got ${typeof valueToSet}. Value: ${valueToSet}`);
                        }
                    } else { 
                        if (typeof valueToSet === 'string') {
                            (currentOverridesForComponent as any)[typedKey] = valueToSet;
                            nestedChanged = true;
                        } else {
                             console.warn(`[ThemeStore] Invalid type for ${typedKey}: expected string, got ${typeof valueToSet}. Value: ${valueToSet}`);
                        }
                    }
                  }
                }
              } else {
                console.warn(`[ThemeStore] Unexpected property "${propKey}" in componentOverrides update for component "${componentKey}". This property will be ignored.`);
              }
            }
          }
          if (Object.keys(currentOverridesForComponent).length === 0) { delete targetConfig.componentOverrides[componentKey]; }
          if (nestedChanged) changed = true;
        }
      }
      if (newComponentBackgrounds) {
        targetConfig.componentBackgrounds = targetConfig.componentBackgrounds || {};
        for (const key in newComponentBackgrounds) {
          if (Object.prototype.hasOwnProperty.call(newComponentBackgrounds, key)) {
            const newValue = newComponentBackgrounds[key];
            const oldValue = targetConfig.componentBackgrounds[key];
            if (typeof newValue === 'string' && newValue !== '' && oldValue !== newValue) {
              targetConfig.componentBackgrounds[key] = newValue;
              changed = true;
            } else if ((newValue === undefined || newValue === '') && oldValue !== undefined) {
              delete targetConfig.componentBackgrounds[key];
              changed = true;
            }
          }
        }
      }
      if (newChartTheme) {
        targetConfig.chartTheme = targetConfig.chartTheme || (targetConfig.vuetifyTheme.dark ? defaultChartColorsDark : defaultChartColorsLight);
        let chartThemeChanged = false;
        for (const key of Object.keys(newChartTheme) as Array<keyof ChartThemeColors>) {
            const typedKey = key as keyof ChartThemeColors;
            const valueFromUpdate = newChartTheme[typedKey]; 
            if (valueFromUpdate !== undefined) {
              if (typeof valueFromUpdate === 'string') { 
                if (targetConfig.chartTheme[typedKey] !== valueFromUpdate) {
                    targetConfig.chartTheme[typedKey] = valueFromUpdate;
                    chartThemeChanged = true;
                }
              } else { 
                console.warn(`[ThemeStore] updateActiveThemeConfiguration: Chart theme color for key "${typedKey}" received a non-string value: '${String(valueFromUpdate)}'. This property expects a string.`);
              }
            }
        }
        if (chartThemeChanged) changed = true;
      }
      if (changed) {
        const activeConfigIndex = this.themes.findIndex(t => t.name === this.activeThemeName); 
        if (activeConfigIndex !== -1) { 
            this.themes.splice(activeConfigIndex, 1, targetConfig); 
        } else {
            console.warn("[ThemeStore] updateActiveThemeConfiguration: Active theme not found in themes array during update.");
        }
        this.persistActiveThemeNameToCookie();
        this.persistFullThemesToLocalStorage();
        this.themeVersion++;
      }
    }
  },
});

export function initializeThemeStore(piniaInstance?: import('pinia').Pinia) {
  if (typeof window !== 'undefined') { 
    const themeStore = useThemeStore(piniaInstance); 
    themeStore.loadThemesFromPersistence();
  }
}
