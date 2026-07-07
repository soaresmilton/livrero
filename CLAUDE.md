# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Livrero** is a Personal Reading OS — a digital sanctuary for managing your reading life. The application consists of:
- A **FastAPI backend** (Python 3.12) with clean architecture
- A **React 19 frontend** (TypeScript 5.8) built with Vite
- **PostgreSQL 16** database with Alembic migrations
- Docker containerization for development and deployment

**Main Features**: Library management, reading sessions tracking, markdown notes, reading habit visualization, and annual goal tracking.

## Quick Start

### Development with Docker (Recommended)
```bash
# Start all services
docker compose up --build

# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
# Health Check: http://localhost:8000/api/v1/health
```

### Backend (Python 3.12+)
```bash
cd apps/api

# Install dev dependencies
pip install -e ".[dev]"

# Lint with ruff
ruff check .

# Format with ruff
ruff format .

# Run tests with coverage
pytest --cov=app --cov-report=term-missing

# Run single test
pytest tests/test_file.py::test_function -v

# Start dev server (requires DATABASE_URL env var)
uvicorn app.main:app --reload
```

### Frontend (Node.js 20+)
```bash
cd apps/web

# Install dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Lint with ESLint
npm run lint

# Type check with TypeScript
npm run typecheck

# Build for production
npm run build

# Run tests with Vitest
npm test

# Run tests with coverage
npm test:coverage

# Run single test
npm test -- --run tests/test-file.spec.ts
```

## Architecture

### Backend: Clean Architecture (apps/api/app)
```
domain/              # Entities, repository interfaces, value objects
application/         # Use cases, DTOs, business logic
├── use_cases/       # Business workflows (login_user, manage_books, etc.)
├── dto/             # Data Transfer Objects for API contracts
└── services/        # Application services
infrastructure/      # SQLAlchemy models, database config, external services
├── persistence/     # ORM models, queries
├── config/          # Settings, environment config
└── repositories/    # Repository implementations (domain interfaces)
api/                 # HTTP endpoints (FastAPI routers)
├── v1/              # API v1 routes (auth, books, sessions, notes, health)
└── deps.py          # Dependency injection setup
shared/              # Exceptions, utilities, constants
```

**Key Principles**:
- **Dependency Inversion**: Higher layers depend on abstractions (repository interfaces), not concrete implementations
- **Domain Entities**: Core business logic lives in `domain/models.py`, not in ORM models
- **DTOs**: Use DataTransferObjects for API contracts; never expose ORM models directly
- **Migrations**: Use Alembic (in `alembic/` folder) for schema changes; auto-generate then review

### Frontend: Feature-Based Architecture (apps/web/src)
```
app/                 # Providers, routing, app setup
├── providers.tsx    # React Query, Zustand, TanStack Router setup
└── router.tsx       # Route definitions
pages/               # Top-level page components
features/            # Feature modules (auth, books, sessions, notes)
├── auth/            # Authentication feature
├── books/           # Book management
├── sessions/        # Reading sessions
└── notes/           # Markdown notes
components/          # Shared/reusable UI components
hooks/               # Custom React hooks
services/            # API client functions (axios-based)
store/               # Zustand state management stores
types/               # Global TypeScript interfaces
test-utils/          # Test setup and helpers
```

**Key Principles**:
- **TanStack Router**: File-based routing for type-safe navigation
- **React Query**: Server state management for API calls; Zustand for client state
- **Composition Pattern**: Build features from smaller components
- **Test Coverage**: Vitest + React Testing Library; aim for 80%+ coverage on features

## Technology Stack

