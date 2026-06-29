import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('Button renders children correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('Button triggers onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await userEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Button can be disabled', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick} disabled>Click me</Button>);
  
  const button = screen.getByText('Click me');
  expect(button).toBeDisabled();
  
  await userEvent.click(button);
  expect(handleClick).not.toHaveBeenCalled();
});

test('Button applies variant and size classes', () => {
  const { container } = render(
    <Button variant="secondary" fullWidth>Secondary Large</Button>
  );
  const button = container.firstChild as HTMLElement;
  expect(button.className).toContain('text-[var(--color-primary)]');
  expect(button.className).toContain('w-full');
});
test('Button renders loading state', () => {
  render(<Button isLoading>Click me</Button>);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  expect(screen.queryByText('Click me')).not.toBeInTheDocument();
});