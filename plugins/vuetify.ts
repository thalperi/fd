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

import { useCookie } from '#app'; // Import useCookie

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as Pinia;
  
  // Step 1: Determine the active theme name from cookie (works on server and client)
  const activeThemeNameFromCookie = useCookie<string | null>('active-theme-name');
  let initialActiveName = activeThemeNameFromCookie.value || DEFAULT_LIGHT_THEME_NAME;
  console.log(`[Vuetify Plugin] Initial name from cookie/default: ${initialActiveName}`);

  // Step 2: Initialize the theme store. This populates theme definitions.
  // loadThemesFromPersistence inside initializeThemeStore also reads the cookie,
  // but we prioritize the direct read above for createVuetify defaultTheme on server.
  initializeThemeStore(pinia);
  const themeStore = useThemeStore(pinia); // Get store AFTER initialization

  // Step 3: Ensure the activeThemeName in store matches what we'll use for Vuetify setup,
  // especially if it's a user theme that might not be in system themes initially on server.
  // And ensure the theme actually exists in the loaded themes.
  if (!themeStore.themes.some(t => t.name === initialActiveName)) {
    console.warn(`[Vuetify Plugin] Theme "${initialActiveName}" from cookie not in loaded themes. Falling back to ${DEFAULT_LIGHT_THEME_NAME}.`);
    initialActiveName = DEFAULT_LIGHT_THEME_NAME;
  }
  themeStore.activeThemeName = initialActiveName; // Ensure store reflects the name to be used

  console.log(`[Vuetify Plugin] activeThemeName for createVuetify: ${themeStore.activeThemeName}`);

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
                defaultSourceVariables[key] = value as string | number; 
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
          variables[key] = varValue; 
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
    watch(() => themeStore.activeThemeConfig, (newConfig, oldConfig) => {
      if (newConfig) {
        const newThemeName = newConfig.name;
        // const newThemeIsDark = newConfig.vuetifyTheme.dark; // We'll let Vuetify derive this
        console.log(`[Vuetify Plugin] Client Watcher: Active theme config changed to: ${newThemeName} (intended dark: ${newConfig.vuetifyTheme.dark})`);

        // Ensure Vuetify has the latest definition for this theme.
        // Its 'dark' property is part of this definition.
        vuetify.theme.themes.value[newThemeName] = sanitizeVuetifyTheme(newConfig.vuetifyTheme);
        console.log(`[Vuetify Plugin] Client Watcher: Updated/added definition for ${newThemeName}`);

        // Only trigger a global theme name change if the name is actually different.
        // Vuetify should handle the dark state based on the theme definition when the name is applied.
        if (vuetify.theme.global.name.value !== newThemeName) {
          console.log(`[Vuetify Plugin] Client Watcher: Applying theme name: ${newThemeName}. Current global name: ${vuetify.theme.global.name.value}`);
          nextTick(() => {
            vuetify.theme.global.name.value = newThemeName;
            // Log Vuetify's interpretation of the dark state AFTER name change
            // To avoid TS errors if `vuetify.theme.global.dark` is not recognized by TS:
            const currentAppliedThemeIsDark = vuetify.theme.current.value.dark;
            console.log(`[Vuetify Plugin] Client Watcher: Set global.name.value to ${newThemeName}. Current applied theme isDark: ${currentAppliedThemeIsDark}`);
          });
        } else {
          // If only the content of the current theme changed (e.g., live edit),
          // Vuetify should react to the updated definition in vuetify.theme.themes.value[newThemeName].
          // We might still need to nudge it if just colors changed but not dark status or name.
          // For now, let's assume Vuetify handles this. If not, a re-application of the name might be needed.
          console.log(`[Vuetify Plugin] Client Watcher: Theme ${newThemeName} config updated (live edit, name same). Vuetify should react.`);
           // Optional: Force re-application if only colors changed within the same theme name and dark status
           // This can sometimes be needed if Vuetify doesn't deeply watch changes to theme definitions for the *active* theme.
           // nextTick(() => {
           //   vuetify.theme.global.name.value = newThemeName; // Re-apply same name
           //   console.log(`[Vuetify Plugin] Client Watcher: Re-applied theme name ${newThemeName} for live edit update.`);
           // });
        }
      } else if (oldConfig) {
        console.warn(`[Vuetify Plugin] Client Watcher: Active theme config undefined. Reverting to ${DEFAULT_LIGHT_THEME_NAME}.`);
        // When reverting, ensure the definition for DEFAULT_LIGHT_THEME_NAME is up-to-date in Vuetify
        const fallbackLightConfig = themeStore.themes.find(t => t.name === DEFAULT_LIGHT_THEME_NAME);
        if (fallbackLightConfig) {
            vuetify.theme.themes.value[DEFAULT_LIGHT_THEME_NAME] = sanitizeVuetifyTheme(fallbackLightConfig.vuetifyTheme);
        }
        vuetify.theme.global.name.value = DEFAULT_LIGHT_THEME_NAME;
        console.log(`[Vuetify Plugin] Client Watcher: Reverted to ${DEFAULT_LIGHT_THEME_NAME}.`);
      }
    }, { deep: true });
  }
})
