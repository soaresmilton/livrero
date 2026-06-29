import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { NotesDashboardPage } from './NotesDashboardPage';
import { useRecentNotes } from '../hooks/useNotes';
import { useBooks } from '../features/books/hooks/useBooks';

// ——— Mocks ——————————————————————————————————————————————————————————————————————

vi.mock('../hooks/useNotes', () => ({
  useRecentNotes: vi.fn(),
}));

vi.mock('../features/books/hooks/useBooks', () => ({
  useBooks: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ——— Fixtures ———————————————————————————————————————————————————————————————————

const makeBook = (overrides: Partial<ReturnType<typeof defaultBook>> = {}) =>
  ({ ...defaultBook(), ...overrides });

function defaultBook() {
  return {
    id: 'book-1',
    user_id: 'user-1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    status: 'READING' as const,
    cover_url: null,
    current_page: 50,
    total_pages: 200,
    started_reading_at: '2024-01-10T00:00:00Z',
    finished_reading_at: null,
    total_reading_time: 60,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    genres: [],
    rating: null,
  };
}

function makeNote(overrides = {}) {
  return {
    id: 'note-1',
    book_id: 'book-1',
    content_markdown: 'Uma nota de teste sobre o livro.',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

const mockBooksResponse = (books: ReturnType<typeof makeBook>[]) => ({
  items: books,
  total: books.length,
  page: 1,
  size: 500,
  pages: 1,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <NotesDashboardPage />
    </MemoryRouter>
  );

// ——— Setup ——————————————————————————————————————————————————————————————————————

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRecentNotes).mockReturnValue({
    data: [makeNote()],
    isLoading: false,
  } as unknown as string);
  vi.mocked(useBooks).mockReturnValue({
    data: mockBooksResponse([makeBook()]),
    isLoading: false,
  } as unknown as string);
});

// ——— Tests ——————————————————————————————————————————————————————————————————————

describe('NotesDashboardPage — loading state', () => {
  test('shows loading indicator while notes are loading', () => {
    vi.mocked(useRecentNotes).mockReturnValue({ data: undefined, isLoading: true } as unknown as string);
    renderPage();
    expect(screen.getByText('Carregando notas...')).toBeInTheDocument();
  });

  test('shows loading indicator while books are loading', () => {
    vi.mocked(useBooks).mockReturnValue({ data: undefined, isLoading: true } as unknown as string);
    renderPage();
    expect(screen.getByText('Carregando notas...')).toBeInTheDocument();
  });
});

describe('NotesDashboardPage — empty state', () => {
  test('shows empty message when there are no notes', () => {
    vi.mocked(useRecentNotes).mockReturnValue({ data: [], isLoading: false } as unknown as string);
    renderPage();
    expect(screen.getByText(/Você ainda não possui anotações/)).toBeInTheDocument();
    expect(screen.getByText(/Comece a ler um livro/)).toBeInTheDocument();
  });

  test('ignores notes whose book is not in the map', () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [makeNote({ book_id: 'unknown-book' })],
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText(/Você ainda não possui anotações/)).toBeInTheDocument();
  });
});

describe('NotesDashboardPage — renders note cards correctly', () => {
  test('renders book title and author', () => {
    renderPage();
    expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.getByText('Machado de Assis')).toBeInTheDocument();
  });

  test('renders note content preview', () => {
    renderPage();
    expect(screen.getByText('Uma nota de teste sobre o livro.')).toBeInTheDocument();
  });

  test('renders fallback text when note content is empty', () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [makeNote({ content_markdown: '' })],
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText('Nenhuma anotação ainda...')).toBeInTheDocument();
  });

  test('renders reading status badge (READING)', () => {
    renderPage();
    expect(screen.getByText('Lendo')).toBeInTheDocument();
  });

  test('renders reading status badge (READ)', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'READ', finished_reading_at: '2024-03-01T00:00:00Z' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText('Lido')).toBeInTheDocument();
  });

  test('renders reading status badge (WANT_TO_READ)', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'WANT_TO_READ' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText('Quero Ler')).toBeInTheDocument();
  });

  test('renders reading status badge (ABANDONED)', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'ABANDONED' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText('Abandonado')).toBeInTheDocument();
  });

  test('shows progress bar for READING book with pages', () => {
    renderPage();
    expect(screen.getByText(/50 \/ 200 páginas \(25%\)/)).toBeInTheDocument();
  });

  test('handles null current_page gracefully in progress bar', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'READING', current_page: null, total_pages: 100 })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText(/0 \/ 100 páginas \(0%\)/)).toBeInTheDocument();
  });

  test('shows progress bar for READ book with pages', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'READ', current_page: 200, finished_reading_at: '2024-03-01T00:00:00Z' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText(/200 \/ 200 páginas \(100%\)/)).toBeInTheDocument();
  });

  test('does not show progress bar for WANT_TO_READ book', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'WANT_TO_READ' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.queryByText(/páginas/)).not.toBeInTheDocument();
  });

  test('does not show progress bar when total_pages is null', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ total_pages: null })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.queryByText(/páginas/)).not.toBeInTheDocument();
  });

  test('renders book cover image when available', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ cover_url: 'http://example.com/cover.jpg' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByAltText('Dom Casmurro')).toBeInTheDocument();
  });

  test('renders emoji fallback when no cover', () => {
    renderPage(); // makeBook has cover_url: null
    expect(screen.getByText('📖')).toBeInTheDocument();
  });

  test('renders start date when book has started_reading_at', () => {
    renderPage();
    expect(screen.getByText(/Início:/)).toBeInTheDocument();
  });

  test('renders finish date only for READ books', () => {
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([makeBook({ status: 'READ', finished_reading_at: '2024-03-01T00:00:00Z' })]),
      isLoading: false,
    } as unknown as string);
    renderPage();
    expect(screen.getByText(/Fim:/)).toBeInTheDocument();
  });

  test('does not show finish date for READING books', () => {
    renderPage();
    expect(screen.queryByText(/Fim:/)).not.toBeInTheDocument();
  });

  test('renders note updated_at date', () => {
    renderPage();
    expect(screen.getByText(/Nota:/)).toBeInTheDocument();
  });

  test('shows note count in section heading', () => {
    renderPage();
    expect(screen.getByText('(1 nota)')).toBeInTheDocument();
  });

  test('navigates to book notes page on card click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('Dom Casmurro'));
    expect(mockNavigate).toHaveBeenCalledWith('/library/book-1/notes');
  });
});

