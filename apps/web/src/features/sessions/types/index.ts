export interface StartSessionRequest {
  book_id: string;
}

export interface EndSessionRequest {
  starting_page?: number | null;
  ending_page?: number | null;
  notes?: string | null;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  start_time: string;
  end_time?: string | null;
  starting_page?: number | null;
  ending_page?: number | null;
  minutes_read?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedReadingSessionResponse {
  items: ReadingSession[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
