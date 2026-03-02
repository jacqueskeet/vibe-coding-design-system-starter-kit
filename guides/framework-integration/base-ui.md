# Using Base UI with This Design System

[Base UI](https://base-ui.com/) (formerly MUI Base) provides unstyled, accessible React components. Like Radix, it separates behavior from styling, making it ideal for custom design systems.

---

## Strategy

Base UI handles complex interactions and accessibility. Your design tokens handle all visual styling. This combination gives you production-grade behavior with complete visual control.

## Setup

```bash
cd packages/react
pnpm add @base-ui-components/react
```

## Example: Button with Base UI

```tsx
import { Button as BaseButton } from '@base-ui-components/react/button';
import styles from './Button.module.css';

export function DsButton({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <BaseButton
      className={`${styles.button} ${styles[`variant-${variant}`]} ${styles[`size-${size}`]}`}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
```

The CSS Module uses the same token-based styling pattern as the rest of the design system.

## Available Base UI Components

| Component | Use for |
|-----------|---------|
| Button | Buttons with proper a11y |
| Input | Text inputs with validation |
| Select | Custom select dropdowns |
| Menu | Dropdown and context menus |
| Dialog | Modals and dialogs |
| Tooltip | Tooltips |
| Tabs | Tab interfaces |
| Switch | Toggle switches |
| Slider | Range sliders |
| Checkbox | Custom checkboxes |
| Popover | Floating content |
| Progress | Progress indicators |

## Notes

- Base UI is React-only — build equivalents for Vue and Svelte using native APIs
- Base UI uses a render props / slot pattern for customization
- Style all components using CSS Modules with `var(--vcds-*)` tokens
- Verify a11y with axe-core after integrating each component
