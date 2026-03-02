# @vcds/tokens

Design tokens for the design system, built with [Style Dictionary](https://amzn.github.io/style-dictionary/).

## Architecture

Tokens follow a three-tier hierarchy:

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  PRIMITIVE    │────▶│    SEMANTIC       │────▶│    COMPONENT        │
│  Raw values   │     │  Intent-based     │     │  Usage-specific     │
├──────────────┤     ├──────────────────┤     ├─────────────────────┤
│ blue-500     │     │ color-action-     │     │ button-bg-default   │
│ gray-100     │     │   primary         │     │ card-padding        │
│ spacing-4    │     │ color-surface-    │     │ input-border-color  │
│ font-size-sm │     │   default         │     │                     │
└──────────────┘     │ spacing-md        │     └─────────────────────┘
                     └──────────────────┘
```

**Rule:** Components must only reference semantic or component tokens — never primitives.

## Token Categories

| Category | Primitives | Semantic examples |
|----------|-----------|-------------------|
| Color | `blue-500`, `gray-100` | `color-action-primary`, `color-text-primary`, `color-surface-default` |
| Spacing | `spacing-1` through `spacing-24` | `spacing-xs` through `spacing-3xl` |
| Typography | `font-size-sm`, `font-weight-bold` | `font-size-body`, `font-size-heading-lg` |
| Elevation | `elevation-sm` through `elevation-xl` | `elevation-low` through `elevation-highest` |
| Radius | `border-radius-sm` through `border-radius-full` | `radius-sm` through `radius-full` |

## Themes

Three themes are supported, each mapping semantic tokens to different primitives:

- **Light** (`light.json`) — default theme
- **Dark** (`dark.json`) — dark mode
- **High Contrast** (`high-contrast.json`) — enhanced contrast for accessibility

## Build

```bash
pnpm build
```

This generates platform-specific outputs in `platforms/`:

```
platforms/
├── web/
│   ├── tokens.css              # CSS custom properties (light theme, :root)
│   ├── tokens-dark.css         # Dark theme [data-theme="dark"]
│   ├── tokens-high-contrast.css # High contrast [data-theme="high-contrast"]
│   ├── _tokens.scss            # SCSS variables
│   ├── tokens.js               # ES6 module exports
│   └── tokens.d.ts             # TypeScript declarations
├── ios/
│   ├── DesignTokens.swift      # Swift enum
│   └── ColorTokens.swift       # Swift color enum
└── android/
    ├── tokens.xml              # Android resources
    ├── colors.xml              # Android color resources
    └── dimens.xml              # Android dimension resources
```

## Usage

### Web (CSS)

```css
@import '@vcds/tokens/css';

.my-element {
  color: var(--ds-color-text-primary);
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-md);
}
```

### Web (JavaScript/TypeScript)

```ts
import { colorActionPrimary, spacingMd } from '@vcds/tokens';
```

### Theming

Apply themes via the `data-theme` attribute on a parent element:

```html
<body data-theme="dark">
  <!-- All components automatically use dark theme tokens -->
</body>
```

## Adding a New Token

1. Add the raw value to `src/primitives/` if it doesn't exist
2. Add the semantic mapping to `src/semantic/light.json`
3. Add the equivalent mapping to `dark.json` and `high-contrast.json`
4. Run `pnpm build`
5. Verify output in `platforms/`

## Naming Convention

```
{category}-{property}-{element}-{variant}-{state}
```

Examples:
- `color-action-primary` → base action color
- `color-action-primary-hover` → hover state
- `color-text-secondary` → secondary text color
- `spacing-md` → medium spacing
- `font-size-heading-lg` → large heading size