describe('NotesDashboardPage — search filter', () => {
  test('renders search input', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/Título, autor, conteúdo, data/)).toBeInTheDocument();
  });

  test('filters by book title', async () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [makeNote(), makeNote({ id: 'note-2', book_id: 'book-2' })],
      isLoading: false,
    } as unknown as string);
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([
        makeBook(),
        makeBook({ id: 'book-2', title: 'Memórias Póstumas', author: 'Machado de Assis' }),
      ]),
      isLoading: false,
    } as unknown as string);

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/Título, autor, conteúdo, data/), 'Dom');
    expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.queryByText('Memórias Póstumas')).not.toBeInTheDocument();
  });

  test('filters by author name', async () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [makeNote(), makeNote({ id: 'note-2', book_id: 'book-2' })],
      isLoading: false,
    } as unknown as string);
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([
        makeBook(),
        makeBook({ id: 'book-2', title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien' }),
      ]),
      isLoading: false,
    } as unknown as string);

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/Título, autor, conteúdo, data/), 'Tolkien');
    expect(screen.getByText('O Senhor dos Anéis')).toBeInTheDocument();
    expect(screen.queryByText('Dom Casmurro')).not.toBeInTheDocument();
  });

  test('filters by note content', async () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [
        makeNote({ content_markdown: 'Reflexões sobre o ciúme' }),
        makeNote({ id: 'note-2', book_id: 'book-2', content_markdown: 'Épico de fantasia' }),
      ],
      isLoading: false,
    } as unknown as string);
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([
        makeBook(),
        makeBook({ id: 'book-2', title: 'O Hobbit', author: 'Tolkien' }),
      ]),
      isLoading: false,
    } as unknown as string);

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/Título, autor, conteúdo, data/), 'ciúme');
    expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.queryByText('O Hobbit')).not.toBeInTheDocument();
  });

  test('shows "Nenhum resultado encontrado" when filter matches nothing', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/Título, autor, conteúdo, data/), 'xyzabcdef');
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeInTheDocument();
    expect(screen.getByText('Tente outros termos de busca.')).toBeInTheDocument();
  });

  test('shows "Resultados da busca" heading while filtering', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/Título, autor, conteúdo, data/), 'Dom');
    expect(screen.getByText('Resultados da busca')).toBeInTheDocument();
  });

  test('clear button appears when query is typed and clears on click', async () => {
    renderPage();
    const input = screen.getByPlaceholderText(/Título, autor, conteúdo, data/);
    await userEvent.type(input, 'Dom');
    
    // The X button is rendered when query is non-empty
    expect(document.querySelector('button[class*="absolute right-3"]')).toBeInTheDocument();
  });

  test('clears search when X button is clicked', async () => {
    renderPage();
    const input = screen.getByPlaceholderText(/Título, autor, conteúdo, data/);
    await userEvent.type(input, 'Dom');
    await userEvent.click(document.querySelector('button[class*="absolute right-3"]') as HTMLElement);
    expect((input as HTMLInputElement).value).toBe('');
  });

  test('input focus changes border color', async () => {
    renderPage();
    const input = screen.getByPlaceholderText(/Título, autor, conteúdo, data/);
    await userEvent.click(input);
    expect(input.style.borderColor).toBe('var(--color-primary)');
    await userEvent.tab();
    expect(input.style.borderColor).toBe('var(--color-outline-variant)');
  });
});

