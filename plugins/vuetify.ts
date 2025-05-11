import { defineNuxtPlugin } from '#app'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { 
  useThemeStore, 
  initializeThemeStore,
  DEFAULT_LIGHT_THEME_NAME, 
  DEFAULT_DARK_THEME_NAME   
} from '~/stores/themeStore'
import { watch } from 'vue' 
import type { Pinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
  const themeStore = useThemeStore(nuxtApp.$pinia as Pinia); 

  interface StrictColors {
    background: string; surface: string; primary: string; secondary: string;
    success: string; warning: string; error: string; info: string;
    'on-background': string; 'on-surface': string; 'on-primary': string;
    'on-secondary': string; 'on-success': string; 'on-warning': string;
    'on-error': string; 'on-info': string; [key: string]: string; 
  }
  interface StrictThemeDefinition {
    dark: boolean; colors: StrictColors; variables: Record<string, string | number>;
  }

  const sanitizeVuetifyTheme = (themeDefInput?: Partial<ThemeDefinition>): StrictThemeDefinition => {
    const isDark = (themeDefInput && typeof themeDefInput.dark === 'boolean') ? themeDefInput.dark : false;
    const inputProvidedColors = themeDefInput?.colors || {};
    
    const defaultLightConfig = themeStore.themes.find(t => t.name === DEFAULT_LIGHT_THEME_NAME);
    const defaultDarkConfig = themeStore.themes.find(t => t.name === DEFAULT_DARK_THEME_NAME);

    const defaultSourceColors = (isDark ? defaultDarkConfig?.vuetifyTheme.colors : defaultLightConfig?.vuetifyTheme.colors) ?? {};
    
    const rawDefaultSourceVariables = (isDark ? defaultDarkConfig?.vuetifyTheme.variables : defaultLightConfig?.vuetifyTheme.variables) ?? {};
    const defaultSourceVariables: Record<string, string | number> = {};
    for (const key in rawDefaultSourceVariables) {
        if (Object.prototype.hasOwnProperty.call(rawDefaultSourceVariables, key)) {
            const value = rawDefaultSourceVariables[key];
            if (value !== undefined) {
                defaultSourceVariables[key] = value as string | number; // Cast is safe due to undefined check
            }
        }
    }

    const finalColors = {} as StrictColors;
    const requiredColorKeys: Array<keyof StrictColors> = [ 
      'background', 'surface', 'primary', 'secondary', 'success', 'warning', 'error', 'info',
      'on-background', 'on-surface', 'on-primary', 'on-secondary', 'on-success', 'on-warning', 'on-error', 'on-info'
    ];
    for (const key of requiredColorKeys) {
      const k = key as keyof Omit<StrictColors, string>; 
      if (inputProvidedColors[k] && typeof inputProvidedColors[k] === 'string') {
        finalColors[k] = inputProvidedColors[k] as string;
      } else if (defaultSourceColors[k] && typeof defaultSourceColors[k] === 'string') {
        finalColors[k] = defaultSourceColors[k] as string;
      } else {
        finalColors[k] = isDark ? '#FFFFFF' : '#000000'; 
      }
    }
    for (const key in inputProvidedColors) {
      if (Object.prototype.hasOwnProperty.call(inputProvidedColors, key) && 
          !(requiredColorKeys.includes(key as keyof StrictColors)) && 
          typeof inputProvidedColors[key] === 'string') {
        finalColors[key] = inputProvidedColors[key] as string; 
      }
    }
    const variables: Record<string, string | number> = { ...defaultSourceVariables };
    if (themeDefInput?.variables) {
      for (const key in themeDefInput.variables) {
        const varValue = themeDefInput.variables[key];
        if (Object.prototype.hasOwnProperty.call(themeDefInput.variables, key) && (typeof varValue === 'string' || typeof varValue === 'number')) {
          variables[key] = varValue; // varValue is already string | number here
        }
      }
    }
    return { dark: isDark, colors: finalColors, variables };
  };

  const initialThemesForVuetify = themeStore.themes.reduce((acc, themeConfig) => {
      acc[themeConfig.name] = sanitizeVuetifyTheme(themeConfig.vuetifyTheme);
      return acc;
    }, {} as Record<string, StrictThemeDefinition>);

  const vuetify = createVuetify({
    components,
    directives,
    defaults: { VSlideGroup: { mobileBreakpoint: 0 } },
    theme: {
      defaultTheme: themeStore.activeThemeName, 
      themes: initialThemesForVuetify,
    },
  })

  nuxtApp.vueApp.use(vuetify)

  if (process.client) {
    nuxtApp.hooks.hook('app:mounted', () => {
      initializeThemeStore(nuxtApp.$pinia as Pinia); 
    });

    watch(() => themeStore.activeThemeName, (newName) => {
      if (!newName) {
        vuetify.theme.global.name.value = DEFAULT_LIGHT_THEME_NAME;
        return;
      }
      const themeConfigFromStore = themeStore.themes.find(t => t.name === newName);
      if (themeConfigFromStore) {
        if (!vuetify.theme.themes.value[newName]) {
          vuetify.theme.themes.value[newName] = sanitizeVuetifyTheme(themeConfigFromStore.vuetifyTheme);
        }
        vuetify.theme.global.name.value = newName;
      } else {
         vuetify.theme.global.name.value = DEFAULT_LIGHT_THEME_NAME; 
      }
    }, { immediate: true }); 

    watch(() => themeStore.activeThemeConfig, (newConfig) => {
        if (newConfig && newConfig.name === vuetify.theme.global.name.value) {
             vuetify.theme.themes.value[newConfig.name] = sanitizeVuetifyTheme(newConfig.vuetifyTheme);
        }
    }, { deep: true }); 
  }
})
