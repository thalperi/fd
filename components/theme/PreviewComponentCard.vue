<template>
  <v-sheet 
    outlined 
    rounded 
    class="component-placeholder pa-2 d-flex flex-column align-center justify-space-around"
    :style="{ backgroundColor: backgroundColor || undefined }"
    min-height="140px"
  >
    <div class="text-caption mb-1" :style="{ color: textColor }">{{ componentName }}</div>

    <template v-if="showExampleButton">
      <v-btn :style="loadDataButtonStyle" size="x-small" class="mb-1" disabled>Load Data</v-btn>
    </template>

    <template v-if="showExampleIntervalButtons">
      <div class="mb-1">
        <v-btn :style="intervalInactiveStyle" size="x-small" variant="flat" class="mr-1" disabled>5m</v-btn>
        <v-btn :style="intervalActiveStyle" size="x-small" variant="flat" disabled>15m</v-btn>
      </div>
    </template>
    
    <div class="d-flex align-center control-row mt-auto"> <!-- mt-auto to push to bottom -->
      <span class="text-caption mr-1" :style="{ color: textColor }">BG:</span>
      <v-menu location="bottom end" :close-on-content-click="false">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn density="compact" icon size="x-small" flat v-bind="menuProps" :title="`Edit BG for ${componentName}`">
            <v-icon size="small" :color="textColor">mdi-palette</v-icon>
          </v-btn>
        </template>
        <v-color-picker
          :model-value="backgroundColor"
          @update:model-value="(newColor) => emitSetBackground(newColor)"
          show-swatches
          hide-inputs
          mode="hex"
          elevation="10"
        ></v-color-picker>
      </v-menu>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { type CSSProperties } from 'vue';

interface Props {
  componentKey: string;
  componentName: string;
  backgroundColor?: string | null;
  textColor?: string;
  showExampleButton?: boolean;
  showExampleIntervalButtons?: boolean;
  loadDataButtonStyle?: CSSProperties;
  intervalInactiveStyle?: CSSProperties;
  intervalActiveStyle?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: '',
  textColor: '#000000',
  showExampleButton: false,
  showExampleIntervalButtons: false,
  loadDataButtonStyle: () => ({}),
  intervalInactiveStyle: () => ({}),
  intervalActiveStyle: () => ({}),
});

const emit = defineEmits(['set-background']);

const emitSetBackground = (color: string | null) => {
  emit('set-background', props.componentKey, color);
};
</script>

<style scoped>
.component-placeholder {
  /* min-height: 140px; already in props, but can be a fallback */
  text-align: center;
}
.control-row { 
  margin-top: 4px; /* Default, but mt-auto on parent div will override if space allows */
}
</style>
