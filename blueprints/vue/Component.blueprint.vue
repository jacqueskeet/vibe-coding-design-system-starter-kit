<!--
  BLUEPRINT: Vue Component Wrapper (CSS-First Architecture)
  Thin wrapper — maps props to BEM classes. NO <style> block.
  Uses DS_PREFIX from @vcds/shared for the configurable prefix.
-->
<script setup lang="ts">
import { DS_PREFIX } from '@vcds/shared/prefix';

export interface Ds{{ComponentName}}Props {
  variant?: string;
  size?: string;
}

const props = withDefaults(defineProps<Ds{{ComponentName}}Props>(), {
  variant: 'default',
  size: 'md',
});

defineOptions({ name: 'Ds{{ComponentName}}' });

const p = DS_PREFIX;
</script>

<template>
  <element
    :class="[
      `${p}-{{component-name}}`,
      `${p}-{{component-name}}--${variant}`,
      `${p}-{{component-name}}--${size}`,
    ]"
  >
    <slot />
  </element>
</template>

<!-- No <style> block — all styles from @vcds/css-components -->
