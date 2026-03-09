# Using Angular Primitives with This Design System

[Angular Primitives](https://angularprimitives.com/) (`ng-primitives`) provides headless, composable primitives for building accessible UI components in Angular. Every primitive is built to meet accessibility standards, including keyboard navigation and ARIA roles.

---

## Strategy

Angular Primitives provides the behavior (keyboard nav, ARIA, focus management). Your design system provides the visual layer (tokens, theming). This separation means you get battle-tested accessibility without fighting against opinionated styles.

## Setup

```bash
cd packages/angular
pnpm add ng-primitives
```

## Example: Dialog Component Using Angular Primitives + Design Tokens

```typescript
import { Component, Input } from '@angular/core';
import { NgpDialog, NgpDialogTrigger, NgpDialogOverlay, NgpDialogPanel, NgpDialogTitle, NgpDialogDescription } from 'ng-primitives/dialog';
import { DS_PREFIX, cls } from '@vcds/shared/prefix';

@Component({
  selector: 'ds-dialog',
  standalone: true,
  imports: [NgpDialog, NgpDialogTrigger, NgpDialogOverlay, NgpDialogPanel, NgpDialogTitle, NgpDialogDescription],
  template: `
    <div ngpDialog>
      <button ngpDialogTrigger [class]="triggerClass">
        <ng-content select="[trigger]"></ng-content>
      </button>

      <div ngpDialogOverlay [class]="overlayClass">
        <div ngpDialogPanel [class]="panelClass">
          <h2 ngpDialogTitle [class]="titleClass">{{ title }}</h2>
          <p *ngIf="description" ngpDialogDescription [class]="descriptionClass">
            {{ description }}
          </p>
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class DsDialogComponent {
  @Input() title = '';
  @Input() description = '';

  get triggerClass() { return cls('button'); }
  get overlayClass() { return cls('dialog', null, 'overlay'); }
  get panelClass() { return cls('dialog', null, 'panel'); }
  get titleClass() { return cls('dialog', null, 'title'); }
  get descriptionClass() { return cls('dialog', null, 'description'); }
}
```

```scss
// packages/css-components/src/components/_dialog.scss
@use '../config' as cfg;

.#{cfg.$prefix}-dialog__overlay {
  background-color: var(--#{cfg.$prefix}-color-surface-overlay);
  position: fixed;
  inset: 0;
  z-index: var(--#{cfg.$prefix}-z-index-overlay);
}

.#{cfg.$prefix}-dialog__panel {
  background-color: var(--#{cfg.$prefix}-color-surface-default);
  border-radius: var(--#{cfg.$prefix}-radius-xl);
  box-shadow: var(--#{cfg.$prefix}-elevation-highest);
  padding: var(--#{cfg.$prefix}-spacing-xl);
  max-width: 32rem;
  margin: var(--#{cfg.$prefix}-spacing-2xl) auto;
}

.#{cfg.$prefix}-dialog__title {
  font-size: var(--#{cfg.$prefix}-font-size-lg);
  font-weight: var(--#{cfg.$prefix}-font-weight-semibold);
  color: var(--#{cfg.$prefix}-color-text-primary);
  margin: 0 0 var(--#{cfg.$prefix}-spacing-sm);
}

.#{cfg.$prefix}-dialog__description {
  font-size: var(--#{cfg.$prefix}-font-size-sm);
  color: var(--#{cfg.$prefix}-color-text-secondary);
  margin: 0 0 var(--#{cfg.$prefix}-spacing-md);
}
```

## When to Use Angular Primitives

| Scenario | Approach |
|----------|----------|
| Simple presentational component (badge, card) | Bare `@vcds/angular` wrapper — no headless library needed |
| Complex interaction (dialog, dropdown, tooltip) | Angular Primitives for behavior + design tokens for styling |
| Custom behavior not covered by primitives | Build with `@angular/cdk` (Angular Component Dev Kit) |

## Key Principles

1. **Your tokens are the visual source of truth** — Angular Primitives handles behavior, your `@vcds/css-components` SCSS handles appearance
2. **Use `cls()` or `DS_PREFIX`** for class names — keeps everything prefix-aware
3. **No duplicate styles** — never add `styles:` to Angular components; all visuals come from the shared CSS layer
4. **Test accessibility** — Angular Primitives handles ARIA, but always verify with axe-core