| Layer       | Technology                                  | Notes                                         |
|-------------|---------------------------------------------|-----------------------------------------------|
| Frontend    | React 19, TypeScript 5.8, Vite 6            | Server-side rendering via SSR not in scope    |
| Styling     | TailwindCSS, Material Design 3 color system | Colors in `docs/DESIGN.md`                    |
| State       | TanStack Query, Zustand                     | React Query for server state, Zustand for UI  |
| Routing     | TanStack Router                             | Type-safe file-based routing                  |
| Markdown    | react-markdown with remark plugins          | GFM syntax support (tables, strikethrough)    |
| Backend     | FastAPI 0.115+, Python 3.12                 | Async-first design with asyncio               |
| Database    | PostgreSQL 16, SQLAlchemy 2.0 (async)       | Pydantic v2 for ORM validation                |
| Migrations  | Alembic                                     | Located in `apps/api/alembic/`                |
| Auth        | JWT (python-jose), bcrypt hashing           | Configurable via `SECRET_KEY` env var         |
| Infra       | Docker, Docker Compose                      | Single `docker compose up --build` starts all |

## Environment Variables

### Backend (apps/api/.env)
```
SECRET_KEY=<your-secret-key-here>
DATABASE_URL=postgresql+asyncpg://livrero:livrero@localhost:5433/livrero
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=true
```

### Frontend (apps/web/.env)
```
VITE_API_URL=http://localhost:8000
```

## Common Development Tasks

### Database Migrations
```bash
cd apps/api

# Generate a new migration (auto-detect changes)
alembic revision --autogenerate -m "add_new_column_to_books"

# Review the migration in alembic/versions/
# Edit as needed to ensure correctness

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Adding a New API Endpoint
1. Define DTOs in `app/application/dto/`
2. Define repository interface in `app/domain/repositories/`
3. Implement repository in `app/infrastructure/repositories/`
4. Create a use case in `app/application/use_cases/`
5. Add a route in `app/api/v1/` with dependency injection via `app/api/v1/deps.py`
6. Add tests in `tests/`

### Adding a New Page/Feature (Frontend)
1. Create feature folder in `src/features/` with `pages/`, `hooks/`, `services/`, `types/`
2. Define React Query hooks in `hooks/useFeatureName.ts`
3. Add service functions in `services/featureName.ts`
4. Create feature page component in `pages/`
5. Register route in `app/router.tsx`
6. Write tests for components and hooks in `*.spec.ts` files

### Running Tests in CI
The CI pipeline (`.github/workflows/ci.yml`) runs:
- **Backend**: `ruff check .`, `ruff format --check .`, `pytest --cov=app`
- **Frontend**: `npm run lint`, `npm run typecheck`, `npm run build`

Push to `dev` branch or PR to `main` to trigger CI.

## Code Style & Conventions

### Python (Backend)
- **Line Length**: 88 characters (enforced by ruff)
- **Imports**: Organized with `isort` (first-party from `app.*`)
- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes
- **Type Hints**: Mandatory for function signatures and class attributes
- **Docstrings**: One-liner for simple functions; multi-line for complex logic
- **Async**: Use `async def` and `await` consistently; no blocking I/O in async functions

**Ruff Rules Enforced**:
- E, F, W (pycodestyle + pyflakes errors/warnings)
- I (import sorting)
- N (naming conventions)
- UP (modernizations)
- B (flake8-bugbear)
- A (flake8-builtins)
- C4 (comprehension efficiency)
- T20 (print statements)

**Ignored**:
- E501 (line too long — handled by formatter)
- B008 (mutable default arguments — accepted in some cases)

### TypeScript/React (Frontend)
- **Line Length**: No enforced limit; readable code preferred
- **Components**: Functional components with hooks; avoid class components
- **Naming**: `PascalCase` for components, `camelCase` for functions/variables
- **Props Typing**: Explicit interfaces or type definitions; no `any`
- **Exports**: Named exports preferred for testability
- **File Structure**: Component + test file together in feature folder
- **React Query**: Use hooks for fetching; prefer `useQuery`/`useMutation` over direct fetch
- **Zustand Stores**: Use `create()` with immer middleware for immutable updates

**ESLint Rules**:
- Enforces React Hooks rules-of-hooks
- Enforces react-refresh fast-refresh compatibility
- TypeScript strict mode enabled

## Testing

### Backend (pytest + pytest-asyncio + pytest-cov)
```bash
cd apps/api

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test
pytest tests/test_auth.py::test_login_user -v

# Run with markers (if used)
pytest -m unit

