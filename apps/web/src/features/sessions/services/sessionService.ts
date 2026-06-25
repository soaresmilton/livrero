import { api } from '@/services/api';
import { EndSessionRequest, PaginatedReadingSessionResponse, ReadingSession, StartSessionRequest } from '../types';

export const sessionService = {
  startSession: async (data: StartSessionRequest): Promise<ReadingSession> => {
    const response = await api.post<ReadingSession>('/sessions', data);
    return response.data;
  },

  endSession: async (sessionId: string, data: EndSessionRequest): Promise<ReadingSession> => {
    const response = await api.post<ReadingSession>(`/sessions/${sessionId}/end`, data);
    return response.data;
  },

  discardSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/sessions/${sessionId}`);
  },

  getActiveSession: async (): Promise<ReadingSession | null> => {
    const response = await api.get<ReadingSession | null>('/sessions/active');
    return response.data;
  },

  getBookSessions: async (bookId: string, page = 1, size = 20): Promise<PaginatedReadingSessionResponse> => {
    const response = await api.get<PaginatedReadingSessionResponse>(`/sessions/book/${bookId}`, {
      params: { page, size },
    });
    return response.data;
  },
};
