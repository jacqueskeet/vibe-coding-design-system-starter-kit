# @ds/html

Reference HTML markup for the design system. No JavaScript framework required.

This package provides example HTML files showing how to use `@ds/css-components` classes directly. Use these as copy-paste references for static sites, CMSs (WordPress, Magento, etc.), email templates, server-rendered pages, or any project that doesn't use a JS framework.

## Quick Start

```html
<!-- 1. Include token CSS custom properties -->
<link rel="stylesheet" href="path/to/@ds/tokens/platforms/web/variables.css" />

<!-- 2. Include component CSS -->
<link rel="stylesheet" href="path/to/@ds/css-components/dist/index.css" />

<!-- 3. Use BEM classes in your markup -->
<button class="vcds-button vcds-button--primary vcds-button--md">
  Save changes
</button>
```

## Examples

Each file in `examples/` demonstrates one component with all variants, sizes, states, and accessibility patterns:

| File | Component |
|------|-----------|
| `button.html` | Button (variants, sizes, icons, loading, disabled, as-link) |

## Class Reference — Button

```
.vcds-button                  Base button styles
.vcds-button--primary         Primary variant (filled, brand color)
.vcds-button--secondary       Secondary variant (outlined)
.vcds-button--ghost           Ghost variant (transparent background)
.vcds-button--danger          Danger variant (destructive actions)
.vcds-button--sm              Small size (32px height)
.vcds-button--md              Medium size (40px height, default)
.vcds-button--lg              Large size (48px height)
.vcds-button--full-width      Stretch to container width
.vcds-button--loading         Loading state (pair with aria-busy)
.vcds-button__icon-left       Left icon wrapper
.vcds-button__icon-right      Right icon wrapper
.vcds-button__label           Text label
.vcds-button__label--hidden   Hidden label (during loading)
.vcds-button__spinner         Loading spinner wrapper
.vcds-button__spinner-icon    Animated spinner SVG
.vcds-button__sr-only         Screen reader only text
```

## Accessibility

All HTML examples follow WCAG 2.2 AA:

- Use `aria-disabled="true"` instead of the `disabled` attribute to maintain focusability
- Use `aria-busy="true"` for loading states
- Include `aria-hidden="true"` on decorative icons
- Include screen-reader-only text for loading states (`.vcds-button__sr-only`)
- Links styled as buttons include `role="button"`