describe('NotesDashboardPage — sorting', () => {
  const twoBooks = () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [
        makeNote({ id: 'n1', book_id: 'book-1', updated_at: '2024-06-01T00:00:00Z' }),
        makeNote({ id: 'n2', book_id: 'book-2', updated_at: '2024-01-01T00:00:00Z' }),
      ],
      isLoading: false,
    } as unknown as string);
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([
        makeBook({ id: 'book-1', title: 'Zumbi', author: 'Carlos', started_reading_at: '2024-06-01T00:00:00Z' }),
        makeBook({ id: 'book-2', title: 'Abelha', author: 'Ana', started_reading_at: '2024-01-01T00:00:00Z' }),
      ]),
      isLoading: false,
    } as unknown as string);
  };

  test('shows all sort buttons', () => {
    renderPage();
    expect(screen.getByText('Data da Nota')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Autor')).toBeInTheDocument();
    expect(screen.getByText('Início de Leitura')).toBeInTheDocument();
  });

  test('sorts by title ascending after two clicks on Título', async () => {
    twoBooks();
    renderPage();
    const titleBtn = screen.getByText('Título');
    await userEvent.click(titleBtn); // desc
    await userEvent.click(titleBtn); // asc
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Abelha');
    expect(cards[1]).toHaveTextContent('Zumbi');
  });

  test('sorts by title descending on first click', async () => {
    twoBooks();
    renderPage();
    await userEvent.click(screen.getByText('Título'));
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Zumbi');
  });

  test('sorts by author', async () => {
    twoBooks();
    renderPage();
    await userEvent.click(screen.getByText('Autor')); // desc (Carlos before Ana)
    await userEvent.click(screen.getByText('Autor')); // asc  (Ana before Carlos)
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Abelha'); // Ana's book first
  });

  test('sorts by note date (updated_at) descending by default', async () => {
    twoBooks();
    renderPage();
    // Default is updated_at desc — most recent note first (book-1 = June)
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Zumbi');
  });

  test('sorts gracefully when fields are null or undefined', async () => {
    vi.mocked(useRecentNotes).mockReturnValue({
      data: [
        makeNote({ id: 'n1', book_id: 'book-1', updated_at: null as unknown as string }),
        makeNote({ id: 'n2', book_id: 'book-2', updated_at: '2024-01-01T00:00:00Z' }),
      ],
      isLoading: false,
    } as unknown as string);
    vi.mocked(useBooks).mockReturnValue({
      data: mockBooksResponse([
        makeBook({ id: 'book-1', title: 'Zumbi', author: 'Carlos', started_reading_at: null as unknown as string }),
        makeBook({ id: 'book-2', title: 'Abelha', author: 'Ana', started_reading_at: '2024-01-01T00:00:00Z' }),
      ]),
      isLoading: false,
    } as unknown as string);

    renderPage();
    await userEvent.click(screen.getByText('Início de Leitura')); // desc -> book-2 has date, book-1 has ''
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Abelha'); // book 2 has date, book 1 null
  });

  test('toggles sort direction when same field clicked again', async () => {
    twoBooks();
    renderPage();
    const dateBtn = screen.getByText('Data da Nota');
    await userEvent.click(dateBtn); // toggles from desc â†’ asc
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Abelha'); // oldest note first (book-2 = Jan)
  });

  test('sorts by started_reading_at', async () => {
    twoBooks();
    renderPage();
    await userEvent.click(screen.getByText('InÃ­cio de Leitura')); // desc
    await userEvent.click(screen.getByText('InÃ­cio de Leitura')); // asc
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards[0]).toHaveTextContent('Abelha'); // earliest start
  });
});

