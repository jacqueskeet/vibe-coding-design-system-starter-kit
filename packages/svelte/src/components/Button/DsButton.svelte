<!--
  DsButton — Primary interactive element for triggering actions.

  Styles come from @ds/css-components (BEM classes with configurable prefix).
  Prefix is defined in /ds.config.json — change with: node scripts/set-prefix.js
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { DS_PREFIX } from '@ds/shared/prefix';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type ButtonSize = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
    iconLeft?: Snippet;
    iconRight?: Snippet;
    [key: string]: unknown;
  }

  let {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    disabled = false,
    onclick,
    children,
    iconLeft,
    iconRight,
    ...rest
  }: Props = $props();

  const p = DS_PREFIX;
  let isDisabled = $derived(disabled || isLoading);

  let buttonClass = $derived(
    [
      `${p}-button`,
      `${p}-button--${variant}`,
      `${p}-button--${size}`,
      fullWidth ? `${p}-button--full-width` : '',
      isLoading ? `${p}-button--loading` : '',
    ].filter(Boolean).join(' ')
  );

  function handleClick(event: MouseEvent) {
    if (!isDisabled && onclick) {
      onclick(event);
    }
  }
</script>

<button
  class={buttonClass}
  aria-disabled={isDisabled || undefined}
  aria-busy={isLoading || undefined}
  onclick={handleClick}
  {...rest}
>
  {#if isLoading}
    <span class="{p}-button__spinner" aria-hidden="true">
      <svg class="{p}-button__spinner-icon" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-dasharray="31.42 31.42"
        />
      </svg>
    </span>
  {/if}

  {#if iconLeft && !isLoading}
    <span class="{p}-button__icon-left" aria-hidden="true">
      {@render iconLeft()}
    </span>
  {/if}

  <span class={isLoading ? `${p}-button__label--hidden` : `${p}-button__label`}>
    {#if children}
      {@render children()}
    {/if}
  </span>

  {#if isLoading}
    <span class="{p}-button__sr-only">Loading</span>
  {/if}

  {#if iconRight}
    <span class="{p}-button__icon-right" aria-hidden="true">
      {@render iconRight()}
    </span>
  {/if}
</button>

<!-- No <style> block — all styles come from @ds/css-components -->
