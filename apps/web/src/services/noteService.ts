import { api } from './api';
import { ReadingNote, SaveNoteRequest } from '../types/note';

export const noteService = {
  getRecentNotes: async (limit: number = 10): Promise<ReadingNote[]> => {
    const response = await api.get('/notes/recent', { params: { limit } });
    return response.data;
  },

  getBookNote: async (bookId: string): Promise<ReadingNote> => {
    const response = await api.get(`/books/${bookId}/note`);
    return response.data;
  },

  saveBookNote: async (bookId: string, data: SaveNoteRequest): Promise<ReadingNote> => {
    const response = await api.put(`/books/${bookId}/note`, data);
    return response.data;
  },
};
