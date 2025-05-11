<template>
  <div> 
    <!-- General Button Styles Section -->
    <v-sheet border rounded elevation="1" class="pa-4 mb-6">
      <v-row>
        <v-col cols="12"><div class="text-h6">Button Styles</div></v-col>
      </v-row>

      <v-row>
        <!-- Column 1: Home Buttons -->
        <v-col cols="12" md="4">
          <v-sheet border rounded elevation="0" class="pa-3 fill-height">
            <div class="text-subtitle-1 mb-3">Home Buttons</div>
            <ButtonStyleItem
              :button-key="LOAD_DATA_BTN_KEY"
              button-label='"Load Data" Button'
              example-button-label="Example Load"
              :example-button-color="getButtonOverrideStyle(LOAD_DATA_BTN_KEY, 'backgroundColor') || 'primary'"
              :example-button-style="getLoadDataButtonStyle()"
              @set-target="setTargetForStyling"
            />
            <v-sheet outlined rounded class="pa-3">
              <ButtonStyleItem
                :button-key="INTERVAL_BTN_KEY"
                button-label="Interval Buttons (Inactive)"
                example-button-label="5m"
                :example-button-style="getIntervalButtonStyle(INTERVAL_BTN_KEY, false)"
                @set-target="setTargetForStyling"
                class="mb-0" 
              />
              <v-divider class="my-2"></v-divider>
              <ButtonStyleItem
                :button-key="INTERVAL_BTN_ACTIVE_KEY"
                button-label="Interval Buttons (Active)"
                example-button-label="15m"
                :example-button-style="getIntervalButtonStyle(INTERVAL_BTN_ACTIVE_KEY, true)"
                @set-target="setTargetForStyling"
                class="mb-0" 
              />
            </v-sheet>
          </v-sheet>
        </v-col>

        <!-- Column 2: Color & Font Settings - Uses StyleEditorPanel -->
        <v-col cols="12" md="4">
          <StyleEditorPanel
            :target="activeStylingTarget"
            :current-style-value="currentValueForStylePanel"
            :transition-name="selectedTransitionName" 
            @style-changed="handleStylePanelChange"
          />
        </v-col>

        <!-- Column 3: Theme Editor Buttons & Animation Selector -->
        <v-col cols="12" md="4">
          <v-sheet border rounded elevation="0" class="pa-3 fill-height">
            <div class="text-subtitle-1 mb-3">Controls</div>
            
            <v-select
              v-model="selectedTransitionName"
              :items="transitionOptions"
              label="Panel Transition Animation"
              dense
              outlined
              class="mb-4"
            ></v-select>
            
            <div class="text-subtitle-2 mt-4 mb-2">Button Styles:</div>
            <ButtonStyleItem
              :button-key="THEME_EDITOR_SAVE_BTN_KEY"
              button-label='"Save Current" Button'
              example-button-label="Save Current"
              :example-button-style="getThemeEditorButtonStyle(THEME_EDITOR_SAVE_BTN_KEY)"
              :is-theme-editor-button="true"
              @set-target="setTargetForStyling"
            />
            <ButtonStyleItem
              :button-key="THEME_EDITOR_SAVE_AS_BTN_KEY"
              button-label='"Save As" Button'
              example-button-label="Save As"
              :example-button-style="getThemeEditorButtonStyle(THEME_EDITOR_SAVE_AS_BTN_KEY)"
              :is-theme-editor-button="true"
              @set-target="setTargetForStyling"
            />
            <ButtonStyleItem
              :button-key="THEME_EDITOR_DELETE_BTN_KEY"
              button-label='"Delete" Button'
              example-button-label="Delete"
              :example-button-style="getThemeEditorButtonStyle(THEME_EDITOR_DELETE_BTN_KEY)"
              :is-theme-editor-button="true"
              @set-target="setTargetForStyling"
            />
          </v-sheet>
        </v-col>
      </v-row>
    </v-sheet>

    <!-- Live Preview & Component Backgrounds Section -->
    <v-sheet border rounded elevation="1" class="pa-4 mb-6">
      <v-row><v-col cols="12"><div class="text-h6">Live Preview & Component Backgrounds</div></v-col></v-row>
      <v-row class="mb-2">
          <v-col cols="12" md="6" class="d-flex align-center">
              <span class="mr-2">Toolbar Area BG:</span>
              <v-menu location="bottom end" :close-on-content-click="false"><template v-slot:activator="{ props: menuProps }"><v-btn density="compact" icon size="x-small" flat v-bind="menuProps"><v-icon size="small">mdi-palette</v-icon></v-btn></template><v-color-picker :model-value="getComponentBgColor('ToolbarArea')" @update:model-value="(c) => setComponentBgColor('ToolbarArea', c)" show-swatches hide-inputs mode="hex" /></v-menu>
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center">
              <span class="mr-2">Content Area BG:</span>
              <v-menu location="bottom end" :close-on-content-click="false"><template v-slot:activator="{ props: menuProps }"><v-btn density="compact" icon size="x-small" flat v-bind="menuProps"><v-icon size="small">mdi-palette</v-icon></v-btn></template><v-color-picker :model-value="getComponentBgColor('ContentArea')" @update:model-value="(c) => setComponentBgColor('ContentArea', c)" show-swatches hide-inputs mode="hex" /></v-menu>
          </v-col>
      </v-row>
      
      <div class="visual-preview-container pa-2" :style="{ backgroundColor: getComponentBgColor('ContentArea') || undefined }">
        <div class="toolbar-grid mb-4 pa-2" :style="{ backgroundColor: getComponentBgColor('ToolbarArea') || 'transparent' }">
          <PreviewComponentCard
            component-key="SymbolManager"
            component-name="Symbol Manager"
            :background-color="getComponentBgColor('SymbolManager')"
            :text-color="getContrastColor(getComponentBgColor('SymbolManager'))"
            :show-example-button="true"
            :load-data-button-style="getLoadDataButtonStyle()"
            @set-background="setComponentBgColor"
          />
          <PreviewComponentCard
            component-key="IntervalSelector"
            component-name="Interval Selector"
            :background-color="getComponentBgColor('IntervalSelector')"
            :text-color="getContrastColor(getComponentBgColor('IntervalSelector'))"
            :show-example-interval-buttons="true"
            :interval-inactive-style="getIntervalButtonStyle(INTERVAL_BTN_KEY, false)"
            :interval-active-style="getIntervalButtonStyle(INTERVAL_BTN_ACTIVE_KEY, true)"
            @set-background="setComponentBgColor"
          />
        </div>
        <div class="content-grid">
          <PreviewComponentCard
            component-key="ChartView"
            component-name="Chart View"
            :background-color="getComponentBgColor('ChartView')"
            :text-color="getContrastColor(getComponentBgColor('ChartView'))"
            class="chart-area"
            @set-background="setComponentBgColor"
          />
          <PreviewComponentCard
            component-key="OpenTradesTable"
            component-name="Open Trades Table"
            :background-color="getComponentBgColor('OpenTradesTable')"
            :text-color="getContrastColor(getComponentBgColor('OpenTradesTable'))"
            class="trades-area"
            @set-background="setComponentBgColor"
          />
          <PreviewComponentCard
            component-key="KlineTable"
            component-name="Kline Table"
            :background-color="getComponentBgColor('KlineTable')"
            :text-color="getContrastColor(getComponentBgColor('KlineTable'))"
            class="klines-area"
            @set-background="setComponentBgColor"
          />
        </div>
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'; 
import { 
  useThemeStore, 
  type FullThemeConfiguration, 
  type ComponentStyleOverride, 
  LOAD_DATA_BTN_KEY, 
  INTERVAL_BTN_KEY, 
  INTERVAL_BTN_ACTIVE_KEY,
  THEME_EDITOR_SAVE_BTN_KEY,
  THEME_EDITOR_SAVE_AS_BTN_KEY,
  THEME_EDITOR_DELETE_BTN_KEY
} from '~/stores/themeStore'; 
import { useNuxtApp } from '#app';
import type { createVuetify } from 'vuetify';
import ButtonStyleItem from './ButtonStyleItem.vue';
import PreviewComponentCard from './PreviewComponentCard.vue';
import StyleEditorPanel from './StyleEditorPanel.vue';

