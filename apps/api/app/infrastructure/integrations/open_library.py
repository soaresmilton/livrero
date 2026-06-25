from urllib.parse import quote

import httpx

from app.application.dto.book_dto import OpenLibraryBookResponse


class OpenLibraryIntegration:
    BASE_URL = "https://openlibrary.org/search.json"

    async def search(
        self, query: str, limit: int = 5
    ) -> list[OpenLibraryBookResponse]:
        encoded_query = quote(query)
        url = f"{self.BASE_URL}?q={encoded_query}&limit={limit}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

        results = []
        for doc in data.get("docs", []):
            book_title = doc.get("title", "Unknown Title")
            author = "Unknown Author"
            if doc.get("author_name"):
                author = doc["author_name"][0]

            isbn = None
            if doc.get("isbn") and isinstance(doc["isbn"], list):
                isbn = doc["isbn"][0]

            cover_url = None
            if doc.get("cover_i"):
                cover_url = (
                    f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-L.jpg"
                )

            publisher = None
            if doc.get("publisher") and isinstance(doc["publisher"], list):
                publisher = doc["publisher"][0]

            published_year = None
            if doc.get("first_publish_year"):
                published_year = doc["first_publish_year"]

            total_pages = None
            if doc.get("number_of_pages_median"):
                total_pages = doc["number_of_pages_median"]

            results.append(
                OpenLibraryBookResponse(
                    title=book_title,
                    author=author,
                    publisher=publisher,
                    published_year=published_year,
                    total_pages=total_pages,
                    isbn=isbn,
                    cover_url=cover_url
                )
            )
            if len(results) >= limit:
                break

        return results
