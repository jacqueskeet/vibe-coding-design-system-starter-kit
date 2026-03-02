# Using shadcn/ui with This Design System

[shadcn/ui](https://ui.shadcn.com/) is a collection of reusable React components built with Radix UI and Tailwind CSS. This guide explains how to integrate it with this design system's token architecture.

---

## Strategy: Tokens First, shadcn Components Second

The recommended approach is to use this design system's tokens as the source of truth, and configure shadcn/ui to consume them. This means:

1. Your design tokens define the visual language (colors, spacing, typography)
2. shadcn/ui provides the component behavior and structure
3. You override shadcn's default Tailwind theme with your token values

## Setup

### 1. Install shadcn/ui in the React package

```bash
cd packages/react
npx shadcn-ui@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral** (you'll override this with tokens)
- CSS variables: **Yes** (this aligns with our token approach)

### 2. Map Design Tokens to shadcn's CSS Variables

shadcn/ui uses CSS variables for theming. Map your design system tokens to shadcn's expected variables in `packages/css/src/shadcn-bridge.css`:

```css
@layer base {
  :root {
    --background: var(--vcds-color-surface-default);
    --foreground: var(--vcds-color-text-primary);
    --primary: var(--vcds-color-action-primary);
    --primary-foreground: var(--vcds-color-text-inverse);
    --secondary: var(--vcds-color-action-secondary);
    --secondary-foreground: var(--vcds-color-text-primary);
    --muted: var(--vcds-color-surface-secondary);
    --muted-foreground: var(--vcds-color-text-secondary);
    --accent: var(--vcds-color-surface-tertiary);
    --accent-foreground: var(--vcds-color-text-primary);
    --destructive: var(--vcds-color-feedback-error);
    --destructive-foreground: var(--vcds-color-text-inverse);
    --border: var(--vcds-color-border-default);
    --input: var(--vcds-color-border-default);
    --ring: var(--vcds-color-border-focus);
    --radius: var(--vcds-radius-md);
  }

  [data-theme="dark"] {
    /* Dark theme mappings are automatic — the --ds-* vars
       already switch values via tokens-dark.css */
  }
}
```

### 3. Use shadcn Components with Design System Tokens

When you add a shadcn component, it will automatically use your design tokens through the CSS variable bridge:

```bash
npx shadcn-ui@latest add button
```

The generated component will reference `--primary`, `--secondary`, etc., which now resolve to your design system tokens.

### 4. Customize shadcn Components

If a shadcn component needs modifications to match your design system exactly:

1. The component source is in `packages/react/src/components/ui/`
2. Replace any Tailwind utility values with token CSS vars where needed
3. Add your design system's a11y patterns (focus ring, ARIA attributes)
4. Write tests following the conventions in `blueprints/react/`

## When to Use shadcn vs. Custom Components

| Use shadcn | Build custom |
|-----------|-------------|
| Complex interactions (Combobox, Dialog, Toast) | Simple presentational components (Badge, Avatar) |
| You want Radix primitives for a11y | You need full control over the DOM |
| Rapid prototyping | Brand-specific components |
| Standard patterns (forms, data tables) | Novel interaction patterns |

## Important Notes

- shadcn/ui only supports React — you'll still need to build Vue and Svelte versions manually for those framework packages
- Always verify a11y compliance after adding a shadcn component (run axe-core tests)
- Keep the CSS variable bridge in sync when adding new tokens
