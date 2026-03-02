import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button takes full width of its container */
  fullWidth?: boolean;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Icon element to render before the label */
  iconLeft?: ReactNode;
  /** Icon element to render after the label */
  iconRight?: ReactNode;
  /** Button contents */
  children: ReactNode;
}
