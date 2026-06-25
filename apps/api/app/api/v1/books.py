from fastapi import APIRouter, Depends, Query, status

from app.api.v1.deps import get_book_repository, get_current_user, get_open_library
from app.application.dto.book_dto import (
    BookResponse,
    CreateBookRequest,
    UpdateBookRequest,
    OpenLibraryBookResponse,
    PaginatedBookResponse,
)
from app.application.use_cases.manage_books import (
    AddBook,
    UpdateBook,
    ListUserBooks,
    SearchOpenLibrary,
    RemoveBook,
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
    use_case = AddBook(repo)
    return await use_case.execute(user.id, request)


@router.patch("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    request: UpdateBookRequest,
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> BookResponse:
    import uuid
    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError:
        from app.shared.exceptions import bad_request
        raise bad_request("Invalid book ID format")
        
    use_case = UpdateBook(repo)
    return await use_case.execute(user.id, parsed_uuid, request)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> None:
    import uuid
    try:
        parsed_uuid = uuid.UUID(book_id)
    except ValueError:
        from app.shared.exceptions import bad_request
        raise bad_request("Invalid book ID format")
        
    use_case = RemoveBook(repo)
    await use_case.execute(user.id, parsed_uuid)


@router.get("", response_model=PaginatedBookResponse)
async def list_books(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    book_status: BookStatus | None = Query(None, alias="status"),
    q: str | None = Query(None, description="Search query for title or author"),
    user: User = Depends(get_current_user),
    repo: BookRepository = Depends(get_book_repository),
) -> PaginatedBookResponse:
    use_case = ListUserBooks(repo)
    return await use_case.execute(user.id, page, size, book_status, q)


@router.get("/search", response_model=list[OpenLibraryBookResponse])
async def search_books(
    q: str = Query(...),
    limit: int = Query(5, ge=1, le=20),
    open_library: OpenLibraryIntegration = Depends(get_open_library),
) -> list[OpenLibraryBookResponse]:
    use_case = SearchOpenLibrary(open_library)
    return await use_case.execute(q, limit)
