<template>
  <div class="d-flex justify-end flex-wrap">
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">BG:</span>
      <v-btn icon size="x-small" flat title="Edit Background Color" @click="emitSetTarget('backgroundColor', 'Background Color', true)"><v-icon>mdi-format-color-fill</v-icon></v-btn>
    </div>
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">Text:</span>
      <v-btn icon size="x-small" flat title="Edit Text Color" @click="emitSetTarget('color', 'Text Color', true)"><v-icon>mdi-format-color-text</v-icon></v-btn>
    </div>
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">Hover BG:</span>
      <v-btn icon size="x-small" flat title="Edit Hover BG Color" @click="emitSetTarget('hoverBackgroundColor', 'Hover BG Color', true)"><v-icon color="blue-grey-lighten-2">mdi-cursor-default-click-outline</v-icon><v-icon>mdi-format-color-fill</v-icon></v-btn>
    </div>
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">Hover Text:</span>
      <v-btn icon size="x-small" flat title="Edit Hover Text Color" @click="emitSetTarget('hoverColor', 'Hover Text Color', true)"><v-icon color="blue-grey-lighten-2">mdi-cursor-default-click-outline</v-icon><v-icon>mdi-format-color-text</v-icon></v-btn>
    </div>
  </div>
  <div class="d-flex justify-end flex-wrap mt-1">
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">Font:</span>
      <v-btn icon size="x-small" flat title="Edit Font Family" @click="emitSetTarget('fontFamily', 'Font Family', false)"><v-icon>mdi-format-font</v-icon></v-btn>
    </div>
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">Size:</span>
      <v-btn icon size="x-small" flat title="Edit Font Size" @click="emitSetTarget('fontSize', 'Font Size', false)"><v-icon>mdi-format-size</v-icon></v-btn>
    </div>
    <div class="d-flex align-center mr-2 mb-1">
      <span class="text-caption mr-1">Weight:</span>
      <v-btn icon size="x-small" flat title="Edit Font Weight" @click="emitSetTarget('fontWeight', 'Font Weight', false)"><v-icon>mdi-format-bold</v-icon></v-btn>
    </div>
    <div class="d-flex align-center mb-1">
      <span class="text-caption mr-1">Style:</span>
      <v-btn icon size="x-small" flat title="Edit Font Style" @click="emitSetTarget('fontStyle', 'Font Style', false)"><v-icon>mdi-format-italic</v-icon></v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentStyleOverride } from '~/stores/themeStore';

type StylingProperty = keyof ComponentStyleOverride;

interface Props {
  componentKey: string;
  elementName: string;
}
const props = defineProps<Props>();

const emit = defineEmits(['set-target']);

const emitSetTarget = (
  property: StylingProperty, 
  displayPropertyGroup: string, 
  isColorProperty: boolean
) => {
  emit('set-target', props.componentKey, property, displayPropertyGroup, props.elementName, isColorProperty);
};
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
