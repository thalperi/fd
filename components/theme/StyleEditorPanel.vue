<template>
  <v-sheet border rounded elevation="0" class="pa-3 fill-height d-flex flex-column">
    <div class="text-subtitle-1 mb-3">Color & Font Settings</div>
    <div class="flex-grow-1"> 
      <div class="text-caption mb-2">Styling: 
        <span class="font-weight-bold" v-if="target">
          {{ target.displayElement }} - {{ target.displayPropertyGroup }}
        </span>
        <span v-else>
          (No target selected)
        </span>
      </div>
      
      <template v-if="target">
        <transition :name="transitionName" mode="out-in">
          <v-color-picker 
            v-if="target.isColorProperty"
            :key="'color-picker'"
            v-model="editableColor" 
            show-swatches
            mode="hex"
            class="mb-4"
            width="100%" 
          /> 
          <div v-else :key="'font-controls'"> <!-- Font Controls -->
            <v-text-field
              v-if="target.property === 'fontFamily'"
              label="Font Family"
              :model-value="currentStyleValue"
              @update:model-value="(v) => onStyleChange(v)"
              dense hide-details class="mb-2"
            />
            <v-text-field
              v-if="target.property === 'fontSize'"
              label="Font Size (e.g., 14px, 1rem)"
              :model-value="currentStyleValue"
              @update:model-value="(v) => onStyleChange(v)"
              dense hide-details class="mb-2"
            />
            <v-select
              v-if="target.property === 'fontWeight'"
              label="Font Weight"
              :items="['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900']"
              :model-value="fontWeightModel" 
              @update:model-value="(v) => onStyleChange(v)"
              dense hide-details class="mb-2"
            />
            <v-select
              v-if="target.property === 'fontStyle'"
              label="Font Style"
              :items="['normal', 'italic', 'oblique']"
              :model-value="fontStyleModel"
              @update:model-value="(v) => onStyleChange(v)"
              dense hide-details class="mb-2"
            />
          </div>
        </transition>
      </template>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentStyleOverride } from '~/stores/themeStore';

type StylingProperty = keyof ComponentStyleOverride;
interface ActiveStylingTarget {
  componentKey: string;
  property: StylingProperty;
  displayPropertyGroup: string;
  displayElement: string;
  isColorProperty: boolean;
}

interface Props {
  target: ActiveStylingTarget | null;
  currentStyleValue?: string | number | null;
  transitionName?: string; // New prop for dynamic transition
}

const props = withDefaults(defineProps<Props>(), {
  transitionName: 'fade' // Default transition if not provided
});
const emit = defineEmits(['style-changed']);

const editableColor = computed<string>({
  get: () => {
    if (props.target && props.target.isColorProperty && typeof props.currentStyleValue === 'string') {
      return props.currentStyleValue;
    }
    return '#FFFFFF'; 
  },
  set: (newValue: string) => {
    if (props.target && props.target.isColorProperty) {
      emit('style-changed', {
        componentKey: props.target.componentKey,
        property: props.target.property,
        value: newValue
      });
    }
  }
});

const fontWeightModel = computed<string>(() => {
  if (props.target?.property === 'fontWeight') {
    if (typeof props.currentStyleValue === 'number') {
      return String(props.currentStyleValue);
    }
    if (typeof props.currentStyleValue === 'string' && props.currentStyleValue.trim() !== '') {
        return props.currentStyleValue;
    }
    return 'normal'; 
  }
  return 'normal'; 
});

const fontStyleModel = computed<string>(() => {
  if (props.target?.property === 'fontStyle') {
    if (typeof props.currentStyleValue === 'string' && props.currentStyleValue.trim() !== '') {
        return props.currentStyleValue;
    }
    return 'normal';
  }
  return 'normal';
});

const onStyleChange = (value: string | number | null) => {
  if (props.target) { 
    let processedValue = value;
    if (props.target.property === 'fontWeight' && typeof value === 'string') {
      const num = parseInt(value, 10);
      if (!isNaN(num) && String(num) === value) { 
        processedValue = num;
      }
    }
    emit('style-changed', { 
      componentKey: props.target.componentKey, 
      property: props.target.property, 
      value: processedValue 
    });
  }
};
</script>

<style scoped>
.fill-height {
  height: 100%;
}

/* Fade Transition (default) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-X Transition */
.slide-x-enter-active,
.slide-x-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-x-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-x-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Slide-Y Transition */
.slide-y-enter-active,
.slide-y-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-y-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-y-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scale Transition */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* No transition (for 'none' option) */
.none-enter-active,
.none-leave-active {
  transition: none;
}
.none-enter-from,
.none-leave-to {
  opacity: 1; /* Keep visible, no fade */
}
</style>
