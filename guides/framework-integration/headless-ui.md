# Using Headless UI with This Design System

[Headless UI](https://headlessui.com/) by Tailwind Labs provides unstyled, accessible UI components for React and Vue. Unlike most headless libraries, it natively supports two frameworks — making it a strong fit for this multi-framework design system.

---

## Strategy

Headless UI handles behavior, ARIA, keyboard navigation, and focus management. Your design tokens handle all visual styling via CSS custom properties. Because Headless UI supports both React and Vue out of the box, you get consistent behavior across two of the three framework packages.

## Setup

```bash
# React package
cd packages/react
pnpm add @headlessui/react

# Vue package
cd packages/vue
pnpm add @headlessui/vue
```

Svelte is not supported by Headless UI — build Svelte equivalents using native APIs or consider [Melt UI](https://melt-ui.com/) as a Svelte-specific alternative.

## Example: Dialog Component (React)

```tsx
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { cls } from '@vcds/shared/prefix';

export function DsDialog({ isOpen, onClose, title, description, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className={cls('dialog')}>
      <div className={cls('dialog__backdrop')} aria-hidden="true" />
      <div className={cls('dialog__container')}>
        <DialogPanel className={cls('dialog__panel')}>
          <DialogTitle className={cls('dialog__title')}>{title}</DialogTitle>
          <Description className={cls('dialog__description')}>
            {description}
          </Description>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

```css
/* SCSS in packages/css-components — all values from design tokens */
.#{$prefix}-dialog__backdrop {
  background-color: var(--vcds-color-surface-overlay);
  position: fixed;
  inset: 0;
  z-index: var(--vcds-z-index-overlay);
}

.#{$prefix}-dialog__panel {
  background-color: var(--vcds-color-surface-default);
  border-radius: var(--vcds-radius-xl);
  box-shadow: var(--vcds-elevation-highest);
  padding: var(--vcds-spacing-xl);
  z-index: var(--vcds-z-index-modal);
}

.#{$prefix}-dialog__title {
  font-size: var(--vcds-font-size-heading-md);
  font-weight: var(--vcds-font-weight-semibold);
  color: var(--vcds-color-text-primary);
}

.#{$prefix}-dialog__description {
  font-size: var(--vcds-font-size-body);
  color: var(--vcds-color-text-secondary);
  margin-top: var(--vcds-spacing-sm);
}
```

## Example: Dialog Component (Vue)

```vue
<template>
  <Dialog :open="isOpen" @close="$emit('close')">
    <div :class="cls('dialog__backdrop')" aria-hidden="true" />
    <div :class="cls('dialog__container')">
      <DialogPanel :class="cls('dialog__panel')">
        <DialogTitle :class="cls('dialog__title')">{{ title }}</DialogTitle>
        <Description :class="cls('dialog__description')">
          {{ description }}
        </Description>
        <slot />
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/vue';
import { cls } from '@vcds/shared/prefix';

defineProps<{ isOpen: boolean; title: string; description: string }>();
defineEmits<{ close: [] }>();
</script>
```

The same SCSS from `packages/css-components` styles both the React and Vue versions — CSS-first architecture in action.

## Available Headless UI Components

| Component | React | Vue | Use for |
|-----------|:-----:|:---:|---------|
| Dialog | Yes | Yes | Modals, sheets, confirmations |
| Disclosure | Yes | Yes | Accordions, collapsible sections |
| Listbox | Yes | Yes | Custom select dropdowns |
| Combobox | Yes | Yes | Autocomplete, searchable selects |
| Menu | Yes | Yes | Dropdown menus |
| Popover | Yes | Yes | Popovers, floating content |
| Radio Group | Yes | Yes | Radio button groups |
| Switch | Yes | Yes | Toggle switches |
| Tabs | Yes | Yes | Tab interfaces |
| Transition | Yes | Yes | Enter/leave animations |

## Notes

- Headless UI supports React and Vue — Svelte needs a separate solution
- All components use a render-prop / slot pattern for full styling control
- Style with BEM classes from `packages/css-components` using `var(--vcds-*)` tokens
- Headless UI handles most ARIA automatically, but always verify with axe-core
- The `Transition` component pairs well with your motion tokens for consistent animations
