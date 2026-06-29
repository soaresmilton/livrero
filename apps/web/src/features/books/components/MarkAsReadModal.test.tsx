import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MarkAsReadModal } from './MarkAsReadModal';

test('MarkAsReadModal renders correctly', () => {
  render(
    <MarkAsReadModal
      isOpen={true}
      onClose={() => {}}
      onConfirm={() => {}}
      title="Test Book"
    />
  );
  
  expect(screen.getAllByText('Marcar como Lido')).toHaveLength(2);
  expect(screen.getByText(/Tem certeza que deseja marcar o livro/)).toBeInTheDocument();
  expect(screen.getAllByText('Marcar como Lido')).toHaveLength(2); // Title and Button
  expect(screen.getByText('Cancelar')).toBeInTheDocument();
});

test('MarkAsReadModal does not render when isOpen is false', () => {
  render(
    <MarkAsReadModal
      isOpen={false}
      onClose={() => {}}
      onConfirm={() => {}}
      title="Test Book"
    />
  );
  
  expect(screen.queryByText('Marcar como Lido')).not.toBeInTheDocument();
});

test('MarkAsReadModal triggers onClose when Cancel is clicked', async () => {
  const handleClose = vi.fn();
  render(
    <MarkAsReadModal
      isOpen={true}
      onClose={handleClose}
      onConfirm={() => {}}
      title="Test Book"
    />
  );
  
  await userEvent.click(screen.getByText('Cancelar'));
  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('MarkAsReadModal triggers onConfirm when Confirm is clicked', async () => {
  const handleConfirm = vi.fn();
  render(
    <MarkAsReadModal
      isOpen={true}
      onClose={() => {}}
      onConfirm={handleConfirm}
      title="Test Book"
    />
  );
  
  await userEvent.click(screen.getAllByText('Marcar como Lido')[1]!); // Click the button
  expect(handleConfirm).toHaveBeenCalledTimes(1);
});

test('MarkAsReadModal renders updating state', () => {
  render(
    <MarkAsReadModal 
      isOpen={true} 
      onClose={() => {}} 
      onConfirm={() => {}} 
      title="Test" 
      isUpdating={true} 
    />
  );
  expect(screen.getByText('Salvando...')).toBeInTheDocument();
  expect(screen.getByText('Cancelar')).toBeDisabled();
  expect(screen.getByText('Salvando...').closest('button')).toBeDisabled();
});
