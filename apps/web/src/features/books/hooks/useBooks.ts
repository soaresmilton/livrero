import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import type { BookStatus, Book } from '../types';
import { toast } from '@/store/toastStore';

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
      toast.success('Book added to your library', 'ADDED');
    },
    onError: () => {
      toast.error("Couldn't add the book. Try again.");
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
      toast.success('Your changes were saved');
    },
    onError: () => {
      toast.error("Couldn't save changes. Try again.");
    },
  });
}

const statusToast: Record<BookStatus, { label: string; message: string }> = {
  WANT_TO_READ: { label: 'QUEUED', message: 'Added to your reading queue' },
  READING: { label: 'STARTED', message: "You're now reading this book" },
  READ: { label: 'FINISHED', message: 'Marked as finished — well done!' },
  ABANDONED: { label: 'ARCHIVED', message: 'Book moved to archive' },
};

export function useUpdateBookStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) =>
      bookService.updateBookStatus(id, data.status as BookStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      const status = variables.data.status;
      if (status && statusToast[status]) {
        const { label, message } = statusToast[status];
        toast.success(message, label);
      }
    },
    onError: () => {
      toast.error("Couldn't update status. Try again.");
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book removed from your library', 'REMOVED');
    },
    onError: () => {
      toast.error("Couldn't remove the book. Try again.");
    },
  });
}
