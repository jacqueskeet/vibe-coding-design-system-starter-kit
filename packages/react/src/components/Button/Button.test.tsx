import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';
import { DS_PREFIX } from '@vcds/shared/prefix';

expect.extend(toHaveNoViolations);

const p = DS_PREFIX; // e.g. 'vcds'

describe('Button', () => {
  // ─── Rendering ───────────────────────────────────────────────
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders with default variant and size classes', () => {
    const { container } = render(<Button>Default</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain(`${p}-button--primary`);
    expect(button?.className).toContain(`${p}-button--md`);
  });

  // ─── Variants ────────────────────────────────────────────────
  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'renders %s variant',
    (variant) => {
      const { container } = render(<Button variant={variant}>Test</Button>);
      expect(container.querySelector('button')?.className).toContain(
        `${p}-button--${variant}`
      );
    }
  );

  // ─── Sizes ───────────────────────────────────────────────────
  it.each(['sm', 'md', 'lg'] as const)('renders %s size', (size) => {
    const { container } = render(<Button size={size}>Test</Button>);
    expect(container.querySelector('button')?.className).toContain(
      `${p}-button--${size}`
    );
  });

  // ─── Interaction ─────────────────────────────────────────────
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} isLoading>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ─── Loading State ───────────────────────────────────────────
  it('shows loading state with correct attributes and class', () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button.className).toContain(`${p}-button--loading`);
  });

  // ─── Full Width ──────────────────────────────────────────────
  it('applies full-width class', () => {
    const { container } = render(<Button fullWidth>Wide</Button>);
    expect(container.querySelector('button')?.className).toContain(`${p}-button--full-width`);
  });

  // ─── Ref Forwarding ──────────────────────────────────────────
  it('forwards ref to the button element', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
  });

  // ─── Prefix ──────────────────────────────────────────────────
  it('uses the configured DS_PREFIX for all class names', () => {
    const { container } = render(<Button variant="secondary" size="lg">Prefixed</Button>);
    const button = container.querySelector('button')!;
    expect(button.className).toContain(`${p}-button`);
    expect(button.className).not.toContain('undefined');
  });

  // ─── Accessibility ───────────────────────────────────────────
  it('has no axe violations (primary)', async () => {
    const { container } = render(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations (disabled)', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations (loading)', async () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
