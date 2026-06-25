import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecentNotes, useBookNote, useSaveBookNote } from '../useNotes';
import { noteService } from '../../services/noteService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../services/noteService', () => ({
  noteService: {
    getRecentNotes: vi.fn(),
    getBookNote: vi.fn(),
    saveBookNote: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('useRecentNotes should fetch recent notes', async () => {
    const mockNotes = [{ id: '1', content_markdown: 'test' }];
    vi.mocked(noteService.getRecentNotes).mockResolvedValueOnce(mockNotes as any);

    const { result } = renderHook(() => useRecentNotes(10), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNotes);
  });

  it('useBookNote should fetch note for book', async () => {
    const mockNote = { id: '1', content_markdown: 'test' };
    vi.mocked(noteService.getBookNote).mockResolvedValueOnce(mockNote as any);

    const { result } = renderHook(() => useBookNote('book-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockNote);
  });

  it('useSaveBookNote should call save endpoint', async () => {
    const mockNote = { id: '1', content_markdown: 'updated' };
    vi.mocked(noteService.saveBookNote).mockResolvedValueOnce(mockNote as any);

    const { result } = renderHook(() => useSaveBookNote(), { wrapper });

    result.current.mutate({ bookId: 'book-1', data: { content_markdown: 'updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(noteService.saveBookNote).toHaveBeenCalledWith('book-1', { content_markdown: 'updated' });
  });
});
