import { renderHook, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { useBooks, useAddBook, useBook, useUpdateBook, useUpdateBookStatus, useDeleteBook } from './useBooks';
import { bookService } from '../services/bookService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { Book, BookStatus } from '../types';

vi.mock('../services/bookService', () => ({
  bookService: {
    getBooks: vi.fn(),
    createBook: vi.fn(),
    getBook: vi.fn(),
    updateBook: vi.fn(),
    updateBookStatus: vi.fn(),
    deleteBook: vi.fn(),
  }
}));

const mockBook = {
  id: '1',
  user_id: 'user1',
  title: 'Test Book',
  author: 'Author',
  status: 'WANT_TO_READ',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

test('useBooks fetches books on mount', async () => {
  vi.mocked(bookService.getBooks).mockResolvedValue({
    items: [mockBook as Book],
    total: 1,
    page: 1,
    size: 20,
    pages: 1
  });

  const { result } = renderHook(() => useBooks(1, 20), { wrapper: createWrapper() });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data?.items).toHaveLength(1);
  expect(result.current.data?.items[0].title).toBe('Test Book');
});

test('useAddBook handles create book', async () => {
  vi.mocked(bookService.createBook).mockResolvedValue(mockBook as Book);

  const { result } = renderHook(() => useAddBook(), { wrapper: createWrapper() });

  result.current.mutate({
    title: 'Test Book',
    author: 'Author',
    status: 'WANT_TO_READ' as BookStatus,
    total_pages: 100,
    published_year: 2020,
    isbn: '123'
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(bookService.createBook).toHaveBeenCalled();
});
test('useBook fetches single book', async () => {
  vi.mocked(bookService.getBook).mockResolvedValue(mockBook as Book);

  const { result } = renderHook(() => useBook('1'), { wrapper: createWrapper() });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(bookService.getBook).toHaveBeenCalledWith('1');
  expect(result.current.data?.title).toBe('Test Book');
});

test('useUpdateBook handles update book', async () => {
  vi.mocked(bookService.updateBook).mockResolvedValue({ ...mockBook, title: 'Updated' } as Book);

  const { result } = renderHook(() => useUpdateBook(), { wrapper: createWrapper() });

  result.current.mutate({
    id: '1',
    data: { title: 'Updated' }
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(bookService.updateBook).toHaveBeenCalledWith('1', { title: 'Updated' });
});

test('useUpdateBookStatus handles status update', async () => {
  vi.mocked(bookService.updateBookStatus).mockResolvedValue({ ...mockBook, status: 'READING' } as Book);

  const { result } = renderHook(() => useUpdateBookStatus(), { wrapper: createWrapper() });

  result.current.mutate({
    id: '1',
    data: { status: 'READING' as BookStatus }
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(bookService.updateBookStatus).toHaveBeenCalledWith('1', 'READING');
});

test('useDeleteBook handles delete book', async () => {
  vi.mocked(bookService.deleteBook).mockResolvedValue(undefined);

  const { result } = renderHook(() => useDeleteBook(), { wrapper: createWrapper() });

  result.current.mutate('1');

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(bookService.deleteBook).toHaveBeenCalledWith('1');
});