# Using Ark UI with This Design System

[Ark UI](https://ark-ui.com/) is a headless component library built on [Zag.js](https://zagjs.com/) state machines. It is the only major headless library that natively supports **React, Vue, and Svelte** — making it the ideal behavioral layer for this multi-framework design system.

---

## Strategy

Ark UI provides framework-specific wrappers around Zag.js state machines. This means identical component behavior, keyboard navigation, and ARIA patterns across all three frameworks. Your design tokens handle all visual styling. This is the most architecturally aligned option for this starter kit.

## Setup

```bash
# React package
cd packages/react
pnpm add @ark-ui/react

# Vue package
cd packages/vue
pnpm add @ark-ui/vue

# Svelte package
cd packages/svelte
pnpm add @ark-ui/svelte
```

## Example: Dialog Component (React)

```tsx
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { cls } from '@ds/shared/prefix';

export function DsDialog({ title, description, children, ...props }) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger className={cls('button')}>Open</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className={cls('dialog__backdrop')} />
        <Dialog.Positioner className={cls('dialog__positioner')}>
          <Dialog.Content className={cls('dialog__panel')}>
            <Dialog.Title className={cls('dialog__title')}>{title}</Dialog.Title>
            <Dialog.Description className={cls('dialog__description')}>
              {description}
            </Dialog.Description>
            {children}
            <Dialog.CloseTrigger className={cls('dialog__close')}>
              Close
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
```

## Example: Dialog Component (Vue)

```vue
<template>
  <Dialog.Root>
    <Dialog.Trigger :class="cls('button')">Open</Dialog.Trigger>
    <Teleport to="body">
      <Dialog.Backdrop :class="cls('dialog__backdrop')" />
      <Dialog.Positioner :class="cls('dialog__positioner')">
        <Dialog.Content :class="cls('dialog__panel')">
          <Dialog.Title :class="cls('dialog__title')">{{ title }}</Dialog.Title>
          <Dialog.Description :class="cls('dialog__description')">
            {{ description }}
          </Dialog.Description>
          <slot />
          <Dialog.CloseTrigger :class="cls('dialog__close')">
            Close
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Teleport>
  </Dialog.Root>
</template>

<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog';
import { cls } from '@ds/shared/prefix';

defineProps<{ title: string; description: string }>();
</script>
```

## Example: Dialog Component (Svelte)

```svelte
<script lang="ts">
  import { Dialog } from '@ark-ui/svelte/dialog';
  import { cls } from '@ds/shared/prefix';

  export let title: string;
  export let description: string;
</script>

<Dialog.Root>
  <Dialog.Trigger class={cls('button')}>Open</Dialog.Trigger>
  <Dialog.Backdrop class={cls('dialog__backdrop')} />
  <Dialog.Positioner class={cls('dialog__positioner')}>
    <Dialog.Content class={cls('dialog__panel')}>
      <Dialog.Title class={cls('dialog__title')}>{title}</Dialog.Title>
      <Dialog.Description class={cls('dialog__description')}>
        {description}
      </Dialog.Description>
      <slot />
      <Dialog.CloseTrigger class={cls('dialog__close')}>
        Close
      </Dialog.CloseTrigger>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

All three frameworks share the same SCSS from `packages/css-components` — the CSS-first architecture means one stylesheet drives all three.

## Available Ark UI Components

| Component | React | Vue | Svelte | Use for |
|-----------|:-----:|:---:|:------:|---------|
| Accordion | Yes | Yes | Yes | Collapsible sections |
| Checkbox | Yes | Yes | Yes | Custom checkboxes |
| Combobox | Yes | Yes | Yes | Autocomplete, searchable selects |
| Date Picker | Yes | Yes | Yes | Date selection |
| Dialog | Yes | Yes | Yes | Modals, sheets |
| Menu | Yes | Yes | Yes | Dropdown and context menus |
| Number Input | Yes | Yes | Yes | Numeric steppers |
| Popover | Yes | Yes | Yes | Floating content |
| Radio Group | Yes | Yes | Yes | Radio button groups |
| Select | Yes | Yes | Yes | Custom select dropdowns |
| Slider | Yes | Yes | Yes | Range sliders |
| Switch | Yes | Yes | Yes | Toggle switches |
| Tabs | Yes | Yes | Yes | Tab interfaces |
| Toast | Yes | Yes | Yes | Toast notifications |
| Tooltip | Yes | Yes | Yes | Tooltips |

## Why Ark UI for This Starter Kit

- **Only headless library covering React + Vue + Svelte** — perfect for this multi-framework architecture
- Same state machine (Zag.js) powers all three — guaranteeing behavioral parity
- Compound component API (`Dialog.Root`, `Dialog.Title`, etc.) maps cleanly to BEM elements
- Unstyled by default — no CSS to override, just apply your token-based classes
- Built-in focus management, keyboard navigation, and ARIA

## Notes

- Ark UI is newer than Radix — community and ecosystem are smaller but growing
- The compound component pattern works well with the `cls()` helper from `@ds/shared/prefix`
- Style all parts using BEM classes from `packages/css-components` with `var(--vcds-*)` tokens
- Always verify a11y with axe-core after integrating each component
- See [Zag.js guide](./zag.md) if you prefer lower-level state machine access
