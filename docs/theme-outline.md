# Theming Page Component Hierarchy

This document outlines the hierarchy of Vue components used for the theme customization feature, based on the structure of `pages/ThemeCustomization.vue`.

- **`pages/ThemeCustomization.vue`** (Top-level page for theme customization)
  - Embeds the following components directly in its template:
  - **`components/theme/ThemeControlPanel.vue`**
    - *Purpose*: Manages theme selection, naming, saving, and deleting.
    - *Key UI Elements*: Dropdown for theme selection, text field for new theme name, buttons for "Save Current Theme", "Save As", and "Delete".
  - **`components/theme/ThemeEditorMainContent.vue`**
    - *Purpose*: Provides the main detailed interface for customizing styles of specific application components and button types.
    - *Key Sections*:
      - **Button Styles Section (3-column layout)**:
        - *Column 1: Home Buttons*: Contains UI for configuring styles of application-specific buttons like "Load Data" and "Interval Buttons" (for both active and inactive states). Uses icon triggers to activate the centralized styling panel.
        - *Column 2: Color & Font Settings*: A centralized panel that displays a `v-color-picker` or various font input fields (`v-text-field` for font family/size, `v-select` for font weight/style). Its content dynamically changes based on the style property selected for editing from Column 1 or Column 3.
        - *Column 3: Theme Editor Buttons*: Contains UI for configuring styles of theme management buttons (e.g., "Save Current Theme", "Save As", "Delete" buttons from `ThemeControlPanel`). It uses the `CommonStyleEditors` component to provide style trigger icons.
      - **Live Preview & Component Backgrounds Section**:
        - Controls for "Toolbar Area Background" and "Content Area Background".
        - A visual preview grid displaying placeholders for various UI components (e.g., "Symbol Manager", "Interval Selector", "Chart View", "Open Trades Table", "Kline Table"), each with its own background color picker.
  - **`components/theme/ThemeGlobalSettings.vue`**
    - *Purpose*: Intended for managing global theme settings such as dark mode toggle, and potentially core palette color pickers (e.g., primary, secondary, surface).

- **Nested Components (used by the above components):**
  - **`components/theme/CommonStyleEditors.vue`**
    - *Purpose*: A reusable sub-component providing a standardized set of icon buttons (for Background, Text, Hover states, Font properties). 
    - *Used by*: `ThemeEditorMainContent.vue`.

This list is based on the direct imports and template structure of `pages/ThemeCustomization.vue` and the known structure of its child components.
