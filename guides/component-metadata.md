# Component Metadata Guide

Machine-readable metadata that makes components self-describing for AI agents, documentation tools, and design system consumers.

---

## Why Component Metadata?

Components in a design system describe **what they look like** through props, variants, and BEM classes. But they don't describe:

- **Why** they exist — what problem does a Button solve that a Link doesn't?
- **When** to use them — when is `primary` the right variant vs. `secondary`?
- **What connects** to them — does Button escalate to SplitButton? Degrade to TextLink?
- **What breaks** if you pick wrong — can you nest a Button inside a Button?

Without this context, AI agents pattern-match on prop names. With metadata, agents can reason: "Button's purpose is 'trigger a single user action', the primary variant should appear at most once per view, and it degrades to TextLink for inline navigation."

---

## Quick Start

### Creating metadata for a new component

1. Copy the blueprint: `blueprints/scss/Component.meta.blueprint.json`
2. Place it at: `packages/css-components/src/components/{component-name}.meta.json`
3. Replace all `TODO:` placeholders with real values
4. Validate: `pnpm validate:metadata`

### Retrofitting metadata onto an existing component

1. Read the existing SCSS and one framework wrapper
2. Create the `.meta.json` file from the blueprint
3. Use the "Add Metadata to Existing Component" prompt in `prompts/component-generation.md`

### Reference files

| File | Purpose |
|------|---------|
| `packages/css-components/src/component.schema.json` | JSON Schema — defines the structure |
| `packages/css-components/src/components/button.meta.json` | Golden exemplar — fully populated |
| `blueprints/scss/Component.meta.blueprint.json` | Template — copy-paste starter |

---

## The 7 Metadata Sections

### 1. Intent

**Why this component exists.**

```json
{
  "intent": {
    "purpose": "Trigger a discrete user action with clear visual affordance and accessible feedback.",
    "task_context": [
      "form submission",
      "destructive confirmation",
      "navigation to a new workflow step"
    ],
    "sentiment": [
      "urgency (danger variant)",
      "confidence (primary variant)",
      "neutral (secondary variant)"
    ]
  }
}
```

- **purpose** (required): One sentence explaining the core problem this component solves
- **task_context**: Scenarios where this component is the right choice. Helps agents decide "should I use a Button or a Link here?"
- **sentiment**: Emotional tones the component can carry. Helps agents match UI to context (e.g., destructive actions need "urgency")

### 2. Composition

**What goes inside this component.**

```json
{
  "composition": {
    "requires": ["label text (visible or sr-only)"],
    "allows": ["leading icon", "trailing icon", "loading spinner"],
    "forbids": ["nested interactive elements", "long-form content", "images"]
  }
}
```

- **requires**: Elements that MUST be present. A Button without a label is invalid.
- **allows**: Elements that CAN be present. Icons are optional.
- **forbids**: Elements that MUST NOT be present. A `<button>` inside a `<button>` breaks accessibility.

### 3. Variants

**Decision logic for each variant — when to use it, when to avoid it.**

```json
{
  "variants": {
    "primary": {
      "use_when": "The action is the main call-to-action. Use at most once per view.",
      "avoid_when": "There are multiple equally weighted actions — use secondary.",
      "pair_with": ["secondary Button (as cancel)", "Form", "Dialog footer"]
    },
    "danger": {
      "use_when": "The action is destructive or irreversible.",
      "avoid_when": "The action is reversible — use primary or secondary.",
      "pair_with": ["Confirmation Dialog", "secondary Button (as escape hatch)"]
    }
  }
}
```

- **use_when**: The scenario where this variant is the right choice
- **avoid_when**: When this variant is wrong — and what to use instead
- **pair_with**: Components that work well alongside this variant

Variant names should match your BEM modifiers (e.g., `primary` for `.vcds-button--primary`).

### 4. Context

**Environmental conditions that affect rendering or behavior.**

```json
{
  "context": {
    "density": ["compact (sm)", "comfortable (md)", "spacious (lg)"],
    "modality": ["pointer", "touch (44px min target)", "keyboard-only (focus ring)"],
    "mode": ["light", "dark", "high-contrast"]
  }
}
```

- **density**: Layout density contexts (maps to size variants)
- **modality**: Input method considerations
- **mode**: Theme/appearance modes

### 5. Relationships

**How this component connects to others in the system.**

```json
{
  "relationships": {
    "related": ["TextLink", "IconButton"],
    "escalates_to": ["SplitButton", "ButtonGroup", "Menu"],
    "degrades_to": ["TextLink (for inline navigation)", "Chip (for toggle)"],
    "groups_with": ["Form", "Dialog", "Card", "Toolbar"]
  }
}
```

