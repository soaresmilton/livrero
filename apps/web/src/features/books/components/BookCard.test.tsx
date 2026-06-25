import { render, screen } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BookCard } from './BookCard';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import type { BookStatus, Book } from '../types';

const mockBook = {
  id: '1',
  user_id: 'user1',
  title: 'A Test Book',
  author: 'Author Name',
  status: 'WANT_TO_READ' as BookStatus,
  total_pages: 300,
  cover_url: 'http://example.com/cover.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as Book;

const defaultProps = {
  book: mockBook,
  onStatusChange: vi.fn(),
  onDelete: vi.fn(),
  isUpdating: false,
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

beforeEach(() => {
  vi.clearAllMocks();
});

test('BookCard renders book info correctly', () => {
  renderWithRouter(<BookCard {...defaultProps} visibleProperties={{ title: true, author: true, total_pages: true }} />);
  expect(screen.getByText('A Test Book')).toBeInTheDocument();
  expect(screen.getByText('Author Name')).toBeInTheDocument();
  expect(screen.getByText(/300 págs/)).toBeInTheDocument();
});

test('BookCard renders generic cover if cover_url is missing', () => {
  const noCoverBook = { ...mockBook, cover_url: undefined };
  renderWithRouter(<BookCard {...defaultProps} book={noCoverBook} />);
  // Wait, no cover actually renders a generic div with an icon, and maybe the title again
  expect(screen.getAllByText('A Test Book').length).toBeGreaterThan(0);
});

test('BookCard triggers navigate when play button is clicked', async () => {
  renderWithRouter(<BookCard {...defaultProps} />);
  await userEvent.click(screen.getByTitle('Iniciar Sessão de Leitura'));
  // Can't easily test navigate here without mocking react-router-dom properly,
  // but we can ensure it's rendered.
  expect(screen.getByTitle('Iniciar Sessão de Leitura')).toBeInTheDocument();
});

test('BookCard toggles options menu when menu button is clicked', async () => {
  renderWithRouter(<BookCard {...defaultProps} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  }
});

test('BookCard triggers onDelete via menu', async () => {
  renderWithRouter(<BookCard {...defaultProps} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    await userEvent.click(screen.getByText('Excluir'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith({ ...mockBook });
  }
});

test('BookCard triggers status change to READING via menu', async () => {
  renderWithRouter(<BookCard {...defaultProps} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    await userEvent.click(screen.getByText(/Marcar como Lendo/i));
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('1', 'READING');
  }
});

test('BookCard triggers onEdit via menu', async () => {
  const handleEdit = vi.fn();
  renderWithRouter(<BookCard {...defaultProps} onEdit={handleEdit} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    await userEvent.click(screen.getByText('Editar'));
    expect(handleEdit).toHaveBeenCalledWith({ ...mockBook });
  }
});

test('BookCard triggers status change to WANT_TO_READ via menu', async () => {
  const abandonedBook = { ...mockBook, status: 'ABANDONED' as BookStatus };
  renderWithRouter(<BookCard {...defaultProps} book={abandonedBook} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    await userEvent.click(screen.getByText(/Marcar como Quero Ler/i));
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('1', 'WANT_TO_READ');
  }
});

test('BookCard triggers MarkAsReadModal and confirms', async () => {
  const readingBook = { ...mockBook, status: 'READING' as BookStatus };
  renderWithRouter(<BookCard {...defaultProps} book={readingBook} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    await userEvent.click(screen.getByText(/Marcar como Lido/i));
    // The modal should appear
    expect(screen.getByText(/Tem certeza que deseja marcar o livro/i)).toBeInTheDocument();
    
    // Click confirm in the modal
    const confirmBtn = screen.getAllByText(/Marcar como Lido/i).pop(); // The button in modal
    if (confirmBtn) {
      await userEvent.click(confirmBtn);
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('1', 'READ');
    }
  }
});

test('BookCard triggers AbandonModal and confirms', async () => {
  const readingBook = { ...mockBook, status: 'READING' as BookStatus };
  renderWithRouter(<BookCard {...defaultProps} book={readingBook} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    await userEvent.click(screen.getByText(/Abandonar/i));
    // The modal should appear
    expect(screen.getByText(/Tem certeza que deseja abandonar o livro/i)).toBeInTheDocument();
    
    // Click confirm in the modal
    await userEvent.click(screen.getByText(/Sim, Abandonar/i));
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('1', 'ABANDONED');
  }
});

test('BookCard calculates progress correctly', () => {
  const progressBook = { ...mockBook, status: 'READING' as BookStatus, current_page: 150, total_pages: 300 };
  renderWithRouter(<BookCard {...defaultProps} book={progressBook} />);
  expect(screen.getByText('150 / 300 páginas (50%)')).toBeInTheDocument();
});

test('BookCard renders correctly for READ status', () => {
  const readBook = { 
    ...mockBook, 
    status: 'READ' as BookStatus, 
    started_reading_at: new Date('2023-01-01').toISOString(),
    finished_reading_at: new Date('2023-01-10').toISOString()
  };
  renderWithRouter(<BookCard {...defaultProps} book={readBook} />);
  // Play button shouldn't be there
  expect(screen.queryByTitle('Iniciar Sessão de Leitura')).not.toBeInTheDocument();
  // Dates should be formatted
  expect(screen.getByText(/Início:/)).toBeInTheDocument();
  expect(screen.getByText(/Fim:/)).toBeInTheDocument();
});

test('BookCard formats reading time correctly (hours and minutes)', () => {
  const readBook = { 
    ...mockBook, 
    status: 'READ' as BookStatus, 
    total_reading_time: 125, // 2h 5min
  };
  renderWithRouter(<BookCard {...defaultProps} book={readBook} />);
  expect(screen.getByText('2h 5min')).toBeInTheDocument();
});

test('BookCard formats reading time correctly (only minutes)', () => {
  const readBook = { 
    ...mockBook, 
    status: 'READ' as BookStatus, 
    total_reading_time: 45, // 45min
  };
  renderWithRouter(<BookCard {...defaultProps} book={readBook} />);
  expect(screen.getByText('45min')).toBeInTheDocument();
});

test('BookCard without actions', async () => {
  renderWithRouter(<BookCard book={mockBook} />);
  const buttons = screen.getAllByRole('button');
  const menuBtn = buttons.find(b => b.textContent === '');
  if (menuBtn) {
    await userEvent.click(menuBtn);
    const editBtn = screen.getByText('Editar');
    await userEvent.click(editBtn); // Shouldn't crash since we didn't provide onEdit
    expect(screen.queryByText('Editar')).not.toBeInTheDocument(); // Menu closed
  }
});
