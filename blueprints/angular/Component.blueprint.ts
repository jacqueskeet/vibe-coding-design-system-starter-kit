/**
 * BLUEPRINT: Angular Component Wrapper (CSS-First Architecture)
 *
 * Thin wrapper — maps Angular @Input() props to BEM classes from @vcds/css-components.
 * Uses DS_PREFIX from @vcds/shared for the configurable prefix.
 * NO styles in this file.
 *
 * Steps:
 * 1. Ensure SCSS exists in packages/css-components/src/components/
 * 2. Copy this file to packages/angular/src/components/{{ComponentName}}/
 * 3. Replace all {{placeholders}}
 * 4. Export from packages/angular/src/public-api.ts
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';
import { DS_PREFIX, cls } from '@vcds/shared/prefix';

@Component({
  selector: 'ds-{{component-name}}',
  standalone: true,
  imports: [NgClass],
  template: `
    <element
      [ngClass]="classes"
    >
      <ng-content></ng-content>
    </element>
  `,
})
export class Ds{{ComponentName}}Component {
  @Input() variant: string = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get classes(): string {
    return [
      cls('{{component-name}}'),
      cls('{{component-name}}', this.variant),
      cls('{{component-name}}', this.size),
    ]
      .filter(Boolean)
      .join(' ');
  }
}
