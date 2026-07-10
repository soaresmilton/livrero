import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/noteService';
import { SaveNoteRequest } from '../types/note';
import { toast } from '@/store/toastStore';

export const useRecentNotes = (limit: number = 10) => {
  return useQuery({
    queryKey: ['notes', 'recent', limit],
    queryFn: () => noteService.getRecentNotes(limit),
  });
};

export const useBookNote = (bookId: string) => {
  return useQuery({
    queryKey: ['notes', 'book', bookId],
    queryFn: () => noteService.getBookNote(bookId),
    enabled: !!bookId,
  });
};

export const useSaveBookNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: SaveNoteRequest }) =>
      noteService.saveBookNote(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'recent'] });
    },
    onError: () => {
      toast.error("Couldn't save your note. Try again.");
    },
  });
};
