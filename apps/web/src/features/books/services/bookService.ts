import { api } from '@/services/api';
import type { Book, BookStatus, PaginatedBookResponse, BookSearchResult } from '../types';

export const bookService = {
  async getBooks(page = 1, limit = 10, status?: BookStatus, q?: string): Promise<PaginatedBookResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('status', status);
    }
    if (q) {
      params.append('q', q);
    }
    const response = await api.get('/books', { params });
    return response.data;
  },

  async getBook(id: string): Promise<Book> {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  async createBook(data: Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Book> {
    const response = await api.post('/books', data);
    return response.data;
  },

  async updateBook(id: string, data: Partial<Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Book> {
    const response = await api.patch(`/books/${id}`, data);
    return response.data;
  },

  async updateBookStatus(id: string, status: BookStatus): Promise<Book> {
    const response = await api.patch(`/books/${id}/status`, { status });
    return response.data;
  },

  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  },

  async searchBooks(query: string): Promise<BookSearchResult[]> {
    if (!query) return [];
    const response = await api.get('/books/search', { params: { q: query } });
    return response.data;
  }
};
