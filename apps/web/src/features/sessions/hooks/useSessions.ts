import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '../services/sessionService';
import { EndSessionRequest, StartSessionRequest } from '../types';

export const sessionKeys = {
  all: ['sessions'] as const,
  active: () => [...sessionKeys.all, 'active'] as const,
  book: (bookId: string) => [...sessionKeys.all, 'book', bookId] as const,
};

export function useActiveSession() {
  return useQuery({
    queryKey: sessionKeys.active(),
    queryFn: sessionService.getActiveSession,
  });
}

export function useBookSessions(bookId: string, page = 1, size = 20) {
  return useQuery({
    queryKey: [...sessionKeys.book(bookId), page, size],
    queryFn: () => sessionService.getBookSessions(bookId, page, size),
    enabled: !!bookId,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartSessionRequest) => sessionService.startSession(data),
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.active(), data);
      queryClient.invalidateQueries({ queryKey: sessionKeys.book(data.book_id) });
    },
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: EndSessionRequest }) =>
      sessionService.endSession(sessionId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKeys.active(), null);
      queryClient.invalidateQueries({ queryKey: sessionKeys.book(data.book_id) });
      // Invalidate books to update current_page
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDiscardSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionService.discardSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(sessionKeys.active(), null);
      // We don't have the book_id easily here without passing it, but we can invalidate all books/sessions
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
