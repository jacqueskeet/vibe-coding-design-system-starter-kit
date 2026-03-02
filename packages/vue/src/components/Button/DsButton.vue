<script setup lang="ts">
/**
 * DsButton — Primary interactive element for triggering actions.
 *
 * Styles come from @ds/css-components (BEM classes with configurable prefix).
 * Prefix is defined in /ds.config.json — change with: node scripts/set-prefix.js
 */

import { computed } from 'vue';
import { DS_PREFIX } from '@ds/shared/prefix';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface DsButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<DsButtonProps>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  isLoading: false,
  disabled: false,
});

defineOptions({ name: 'DsButton' });

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const p = DS_PREFIX;
const isDisabled = computed(() => props.disabled || props.isLoading);

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event);
  }
}
</script>

<template>
  <button
    :class="[
      `${p}-button`,
      `${p}-button--${variant}`,
      `${p}-button--${size}`,
      { [`${p}-button--full-width`]: fullWidth, [`${p}-button--loading`]: isLoading },
    ]"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="isLoading || undefined"
    @click="handleClick"
  >
    <span v-if="isLoading" :class="`${p}-button__spinner`" aria-hidden="true">
      <svg :class="`${p}-button__spinner-icon`" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-dasharray="31.42 31.42"
        />
      </svg>
    </span>

    <span v-if="$slots.iconLeft && !isLoading" :class="`${p}-button__icon-left`" aria-hidden="true">
      <slot name="iconLeft" />
    </span>

    <span :class="isLoading ? `${p}-button__label--hidden` : `${p}-button__label`">
      <slot />
    </span>

    <span v-if="isLoading" :class="`${p}-button__sr-only`">Loading</span>

    <span v-if="$slots.iconRight" :class="`${p}-button__icon-right`" aria-hidden="true">
      <slot name="iconRight" />
    </span>
  </button>
</template>

<!-- No <style> block — all styles come from @ds/css-components -->
