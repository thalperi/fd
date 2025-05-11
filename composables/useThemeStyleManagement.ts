import { computed, type Ref, type ComputedRef } from 'vue';
import type { CSSProperties } from 'vue';
import { storeToRefs } from 'pinia'; // Keep one import
import { 
  useThemeStore, 
  type FullThemeConfiguration, 
  type ComponentOverrides, 
  type ComponentStyleOverride,
  LOAD_DATA_BTN_KEY, 
  INTERVAL_BTN_KEY, 
  INTERVAL_BTN_ACTIVE_KEY,
  THEME_EDITOR_SAVE_BTN_KEY,
  THEME_EDITOR_SAVE_AS_BTN_KEY,
  THEME_EDITOR_DELETE_BTN_KEY
} from '~/stores/themeStore'; // Constants now exported from themeStore

export function useThemeStyleManagement(
  activeThemeConfigObject: Ref<FullThemeConfiguration | undefined>,
  appliedVuetifyThemeIsDark: ComputedRef<boolean>
) {
  const themeStore = useThemeStore();
  const { themeVersion } = storeToRefs(themeStore); // Import themeVersion here

  const getButtonOverrideStyle = <K extends keyof ComponentStyleOverride>(componentKey: string, property: K): ComponentStyleOverride[K] | undefined => {
    // Explicitly depend on themeVersion to ensure this re-runs when any theme part changes
    const _version = themeVersion.value; 
    return activeThemeConfigObject.value?.componentOverrides?.[componentKey]?.[property] as ComponentStyleOverride[K] | undefined;
  };

  const setButtonOverrideStyle = <K extends keyof ComponentStyleOverride>(
      componentKey: string, 
      property: K, 
      value: ComponentStyleOverride[K] | null 
  ) => {
       if (activeThemeConfigObject.value) {
          if (!activeThemeConfigObject.value.componentOverrides) {
            activeThemeConfigObject.value.componentOverrides = {};
          }
          if (!activeThemeConfigObject.value.componentOverrides[componentKey]) {
            activeThemeConfigObject.value.componentOverrides[componentKey] = {};
          }

          const currentSpecificOverrides: ComponentStyleOverride = { ...activeThemeConfigObject.value.componentOverrides[componentKey] };
          
          let changed = false;
          const currentValAtProp = currentSpecificOverrides[property];

          if (value === null || (typeof value === 'string' && value.trim() === '')) {
              if (currentValAtProp !== undefined) {
                  delete currentSpecificOverrides[property];
                  changed = true;
              }
          } else {
              if (currentValAtProp !== value) {
                  currentSpecificOverrides[property] = value;
                  changed = true;
              }
          }

          if (changed) {
              const componentUpdatePayload: Partial<ComponentOverrides> = { 
                  [componentKey]: Object.keys(currentSpecificOverrides).length > 0 ? currentSpecificOverrides : undefined 
              };
              themeStore.updateActiveThemeConfiguration(undefined, componentUpdatePayload, undefined);
          }
      }
  };

  const getLoadDataButtonStyle = (): CSSProperties => {
    const styles: CSSProperties = {};
    const textColor = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'color');
    if (textColor) styles.color = textColor;
    
    const fontFamily = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'fontFamily');
    if (fontFamily) styles.fontFamily = fontFamily;
    const fontSize = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'fontSize');
    if (fontSize) styles.fontSize = fontSize;
    const fontWeight = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'fontWeight');
    if (fontWeight) styles.fontWeight = fontWeight;
    const fontStyle = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'fontStyle');
    if (fontStyle) styles.fontStyle = fontStyle;
    
    const hoverBg = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'hoverBackgroundColor');
    const hoverText = getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'hoverColor');
    if (hoverBg) styles['--load-btn-hover-bg'] = hoverBg;
    if (hoverText) styles['--load-btn-hover-text'] = hoverText;

    return styles;
  };

  const getIntervalButtonStyle = (key: string, isActive = false): CSSProperties => {
    const styles: CSSProperties = {};
    const bgColor = getButtonOverrideStyle(key, 'backgroundColor');
    const textColor = getButtonOverrideStyle(key, 'color');

    if (bgColor) {
      styles.backgroundColor = bgColor;
    } else if (isActive && activeThemeConfigObject.value?.vuetifyTheme.colors?.primary) {
      styles.backgroundColor = activeThemeConfigObject.value.vuetifyTheme.colors.primary;
    }

    if (textColor) {
      styles.color = textColor;
    } else if (isActive && activeThemeConfigObject.value?.vuetifyTheme.colors?.['on-primary']) {
      styles.color = activeThemeConfigObject.value.vuetifyTheme.colors['on-primary'];
    }
    
    const fontFamily = getButtonOverrideStyle(key, 'fontFamily');
    if (fontFamily) styles.fontFamily = fontFamily;
    const fontSize = getButtonOverrideStyle(key, 'fontSize');
    if (fontSize) styles.fontSize = fontSize;
    const fontWeight = getButtonOverrideStyle(key, 'fontWeight');
    if (fontWeight) styles.fontWeight = fontWeight;
    const fontStyle = getButtonOverrideStyle(key, 'fontStyle');
    if (fontStyle) styles.fontStyle = fontStyle;

    const hoverBg = getButtonOverrideStyle(key, 'hoverBackgroundColor');
    const hoverText = getButtonOverrideStyle(key, 'hoverColor');
    if (hoverBg) styles['--interval-btn-hover-bg'] = hoverBg;
    if (hoverText) styles['--interval-btn-hover-text'] = hoverText;
    
    return styles;
  };

  const getThemeEditorButtonStyle = (key: string): CSSProperties => {
    const styles: CSSProperties = {};
    const bgColor = getButtonOverrideStyle(key, 'backgroundColor');
    if (bgColor) styles.backgroundColor = bgColor;
    const textColor = getButtonOverrideStyle(key, 'color');
    if (textColor) styles.color = textColor;
    const fontFamily = getButtonOverrideStyle(key, 'fontFamily');
    if (fontFamily) styles.fontFamily = fontFamily;
    const fontSize = getButtonOverrideStyle(key, 'fontSize');
    if (fontSize) styles.fontSize = fontSize;
    const fontWeight = getButtonOverrideStyle(key, 'fontWeight');
    if (fontWeight) styles.fontWeight = fontWeight;
    const fontStyle = getButtonOverrideStyle(key, 'fontStyle');
    if (fontStyle) styles.fontStyle = fontStyle;
    
    const hoverBg = getButtonOverrideStyle(key, 'hoverBackgroundColor');
    const hoverText = getButtonOverrideStyle(key, 'hoverColor');
     if (hoverBg) styles['--theme-editor-btn-hover-bg'] = hoverBg; 
     if (hoverText) styles['--theme-editor-btn-hover-text'] = hoverText; 

    return styles;
  };

  const defaultContrastContextColor = computed<string>(() => { 
    return appliedVuetifyThemeIsDark.value ? '#FFFFFF' : '#000000';
  });

  const getContrastColor = (hexColor: string | undefined | null): string => {
    if (!hexColor) {
      return defaultContrastContextColor.value; 
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
      return defaultContrastContextColor.value; 
    }
  };

  const getComponentBgColor = (componentKey: string): string => {
    return activeThemeConfigObject.value?.componentBackgrounds?.[componentKey] || ''; 
  };

  const setComponentBgColor = (componentKey: string, color: string | null) => {
    if (activeThemeConfigObject.value) {
      const newBackgrounds = { [componentKey]: color || '' }; 
      themeStore.updateActiveThemeConfiguration(undefined, undefined, newBackgrounds);
    }
  };

  return {
    getButtonOverrideStyle,
    setButtonOverrideStyle,
    getLoadDataButtonStyle,
    getIntervalButtonStyle,
    getThemeEditorButtonStyle,
    getContrastColor,
    defaultContrastContextColor, // Expose if needed by parent, though getContrastColor uses it internally
    getComponentBgColor,
    setComponentBgColor
  };
}
