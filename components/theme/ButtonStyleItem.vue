<template>
  <v-sheet outlined rounded class="pa-3 mb-4">
    <v-row align="center">
      <v-col cols="12" sm="5" class="py-1">
        <span>{{ buttonLabel }}</span>
      </v-col>
      <v-col cols="12" sm="7" class="py-1 d-flex justify-sm-end justify-center">
        <v-btn 
          :color="exampleButtonColor || undefined" 
          :style="exampleButtonStyle"
          size="small"
          disabled
        >{{ exampleButtonLabel }}</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="py-1">
        <template v-if="isThemeEditorButton">
          <common-style-editors 
            :component-key="buttonKey" 
            :element-name="buttonLabel" 
            @set-target="handleSetTarget" 
          />
        </template>
        <template v-else>
          <div class="d-flex justify-end flex-wrap">
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">BG:</span>
              <v-btn icon size="x-small" flat :title="`Edit Background Color for ${buttonLabel}`" @click="emitSetTarget('backgroundColor', 'Background Color', true)"><v-icon>mdi-format-color-fill</v-icon></v-btn>
            </div>
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">Text:</span>
              <v-btn icon size="x-small" flat :title="`Edit Text Color for ${buttonLabel}`" @click="emitSetTarget('color', 'Text Color', true)"><v-icon>mdi-format-color-text</v-icon></v-btn>
            </div>
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">Hover BG:</span>
              <v-btn icon size="x-small" flat :title="`Edit Hover BG Color for ${buttonLabel}`" @click="emitSetTarget('hoverBackgroundColor', 'Hover BG Color', true)"><v-icon color="blue-grey-lighten-2">mdi-cursor-default-click-outline</v-icon><v-icon>mdi-format-color-fill</v-icon></v-btn>
            </div>
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">Hover Text:</span>
              <v-btn icon size="x-small" flat :title="`Edit Hover Text Color for ${buttonLabel}`" @click="emitSetTarget('hoverColor', 'Hover Text Color', true)"><v-icon color="blue-grey-lighten-2">mdi-cursor-default-click-outline</v-icon><v-icon>mdi-format-color-text</v-icon></v-btn>
            </div>
          </div>
          <div class="d-flex justify-end flex-wrap mt-1">
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">Font:</span>
              <v-btn icon size="x-small" flat :title="`Edit Font Family for ${buttonLabel}`" @click="emitSetTarget('fontFamily', 'Font Family', false)"><v-icon>mdi-format-font</v-icon></v-btn>
            </div>
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">Size:</span>
              <v-btn icon size="x-small" flat :title="`Edit Font Size for ${buttonLabel}`" @click="emitSetTarget('fontSize', 'Font Size', false)"><v-icon>mdi-format-size</v-icon></v-btn>
            </div>
            <div class="d-flex align-center mr-2 mb-1">
              <span class="text-caption mr-1">Weight:</span>
              <v-btn icon size="x-small" flat :title="`Edit Font Weight for ${buttonLabel}`" @click="emitSetTarget('fontWeight', 'Font Weight', false)"><v-icon>mdi-format-bold</v-icon></v-btn>
            </div>
            <div class="d-flex align-center mb-1">
              <span class="text-caption mr-1">Style:</span>
              <v-btn icon size="x-small" flat :title="`Edit Font Style for ${buttonLabel}`" @click="emitSetTarget('fontStyle', 'Font Style', false)"><v-icon>mdi-format-italic</v-icon></v-btn>
            </div>
          </div>
        </template>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { type CSSProperties } from 'vue';
import CommonStyleEditors from './CommonStyleEditors.vue'; // Assuming it's in the same folder

interface Props {
  buttonKey: string;
  buttonLabel: string;
  exampleButtonLabel: string;
  exampleButtonColor?: string;
  exampleButtonStyle?: CSSProperties;
  isThemeEditorButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isThemeEditorButton: false,
  exampleButtonColor: undefined,
  exampleButtonStyle: () => ({}),
});

const emit = defineEmits(['set-target']);

// For non-ThemeEditorButton cases (direct icons)
const emitSetTarget = (property: string, displayPropertyGroup: string, isColorProperty: boolean) => {
  emit('set-target', props.buttonKey, property, displayPropertyGroup, props.buttonLabel, isColorProperty);
};

// For ThemeEditorButton cases (using CommonStyleEditors)
// CommonStyleEditors emits: (componentKey: string, property: string, displayPropertyGroup: string, elementName: string, isColorProperty: boolean)
// We need to re-emit this with our component's buttonKey and buttonLabel (as elementName)
const handleSetTarget = (
  _componentKey: string, // This will be props.buttonKey from CommonStyleEditors, we ignore it and use our own
  property: string, 
  displayPropertyGroup: string, 
  _elementName: string, // This will be props.buttonLabel from CommonStyleEditors, we ignore it and use our own
  isColorProperty: boolean
) => {
  emit('set-target', props.buttonKey, property, displayPropertyGroup, props.buttonLabel, isColorProperty);
};
</script>