const themeStore = useThemeStore();
const nuxtApp = useNuxtApp();
const vuetifyInstance = nuxtApp.$vuetify as ReturnType<typeof createVuetify>;

type StylingProperty = keyof ComponentStyleOverride; 
interface ActiveStylingTarget {
  componentKey: string;
  property: StylingProperty; 
  displayPropertyGroup: string; 
  displayElement: string; 
  isColorProperty: boolean;
}
const activeStylingTarget = ref<ActiveStylingTarget | null>(null);

const activeThemeConfigObject = computed<FullThemeConfiguration | undefined>(() => {
  return themeStore.activeThemeConfig;
});

const appliedVuetifyThemeIsDark = computed(() => {
  return vuetifyInstance?.theme?.global?.current?.value?.dark || false;
});

const {
  getButtonOverrideStyle,
  setButtonOverrideStyle,
  getLoadDataButtonStyle,
  getIntervalButtonStyle,
  getThemeEditorButtonStyle,
  getContrastColor,
  getComponentBgColor,
  setComponentBgColor
} = useThemeStyleManagement(activeThemeConfigObject, appliedVuetifyThemeIsDark);

const setTargetForStyling = (
  componentKey: string, 
  property: StylingProperty, 
  displayPropertyGroup: string, 
  displayElement: string, 
  isColorProperty: boolean
) => {
  activeStylingTarget.value = { componentKey, property, displayPropertyGroup, displayElement, isColorProperty };
};

const currentValueForStylePanel = computed(() => {
  if (!activeStylingTarget.value) {
    return undefined;
  }
  return getButtonOverrideStyle(activeStylingTarget.value.componentKey, activeStylingTarget.value.property);
});

const handleStylePanelChange = (payload: { componentKey: string, property: string, value: any }) => {
  setButtonOverrideStyle(
    payload.componentKey,
    payload.property as StylingProperty, 
    payload.value
  );
};

// State for transition selection
const transitionOptions = ref(['fade', 'slide-x', 'slide-y', 'scale', 'none']);
const selectedTransitionName = ref('fade');

</script>

<style scoped>
.visual-preview-container {
   border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
   padding: 10px; margin-top: 16px;
}
.toolbar-grid { 
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  align-items: stretch; margin-bottom: 16px;
}
.content-grid { 
  display: grid; gap: 16px; grid-template-columns: 1fr; 
  grid-template-areas: "chart" "trades" "klines";
}
@media (min-width: 960px) { 
  .content-grid { grid-template-columns: 1fr 1fr; grid-template-areas: "chart chart" "trades klines"; }
}
.chart-area { grid-area: chart; }
.trades-area { grid-area: trades; }
.klines-area { grid-area: klines; }
.preview-section-label-container {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2px 4px; margin-bottom: 6px;
}
.control-row { 
  margin-top: 4px;
}
</style>
