import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import type { BookStatus, Book } from '../types';

export function useBooks(page: number, limit: number, status?: BookStatus, q?: string) {
  return useQuery({
    queryKey: ['books', { page, limit, status, q }],
    queryFn: () => bookService.getBooks(page, limit, status, q),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => bookService.getBook(id),
    enabled: !!id,
  });
}

export function useAddBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => bookService.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>> }) =>
      bookService.updateBook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books', variables.id] });
    },
  });
}

export function useUpdateBookStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) => 
      bookService.updateBookStatus(id, data.status as BookStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
