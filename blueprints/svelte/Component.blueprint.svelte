<!--
  BLUEPRINT: Svelte Component Wrapper (CSS-First Architecture)
  Thin wrapper — maps props to BEM classes. NO <style> block.
  Uses DS_PREFIX from @ds/shared for the configurable prefix.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { DS_PREFIX } from '@ds/shared/prefix';

  interface Props {
    variant?: string;
    size?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { variant = 'default', size = 'md', children, ...rest }: Props = $props();

  const p = DS_PREFIX;

  let rootClass = $derived(
    [
      `${p}-{{component-name}}`,
      `${p}-{{component-name}}--${variant}`,
      `${p}-{{component-name}}--${size}`,
    ].join(' ')
  );
</script>

<element class={rootClass} {...rest}>
  {#if children}{@render children()}{/if}
</element>

<!-- No <style> block — all styles from @ds/css-components -->
