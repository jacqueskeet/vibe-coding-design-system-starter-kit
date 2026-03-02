# Prompt: Design Token Management

---

## Add a New Semantic Token

```
Add a new semantic token called [token-name] to the design system.

Token details:
- Category: [color | spacing | typography | elevation | radius]
- Light theme value: maps to primitive [primitive-name]
- Dark theme value: maps to primitive [primitive-name]
- High contrast theme value: maps to primitive [primitive-name]

Steps:
1. If the primitive value doesn't exist, add it to packages/tokens/src/primitives/[category].json
2. Add the semantic mapping to packages/tokens/src/semantic/light.json
3. Add the semantic mapping to packages/tokens/src/semantic/dark.json
4. Add the semantic mapping to packages/tokens/src/semantic/high-contrast.json
5. Run the token build: pnpm --filter @vcds/tokens build
6. Verify the output in packages/tokens/platforms/web/tokens.css

Follow the existing naming convention: {category}-{property}-{element}-{variant}-{state}
```

---

## Add a New Color Ramp

```
Add a new [color-name] color ramp to the design system primitives.

Generate a 10-step ramp (50–900) following the same lightness curve as the existing
blue and gray ramps in packages/tokens/src/primitives/color.json.

The base hue should be: [hex value or hue description]

After adding the primitives, suggest which semantic tokens should map to this new ramp
(e.g., for a brand color, map it to color-action-primary in the light theme).

Ensure all text-on-color combinations meet WCAG 2.2 AA contrast ratios (4.5:1 for
normal text, 3:1 for large text and UI elements).
```

---

## Audit Token Usage

```
Audit the [ComponentName] component for token compliance:

1. Check the SCSS source in packages/css-components/src/components/_[component-name].scss
2. Check framework wrappers in packages/{react,vue,svelte}/src/components/[ComponentName]/ for any inline styles or hardcoded class names
3. Flag any hardcoded values (hex colors, px spacing, font sizes) that should use tokens
3. Flag any primitive token references that should be semantic tokens
4. Verify all color combinations meet WCAG 2.2 AA contrast ratios
5. Suggest any missing tokens that should be added to the system

Reference the token structure in packages/tokens/src/ for available tokens.
```

---

## Rebuild and Verify Tokens

```
The design tokens have been modified. Please:

1. Run pnpm --filter @vcds/tokens build
2. Check that packages/tokens/platforms/web/tokens.css generated correctly
3. Verify the dark theme overrides in tokens-dark.css
4. Verify the high-contrast overrides in tokens-high-contrast.css
5. Check for any missing references or broken aliases
6. Report any issues found
```
