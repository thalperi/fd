import { defineNuxtPlugin } from '#app'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { 
  useThemeStore, 
  initializeThemeStore,
  defaultLightConfiguration, 
  defaultDarkConfiguration,
  DEFAULT_LIGHT_THEME_NAME // Import the constant name
} from '~/stores/themeStore'
import { watch, nextTick } from 'vue' 

import type { Pinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
  // Pinia should be initialized by 01.pinia.ts before this runs.
  const themeStore = useThemeStore(nuxtApp.$pinia as Pinia); 

  // Define the specific set of color keys Vuetify expects, plus an index signature
  interface StrictColors {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    'on-background': string;
    'on-surface': string;
    'on-primary': string;
    'on-secondary': string;
    'on-success': string;
    'on-warning': string;
    'on-error': string;
    'on-info': string;
    [key: string]: string; // Index signature to allow any other string keys
  }

  // Define a stricter theme type that matches Vuetify's internal expectations
  interface StrictThemeDefinition {
    dark: boolean;
    colors: StrictColors; 
    variables: Record<string, string | number>;
  }

  // Helper function remains the same...
  const sanitizeVuetifyTheme = (themeDefInput?: Partial<ThemeDefinition>): StrictThemeDefinition => {
    const isDark = (themeDefInput && typeof themeDefInput.dark === 'boolean')
      ? themeDefInput.dark 
      : false;

    const inputProvidedColors = themeDefInput?.colors || {};
    // Use the imported default configurations for base colors, ensuring it's an object
    const defaultSourceColors = (isDark 
      ? defaultDarkConfiguration.vuetifyTheme.colors 
      : defaultLightConfiguration.vuetifyTheme.colors) ?? {};

    const finalColors = {} as StrictColors;

    // Ensure all known required keys are present
    const requiredColorKeys: Array<keyof StrictColors> = [ 
      'background', 'surface', 'primary', 'secondary', 'success', 'warning', 'error', 'info',
      'on-background', 'on-surface', 'on-primary', 'on-secondary', 'on-success', 'on-warning', 'on-error', 'on-info'
    ];

    for (const key of requiredColorKeys) {
      // TypeScript knows 'key' is one of the literal string keys from StrictColors (excluding the index signature part for this loop)
      const k = key as keyof Omit<StrictColors, string>; // Cast to specific keys for indexing

      if (inputProvidedColors[k] && typeof inputProvidedColors[k] === 'string') {
        finalColors[k] = inputProvidedColors[k] as string;
      } else if (defaultSourceColors[k] && typeof defaultSourceColors[k] === 'string') {
        finalColors[k] = defaultSourceColors[k] as string;
      } else {
        finalColors[k] = isDark ? '#FFFFFF' : '#000000'; // Absolute fallback
      }
    }

    // Add any other colors from the input that are not part of the required set
    for (const key in inputProvidedColors) {
      if (Object.prototype.hasOwnProperty.call(inputProvidedColors, key) && 
          !(requiredColorKeys.includes(key as keyof StrictColors)) && // Check it's not one of the already processed required keys
          typeof inputProvidedColors[key] === 'string') {
        finalColors[key] = inputProvidedColors[key] as string; // This uses the [key: string]: string index signature
      }
    }
    
    const variables: Record<string, string | number> = {};
    if (themeDefInput?.variables) {
      for (const key in themeDefInput.variables) {
        const varValue = themeDefInput.variables[key];
        if (Object.prototype.hasOwnProperty.call(themeDefInput.variables, key) && (typeof varValue === 'string' || typeof varValue === 'number')) {
          variables[key] = varValue;
        }
      }
    }

    return {
      dark: isDark,
      colors: finalColors,
      variables,
    };
  };

  const vuetify = createVuetify({
    components,
    directives,
    defaults: {
      VSlideGroup: {
        mobileBreakpoint: 0, // Disable mobile behavior by setting to 0
      },
    },
    theme: {
      defaultTheme: themeStore.activeThemeName || 'Default Light', // Use active theme name from store
      themes: {
        // Register all themes from the store so Vuetify knows about them
        // We'll use the 'name' from FullThemeConfiguration as the key
        ...themeStore.themes.reduce((acc, themeConfig) => {
          acc[themeConfig.name] = sanitizeVuetifyTheme(themeConfig.vuetifyTheme); // Sanitize here
          return acc;
        }, {} as Record<string, StrictThemeDefinition>), // Use StrictThemeDefinition here
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)

  // Watch for changes in the active theme name from the store and update Vuetify
  if (process.client) {
    // Initialize store from localStorage *after* the app has mounted and hydrated
    nuxtApp.hooks.hook('app:mounted', () => {
      console.log('PLUGIN: App mounted, initializing theme from localStorage.');
      initializeThemeStore(nuxtApp.$pinia as Pinia);
      // Trigger watcher check after loading from storage, in case the theme didn't change
      // but Vuetify needs to be explicitly told the theme name again post-hydration.
      // We might not need this if the watcher's immediate:true handles it.
      // const currentName = themeStore.activeThemeName;
      // if (currentName) vuetify.theme.global.name.value = currentName; 
    });

    watch(() => themeStore.activeThemeName, (newName) => {
      const themeExists = newName && vuetify.theme.themes.value[newName];
      console.log(`PLUGIN WATCHER: themeStore.activeThemeName changed to "${newName}". Theme exists in Vuetify: ${!!themeExists}`);
      
      if (themeExists) {
        vuetify.theme.global.name.value = newName;
        // Log computed colors after Vuetify has had a chance to react
        nextTick(() => {
             console.log('PLUGIN WATCHER: Vuetify global theme name set. Current computed colors:', vuetify.theme.global.current.value.colors);
        });
      } else {
         console.warn(`PLUGIN WATCHER: Vuetify theme "${newName}" not found or invalid. Falling back to default.`);
         vuetify.theme.global.name.value = DEFAULT_LIGHT_THEME_NAME; // Ensure fallback
      }
    }, { immediate: true }); // Run immediately on client load
  }
})
