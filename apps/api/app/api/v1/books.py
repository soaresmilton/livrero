from fastapi import APIRouter, Depends, Query, status

from app.api.v1.deps import get_book_repository, get_current_user, get_open_library
from app.application.dto.book_dto import (
    BookResponse,
    CreateBookRequest,
    OpenLibraryBookResponse,
    PaginatedBookResponse,
    UpdateBookRequest,
)
from app.application.use_cases.manage_books import (
    AddBook,
    ListUserBooks,
    RemoveBook,
    SearchOpenLibrary,
    UpdateBook,
)
from app.domain.entities.book import BookStatus
from app.domain.entities.user import User
from app.domain.repositories.book_repository import BookRepository
from app.infrastructure.integrations.open_library import OpenLibraryIntegration

router = APIRouter(prefix="/books", tags=["Books"])


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def add_book(
    request: CreateBookRequest,
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> BookResponse:
    """Add a new book to the current user's library."""
    use_case = AddBook(repo)
    return await use_case.execute(user.id, request)


@router.patch("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    request: UpdateBookRequest,
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> BookResponse:
    """Partially update a book owned by the current user."""
    import uuid

    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError as e:
        from app.shared.exceptions import bad_request

        raise bad_request("Invalid book ID format") from e

    use_case = UpdateBook(repo)
    return await use_case.execute(user.id, parsed_uuid, request)


@router.get("/search", response_model=list[OpenLibraryBookResponse])
async def search_books(
    q: str = Query(...),
    limit: int = Query(5, ge=1, le=20),
    open_library: OpenLibraryIntegration = Depends(get_open_library),
) -> list[OpenLibraryBookResponse]:
    """Search Open Library for books matching a query string."""
    use_case = SearchOpenLibrary(open_library)
    return await use_case.execute(q, limit)


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: str,
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> BookResponse:
    """Fetch a single book owned by the current user."""
    import uuid

    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError as e:
        from app.shared.exceptions import bad_request

        raise bad_request("Invalid book ID format") from e

    book = await repo.get_by_id(parsed_uuid)
    from app.shared.exceptions import not_found

    if not book or book.user_id != user.id or book.is_deleted:
        raise not_found("Book not found")

    return BookResponse.model_validate(book)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> None:
    """Delete a book owned by the current user."""
    import uuid

    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError as e:
        from app.shared.exceptions import bad_request

        raise bad_request("Invalid book ID format") from e

    use_case = RemoveBook(repo)
    await use_case.execute(user.id, parsed_uuid)


@router.get("", response_model=PaginatedBookResponse)
async def list_books(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=500),
    book_status: BookStatus | None = Query(None, alias="status"),
    q: str | None = Query(None, description="Search query for title or author"),
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> PaginatedBookResponse:
    """List the current user's books with pagination, status, and search filters."""
    use_case = ListUserBooks(repo)
    return await use_case.execute(user.id, page, size, book_status, q)
