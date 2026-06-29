import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AbandonModal } from './AbandonModal';

test('AbandonModal renders correctly', () => {
  render(
    <AbandonModal
      isOpen={true}
      onClose={() => {}}
      onConfirm={() => {}}
      title="Test Book"
    />
  );
  
  expect(screen.getByText('Abandonar Leitura')).toBeInTheDocument();
  expect(screen.getByText(/Tem certeza que deseja abandonar o livro/)).toBeInTheDocument();
  expect(screen.getByText('Sim, Abandonar')).toBeInTheDocument();
  expect(screen.getByText('Voltar')).toBeInTheDocument();
});

test('AbandonModal does not render when isOpen is false', () => {
  render(
    <AbandonModal
      isOpen={false}
      onClose={() => {}}
      onConfirm={() => {}}
      title="Test Book"
    />
  );
  
  expect(screen.queryByText('Abandonar Leitura')).not.toBeInTheDocument();
});

test('AbandonModal triggers onClose when Cancel is clicked', async () => {
  const handleClose = vi.fn();
  render(
    <AbandonModal
      isOpen={true}
      onClose={handleClose}
      onConfirm={() => {}}
      title="Test Book"
    />
  );
  
  await userEvent.click(screen.getByText('Voltar'));
  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('AbandonModal triggers onConfirm when Confirm is clicked', async () => {
  const handleConfirm = vi.fn();
  render(
    <AbandonModal
      isOpen={true}
      onClose={() => {}}
      onConfirm={handleConfirm}
      title="Test Book"
    />
  );
  
  await userEvent.click(screen.getByText('Sim, Abandonar'));
  expect(handleConfirm).toHaveBeenCalledTimes(1);
});

test('AbandonModal renders updating state', () => {
  render(
    <AbandonModal 
      isOpen={true} 
      onClose={() => {}} 
      onConfirm={() => {}} 
      title="Test" 
      isUpdating={true} 
    />
  );
  expect(screen.getByText('Abandonando...')).toBeInTheDocument();
  expect(screen.getByText('Voltar')).toBeDisabled();
  expect(screen.getByText('Abandonando...').closest('button')).toBeDisabled();
});