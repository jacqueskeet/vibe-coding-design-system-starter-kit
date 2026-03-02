# Using Radix UI with This Design System

[Radix UI](https://www.radix-ui.com/) provides unstyled, accessible primitive components. This makes it an excellent foundation for design system components — you get battle-tested a11y behavior and apply your own token-based styling.

---

## Strategy

Radix provides the behavior (keyboard nav, ARIA, focus management). Your design system provides the visual layer (tokens, theming). This is the ideal pairing for custom design systems.

## Setup

```bash
cd packages/react
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip
# Add other primitives as needed
```

## Example: Dialog Component Using Radix + Design Tokens

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import styles from './Dialog.module.css';

export function DsDialog({ trigger, title, description, children }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          <Dialog.Description className={styles.description}>
            {description}
          </Dialog.Description>
          {children}
          <Dialog.Close asChild>
            <button className={styles.close} aria-label="Close">×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

```css
/* Dialog.module.css — all values from design tokens */
.overlay {
  background-color: var(--vcds-color-surface-overlay);
  position: fixed;
  inset: 0;
  z-index: var(--vcds-z-index-overlay);
}

.content {
  background-color: var(--vcds-color-surface-default);
  border-radius: var(--vcds-radius-xl);
  box-shadow: var(--vcds-elevation-highest);
  padding: var(--vcds-spacing-xl);
  z-index: var(--vcds-z-index-modal);
  /* positioning omitted for brevity */
}

.content:focus-visible {
  outline: none;
  box-shadow: var(--vcds-focus-ring);
}

.title {
  font-size: var(--vcds-font-size-heading-md);
  font-weight: var(--vcds-font-weight-semibold);
  color: var(--vcds-color-text-primary);
}

.description {
  font-size: var(--vcds-font-size-body);
  color: var(--vcds-color-text-secondary);
  margin-top: var(--vcds-spacing-sm);
}
```

## Available Radix Primitives

Use Radix for components that have complex interaction patterns:

| Radix Primitive | Use for |
|----------------|---------|
| `@radix-ui/react-dialog` | Modals, sheets, confirmations |
| `@radix-ui/react-dropdown-menu` | Dropdown menus, context menus |
| `@radix-ui/react-tooltip` | Tooltips |
| `@radix-ui/react-tabs` | Tab interfaces |
| `@radix-ui/react-accordion` | Accordions, collapsible sections |
| `@radix-ui/react-select` | Custom select dropdowns |
| `@radix-ui/react-popover` | Popovers, floating content |
| `@radix-ui/react-checkbox` | Custom checkboxes |
| `@radix-ui/react-radio-group` | Radio button groups |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-slider` | Range sliders |
| `@radix-ui/react-toast` | Toast notifications |

## Notes

- Radix is React-only — build Vue and Svelte equivalents using native APIs or framework-specific libraries
- Radix handles most ARIA automatically, but always verify with axe-core
- Use `asChild` pattern to pass your styled elements as triggers
- Style all Radix parts using CSS Modules with design token CSS vars
