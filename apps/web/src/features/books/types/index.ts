export type BookStatus = 'WANT_TO_READ' | 'READING' | 'READ' | 'ABANDONED';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  publisher?: string | null;
  published_year?: number | null;
  total_pages?: number | null;
  cover_url: string | null;
  isbn?: string | null;
  status: BookStatus;
  created_at: string;
  updated_at: string;
  current_page: number;
  started_reading_at?: string | null;
  total_reading_time: number;
  finished_reading_at?: string | null;
  genres: string[];
  rating?: number | null;
}

export interface PaginatedBookResponse {
  items: Book[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface BookSearchParams {
  q: string;
  limit?: number;
}

export interface BookSearchResult {
  title: string;
  author: string;
  publisher?: string | null;
  published_year?: number | null;
  total_pages?: number | null;
  isbn?: string | null;
  cover_url: string | null;
}
