FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install dependencies first (cached layer — only busts on pyproject.toml change)
COPY pyproject.toml .
RUN pip install hatchling && \
    pip install fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic \
    "pydantic[email]" pydantic-settings "python-jose[cryptography]" \
    "pwdlib[argon2,bcrypt]" python-multipart httpx && \
    pip install pytest pytest-asyncio pytest-cov ruff

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
