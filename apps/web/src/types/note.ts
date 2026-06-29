export interface ReadingNote {
  id: string;
  book_id: string;
  content_markdown: string;
  created_at: string;
  updated_at: string;
}

export interface SaveNoteRequest {
  content_markdown: string;
}