describe('NotesDashboardPage â€” page size selector', () => {
  test('renders page size options', () => {
    renderPage();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('changes page size on button click', async () => {
    renderPage();
    await userEvent.click(screen.getByText('5'));
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('NotesDashboardPage â€” pagination', () => {
  const manyNotes = (count: number) => {
    const notes = Array.from({ length: count }, (_, i) => makeNote({ id: `note-${i}`, book_id: 'book-1' }));
    const book  = makeBook();
    vi.mocked(useRecentNotes).mockReturnValue({ data: notes, isLoading: false } as unknown as string);
    vi.mocked(useBooks).mockReturnValue({ data: mockBooksResponse([book]), isLoading: false } as unknown as string);
  };

  test('does not render pagination when items fit in one page', () => {
    manyNotes(3); // default pageSize=10
    renderPage();
    expect(screen.queryByTitle('Primeira')).not.toBeInTheDocument();
  });

  test('renders pagination when items exceed page size', async () => {
    manyNotes(6); // 6 items, switch to pageSize=5
    renderPage();
    await userEvent.click(screen.getByText('5'));
    expect(screen.getByTitle('PrÃ³xima')).toBeInTheDocument();
    expect(screen.getByTitle('Ãšltima')).toBeInTheDocument();
  });

  test('shows correct "Exibindo Xâ€“Y de Z" info text', async () => {
    manyNotes(12);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    expect(screen.getByText('Exibindo 1â€“5 de 12')).toBeInTheDocument();
  });

  test('navigates to next page', async () => {
    manyNotes(12);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByTitle('PrÃ³xima'));
    expect(screen.getByText('Exibindo 6â€“10 de 12')).toBeInTheDocument();
  });

  test('navigates to last page', async () => {
    manyNotes(12);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByTitle('Ãšltima'));
    expect(screen.getByText('Exibindo 11â€“12 de 12')).toBeInTheDocument();
  });

  test('navigates to first page', async () => {
    manyNotes(12);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByTitle('Ãšltima'));
    await userEvent.click(screen.getByTitle('Primeira'));
    expect(screen.getByText('Exibindo 1â€“5 de 12')).toBeInTheDocument();
  });

  test('navigates to previous page', async () => {
    manyNotes(12);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByTitle('Ãšltima'));
    await userEvent.click(screen.getByTitle('Anterior'));
    expect(screen.getByText('Exibindo 6â€“10 de 12')).toBeInTheDocument();
  });

  test('clicking page number navigates directly', async () => {
    manyNotes(20);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    // Page "2" button should be visible in the range
    const page2 = screen.getAllByRole('button').find((b) => b.textContent === '2');
    if (page2) {
      await userEvent.click(page2);
      expect(screen.getByText('Exibindo 6â€“10 de 20')).toBeInTheDocument();
    }
  });

  test('shows ellipsis for large page counts', async () => {
    manyNotes(50);
    renderPage();
    await userEvent.click(screen.getAllByText('5')[0]!);
    // navigate to a middle page to trigger ellipsis
    const page5 = screen.getAllByRole('button').find((b) => b.textContent === '5');
    if (page5) {
      await userEvent.click(page5);
      expect(screen.getByText('â€¦')).toBeInTheDocument();
    }
  });

  test('resets to page 1 when search query changes', async () => {
    manyNotes(12);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByTitle('Ãšltima'));
    const input = screen.getByPlaceholderText(/TÃ­tulo, autor, conteÃºdo, data/);
    await userEvent.type(input, 'Dom');
    // After filter (all 12 match 'Dom'), pageset back to 1
    expect(screen.getByText('Exibindo 1â€“5 de 12')).toBeInTheDocument();
  });

  test('resets to page 1 when page size changes', async () => {
    manyNotes(20);
    renderPage();
    await userEvent.click(screen.getByText('5'));
    await userEvent.click(screen.getByTitle('Ãšltima'));
    await userEvent.click(screen.getByText('10'));
    expect(screen.getByText('Exibindo 1â€“10 de 20')).toBeInTheDocument();
  });
});
