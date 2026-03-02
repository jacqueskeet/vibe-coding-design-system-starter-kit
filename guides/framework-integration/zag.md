# Using Zag.js with This Design System

[Zag.js](https://zagjs.com/) is a framework-agnostic state machine library for UI components. It powers [Ark UI](https://ark-ui.com/) under the hood, but can be used directly for maximum control. Zag provides the lowest-level approach to headless components — you get raw state machines and wire them to any framework yourself.

---

## Strategy

Zag.js provides state machines that model component behavior (open/close, focus, selection, keyboard nav). You connect the machine to your framework's reactivity system and render with your own BEM-structured markup. This gives you the most control but requires more wiring code than Ark UI.

**Choose Zag.js over Ark UI when:**
- You need custom behavior not covered by Ark UI's API
- You want to build your own component abstraction layer
- You need framework adapters beyond React/Vue/Svelte

**Choose Ark UI instead when:**
- You want pre-built framework wrappers with less boilerplate
- Standard component behavior is sufficient

## Setup

```bash
# Install the core machine + framework adapter
# React
cd packages/react
pnpm add @zag-js/dialog @zag-js/react

# Vue
cd packages/vue
pnpm add @zag-js/dialog @zag-js/vue

# Svelte
cd packages/svelte
pnpm add @zag-js/dialog @zag-js/svelte
```

Each component is a separate package — install only what you need.

## Example: Dialog Component (React)

```tsx
import * as dialog from '@zag-js/dialog';
import { useMachine, normalizeProps, Portal } from '@zag-js/react';
import { useId } from 'react';
import { cls } from '@vcds/shared/prefix';

export function DsDialog({ title, description, children }) {
  const service = useMachine(dialog.machine, { id: useId() });
  const api = dialog.connect(service, normalizeProps);

  return (
    <>
      <button {...api.getTriggerProps()} className={cls('button')}>
        Open
      </button>

      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} className={cls('dialog__backdrop')} />
          <div {...api.getPositionerProps()} className={cls('dialog__positioner')}>
            <div {...api.getContentProps()} className={cls('dialog__panel')}>
              <h2 {...api.getTitleProps()} className={cls('dialog__title')}>
                {title}
              </h2>
              <p {...api.getDescriptionProps()} className={cls('dialog__description')}>
                {description}
              </p>
              {children}
              <button {...api.getCloseTriggerProps()} className={cls('dialog__close')}>
                Close
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
```

## Example: Dialog Component (Vue)

```vue
<template>
  <button v-bind="api.getTriggerProps()" :class="cls('button')">Open</button>

  <Teleport to="body" v-if="api.open">
    <div v-bind="api.getBackdropProps()" :class="cls('dialog__backdrop')" />
    <div v-bind="api.getPositionerProps()" :class="cls('dialog__positioner')">
      <div v-bind="api.getContentProps()" :class="cls('dialog__panel')">
        <h2 v-bind="api.getTitleProps()" :class="cls('dialog__title')">{{ title }}</h2>
        <p v-bind="api.getDescriptionProps()" :class="cls('dialog__description')">
          {{ description }}
        </p>
        <slot />
        <button v-bind="api.getCloseTriggerProps()" :class="cls('dialog__close')">
          Close
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import * as dialog from '@zag-js/dialog';
import { useMachine, normalizeProps } from '@zag-js/vue';
import { computed } from 'vue';
import { cls } from '@vcds/shared/prefix';

defineProps<{ title: string; description: string }>();

const service = useMachine(dialog.machine, { id: 'dialog' });
const api = computed(() => dialog.connect(service, normalizeProps));
</script>
```

## Available Zag.js Machines

| Machine | Package | Use for |
|---------|---------|---------|
| Accordion | `@zag-js/accordion` | Collapsible sections |
| Checkbox | `@zag-js/checkbox` | Custom checkboxes |
| Combobox | `@zag-js/combobox` | Autocomplete, searchable selects |
| Date Picker | `@zag-js/date-picker` | Date selection |
| Dialog | `@zag-js/dialog` | Modals, sheets |
| Menu | `@zag-js/menu` | Dropdown and context menus |
| Number Input | `@zag-js/number-input` | Numeric steppers |
| Popover | `@zag-js/popover` | Floating content |
| Radio Group | `@zag-js/radio-group` | Radio button groups |
| Select | `@zag-js/select` | Custom select dropdowns |
| Slider | `@zag-js/slider` | Range sliders |
| Switch | `@zag-js/switch` | Toggle switches |
| Tabs | `@zag-js/tabs` | Tab interfaces |
| Toast | `@zag-js/toast` | Toast notifications |
| Tooltip | `@zag-js/tooltip` | Tooltips |

## How Zag.js Relates to Ark UI

```
Zag.js (state machines)  →  Ark UI (framework wrappers)  →  Your components (styled)
     Low-level                    Mid-level                     High-level
     Most control                 Less boilerplate              Ready to use
```

- **Zag.js** = raw state machines, you write the framework glue
- **Ark UI** = pre-built React/Vue/Svelte wrappers around Zag.js
- Both are styled with the same SCSS from `packages/css-components`

If you start with Zag.js and later want less boilerplate, switching to Ark UI is straightforward — same underlying machines, same component parts.

## Notes

- Zag.js is framework-agnostic — works with React, Vue, Svelte, Solid, and any framework
- Each machine is a separate package — keeps bundle size minimal
- The `api.get*Props()` pattern spreads ARIA attributes, event handlers, and data attributes
- Combine with your BEM classes via the `cls()` helper from `@vcds/shared/prefix`
- All styling uses `var(--vcds-*)` tokens from `packages/css-components`
- Always verify a11y with axe-core after integrating each component
