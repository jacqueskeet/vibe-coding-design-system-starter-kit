import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { DS_PREFIX, cls } from '@vcds/shared/prefix';

/**
 * DsButton — Primary interactive element for triggering actions.
 *
 * Styles come from @vcds/css-components (BEM classes with configurable prefix).
 * Prefix is defined in /ds.config.json — change with: node scripts/set-prefix.js
 *
 * @example
 * ```html
 * <ds-button variant="primary" size="md" (clicked)="onSave()">
 *   Save changes
 * </ds-button>
 * ```
 */
@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <button
      [ngClass]="buttonClasses"
      [attr.aria-disabled]="isButtonDisabled || null"
      [attr.aria-busy]="isLoading || null"
      (click)="handleClick($event)"
    >
      <span *ngIf="isLoading" [class]="spinnerClass" aria-hidden="true">
        <svg [class]="spinnerIconClass" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="12" cy="12" r="10"
            stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-dasharray="31.42 31.42"
          />
        </svg>
      </span>

      <span *ngIf="!isLoading" [class]="iconLeftClass" aria-hidden="true">
        <ng-content select="[iconLeft]"></ng-content>
      </span>

      <span [class]="isLoading ? labelHiddenClass : labelClass">
        <ng-content></ng-content>
      </span>

      <span *ngIf="isLoading" [class]="srOnlyClass">Loading</span>

      <span [class]="iconRightClass" aria-hidden="true">
        <ng-content select="[iconRight]"></ng-content>
      </span>
    </button>
  `,
})
export class DsButtonComponent {
  /** Visual style variant */
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';

  /** Size of the button */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Whether the button takes full width of its container */
  @Input() fullWidth = false;

  /** Whether the button is in a loading state */
  @Input() isLoading = false;

  /** Whether the button is disabled */
  @Input() disabled = false;

  /** Emitted when the button is clicked (not emitted when disabled or loading) */
  @Output() clicked = new EventEmitter<MouseEvent>();

  get isButtonDisabled(): boolean {
    return this.disabled || this.isLoading;
  }

  get buttonClasses(): string {
    return [
      cls('button'),
      cls('button', this.variant),
      cls('button', this.size),
      this.fullWidth ? cls('button', 'full-width') : '',
      this.isLoading ? cls('button', 'loading') : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get spinnerClass(): string {
    return cls('button', null, 'spinner');
  }

  get spinnerIconClass(): string {
    return cls('button', null, 'spinner-icon');
  }

  get iconLeftClass(): string {
    return cls('button', null, 'icon-left');
  }

  get iconRightClass(): string {
    return cls('button', null, 'icon-right');
  }

  get labelClass(): string {
    return cls('button', null, 'label');
  }

  get labelHiddenClass(): string {
    return `${cls('button', null, 'label')}--hidden`;
  }

  get srOnlyClass(): string {
    return cls('button', null, 'sr-only');
  }

  handleClick(event: MouseEvent): void {
    if (!this.isButtonDisabled) {
      this.clicked.emit(event);
    }
  }
}