# Watch mode (requires pytest-watch)
ptw
```

**Test Structure**:
- `tests/` mirror `app/` structure
- Use fixtures for database setup (SQLite in-memory for speed)
- Mock external services (e.g., Open Library API)
- Aim for 80%+ coverage on business logic

### Frontend (Vitest + React Testing Library)
```bash
cd apps/web

# Run all tests
npm test

# Run with coverage
npm test:coverage

# Run specific file
npm test -- tests/features/auth/LoginForm.spec.ts

# Watch mode (default in CLI)
npm test

# Update snapshots
npm test -- -u
```

**Test Structure**:
- Tests colocated with components/hooks in feature folders
- Use `render()` from test-utils for provider setup
- Prefer `screen.getByRole()` over `getByTestId()`
- Mock API calls with Mock Service Worker (MSW) if available

## Important Notes

### Database Migrations
- **Always review auto-generated migrations** before applying — they may not capture all schema intent
- Use `sqlalchemy.text()` for complex SQL in migrations
- Test migrations locally before committing

### Environment Secrets
- `.env` files are gitignored; never commit secrets
- CI uses GitHub Secrets for sensitive values
- `SECRET_KEY` must be a strong random string (32+ chars) in production

### Frontend Build
- Vite dev server is fast; use `npm run dev` during development
- TypeScript build step (`tsc -b`) is part of production build; fix type errors before building
- TailwindCSS is compiled at build time; all class names must be static strings (not dynamic)

### Open Library Integration
- Book search uses Open Library API (free, no auth required)
- Cache API responses to avoid rate limiting (consider Redis in future)
- Gracefully handle API timeouts; don't block user workflows

### State Management Strategy
- **Server State** (API data): TanStack Query handles caching, invalidation, background refetch
- **Client State** (UI state): Zustand stores for filters, modals, theme; keep minimal
- **Local State** (form inputs): React hooks + react-hook-form; don't hoist to Zustand unnecessarily

## Git Workflow

- **Main Branch**: Production-ready code; only via PR review
- **Dev Branch**: Integration branch; all feature PRs merge here first
- **Feature Branches**: `feature/short-description` or `fix/short-description`
- **Commit Style**: Conventional Commits preferred (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)

Example PR workflow:
```bash
git checkout -b feature/add-reading-goals dev
# ... make changes
git commit -m "feat: implement reading goals management API and UI"
git push origin feature/add-reading-goals
# Create PR to dev → merge after CI passes + review
```

## Debugging

### Backend
- Enable debug logging: `DEBUG=true` in `.env`
- FastAPI auto-docs: http://localhost:8000/docs
- Check database queries: Use SQLAlchemy echo mode or query logging
- Profile async code: Use `asyncio` profiling tools or `cProfile`

### Frontend
- Browser DevTools: Console, Network, React Profiler
- Redux DevTools for Zustand: Install browser extension for store inspection
- React Query DevTools: Available in development mode
- Vite HMR: Changes auto-reload without full refresh; check console for errors

## CI/CD Pipeline

The `.github/workflows/ci.yml` runs on every `push` to `dev`/`main` and on PR to `main`:

**Backend Job**:
1. Checkout code
2. Set up Python 3.12
3. Install dependencies
4. Run `ruff check .`
5. Run `ruff format --check .`
6. Run `pytest --cov=app --cov-report=term-missing` (requires `SECRET_KEY` env var)

**Frontend Job**:
1. Checkout code
2. Set up Node.js 20
3. Install dependencies (`npm ci`)
4. Run `npm run lint`
5. Run `npm run typecheck`
6. Run `npm run build`

**Passing CI is required to merge PRs.**

## Resources

- **Design System**: See `docs/DESIGN.md` for Material Design 3 color palette and typography
- **Roadmap**: See `docs/Livrero - Product Roadmap.md` for feature planning
- **ADRs**: See `docs/ADRs.md` for architectural decision records
- **Backlog**: See `docs/backlog.md` for prioritized work items
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **SQLAlchemy 2.0**: https://docs.sqlalchemy.org/20/
- **Alembic**: https://alembic.sqlalchemy.org/
- **TanStack Query**: https://tanstack.com/query/
- **Zustand**: https://github.com/pmndrs/zustand
