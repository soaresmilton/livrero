import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';
import { noteService } from '../noteService';

vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('noteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRecentNotes should call correct endpoint', async () => {
    const mockNotes = [{ id: '1', content_markdown: 'test' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockNotes });

    const result = await noteService.getRecentNotes(10);
    
    expect(api.get).toHaveBeenCalledWith('/notes/recent', { params: { limit: 10 } });
    expect(result).toEqual(mockNotes);
  });

  it('getBookNote should call correct endpoint', async () => {
    const mockNote = { id: '1', content_markdown: 'test' };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockNote });

    const result = await noteService.getBookNote('book-id');
    
    expect(api.get).toHaveBeenCalledWith('/books/book-id/note');
    expect(result).toEqual(mockNote);
  });

  it('saveBookNote should call correct endpoint', async () => {
    const mockNote = { id: '1', content_markdown: 'test' };
    const payload = { content_markdown: 'test' };
    vi.mocked(api.put).mockResolvedValueOnce({ data: mockNote });

    const result = await noteService.saveBookNote('book-id', payload);
    
    expect(api.put).toHaveBeenCalledWith('/books/book-id/note', payload);
    expect(result).toEqual(mockNote);
  });
});