- **related**: Components with overlapping purpose — agents should consider these alternatives
- **escalates_to**: What this upgrades to for heavier/more complex flows
- **degrades_to**: What replaces this in simpler/more constrained contexts
- **groups_with**: Container components this typically lives inside

This is one of the most powerful sections for AI agents. When an agent needs to "add a way for users to confirm deletion," it can read that `Button.danger` escalates to a Confirmation Dialog and degrades to a TextLink.

### 6. Observability

**What to track in analytics and what signals healthy usage.**

```json
{
  "observability": {
    "track": [
      "click (with variant and label context)",
      "loading-start / loading-end",
      "disabled-click (user attempted action on disabled button)"
    ],
    "health": [
      "primary variant used at most once per view",
      "danger variant always inside a confirmation flow",
      "loading state resolves within 10 seconds"
    ]
  }
}
```

- **track**: User interaction events worth capturing
- **health**: Metrics that indicate the component is being used correctly

### 7. Accessibility

**ARIA semantics, keyboard interaction, and screen reader behavior.**

```json
{
  "accessibility": {
    "role": "button",
    "wai_aria_pattern": "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
    "keyboard": {
      "Enter": "activate the button",
      "Space": "activate the button",
      "Tab": "move focus to next focusable element"
    },
    "announces": "Button label. When loading: 'Loading, please wait'. When disabled: conveyed via aria-disabled."
  }
}
```

- **role**: The ARIA role this component maps to
- **wai_aria_pattern**: Link to the WAI-ARIA Authoring Practices Guide pattern
- **keyboard**: Key-to-action mapping
- **announces**: What the screen reader tells the user

---

## How Agents Consume Metadata

### Component selection

When an agent is asked "add a way for users to save their work," it can:
1. Scan all `.meta.json` files for `intent.task_context` containing "form submission"
2. Compare `intent.purpose` statements to find the best fit
3. Check `relationships.related` to see alternatives

### Variant selection

When an agent needs to choose between `primary` and `secondary`:
1. Read `variants.primary.use_when` — "main call-to-action, at most once per view"
2. Read `variants.secondary.use_when` — "important but not the primary CTA"
3. Check if there's already a primary Button on the page

### Composition validation

When an agent builds a component:
1. Check `composition.requires` — does the output include all required elements?
2. Check `composition.forbids` — does the output avoid forbidden patterns?
3. Check `composition.allows` — are optional elements used appropriately?

### Documentation generation

Storybook automatically renders metadata sections when `parameters.componentMetadata` is set on a story. The metadata appears as structured documentation blocks — intent, composition rules, variant logic, relationships, etc.

---

## Validation

Run the metadata validator:

```bash
pnpm validate:metadata           # Validate all *.meta.json files
pnpm validate:metadata --fix     # Show fix suggestions for errors
```

The validator checks:
1. **JSON syntax** — valid JSON
2. **Schema compliance** — all fields match the schema types and requirements
3. **Variant cross-check** — variant names in `.meta.json` match BEM modifiers in `.scss`
4. **TODO detection** — warns if placeholder values are still present
5. **Accessibility completeness** — warns if accessibility section is missing role

---

## FAQ

### Is metadata required?

Only `name`, `description`, and `intent.purpose` are required by the schema. The full 7-section metadata is strongly recommended but teams can adopt incrementally. Start with intent and composition, then add the rest over time.

### What if I don't know the relationships yet?

Leave the `relationships` section empty or omit it. You can always add it later as the component library grows and patterns emerge. The schema doesn't require it.

### How often should metadata be updated?

Update metadata when:
- A new variant is added (add its `use_when`/`avoid_when`)
- The component's purpose changes
- New relationships are discovered (e.g., a new component that's "related")
- Accessibility behavior changes

### Does metadata affect the build?

No. `.meta.json` files are data files — they don't participate in the SCSS or token build pipeline. They're consumed by documentation tools (Storybook), validation scripts, and AI agents reading the filesystem.

### Can I use metadata in production code?

Yes. The JSON files can be imported in JavaScript/TypeScript if you want to use them at runtime (e.g., for component documentation pages, design system explorers, or custom tooling). They're standard JSON with no build dependencies.

---

## Schema Reference

The full JSON Schema is at `packages/css-components/src/component.schema.json`.

**Required fields:** `name`, `description`, `intent` (with `intent.purpose`)

**Optional sections:** `composition`, `variants`, `context`, `relationships`, `observability`, `accessibility`

**Variant keys:** Use the same names as your BEM modifiers (e.g., `primary` for `.vcds-button--primary`). The validator cross-checks these against the SCSS.

**URI fields:** `accessibility.wai_aria_pattern` should be a valid URL to the WAI-ARIA APG.
