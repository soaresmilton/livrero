from unittest.mock import MagicMock, patch

import pytest

from app.infrastructure.integrations.open_library import OpenLibraryIntegration


@pytest.mark.asyncio
async def test_open_library_client():
    client = OpenLibraryIntegration()

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "docs": [
                {
                    "title": "Test Book",
                    "author_name": ["Author 1"],
                    "first_publish_year": 2020,
                    "number_of_pages_median": 100,
                    "isbn": ["1234567890"],
                    "cover_i": 12345,
                }
            ]
        }
        mock_get.return_value = mock_response

        results = await client.search("Test")
        assert len(results) == 1
        assert results[0].title == "Test Book"
        assert results[0].author == "Author 1"
        assert results[0].published_year == 2020
        assert results[0].total_pages == 100
        assert results[0].isbn == "1234567890"


@pytest.mark.asyncio
async def test_open_library_client_error():
    client = OpenLibraryIntegration()

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = Exception("HTTP Error")
        mock_get.return_value = mock_response

        try:
            await client.search("Error")
            pytest.fail("Should have raised exception")
        except Exception:
            pass
