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

### Backend (Python 3.11+)
```bash
cd apps/api

# Install dependencies using uv (modern Python package manager)
uv sync

# Lint with ruff
uv run ruff check .

# Format with ruff
uv run ruff format .

# Run tests with coverage
uv run pytest --cov=app --cov-report=term-missing

# Run single test
uv run pytest tests/test_file.py::test_function -v

# Start dev server (requires DATABASE_URL env var)
uv run uvicorn app.main:app --reload
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
├── v1/              # API v1 routes (auth, books, sessions, notes, goals, dashboard, health)
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
├── providers.tsx    # React Query, Zustand providers setup
└── router.tsx       # React Router DOM route definitions
pages/               # Top-level page components
features/            # Feature modules (auth, books, sessions, notes, goals, dashboard)
├── auth/            # Authentication feature
├── books/           # Book management
├── sessions/        # Reading sessions
├── notes/           # Markdown notes
├── goals/           # Reading goals
└── dashboard/       # Dashboard statistics and visualizations
components/          # Shared/reusable UI components (layout, buttons, inputs, modals)
hooks/               # Custom React hooks
services/            # API client functions (axios-based)
store/               # Zustand state management stores
types/               # Global TypeScript interfaces
test-utils/          # Test setup and helpers
```

**Key Principles**:
- **React Router DOM**: Client-side routing with createBrowserRouter
- **React Query**: Server state management for API calls; Zustand for client state
- **Composition Pattern**: Build features from smaller components
- **Test Coverage**: Vitest + React Testing Library; aim for 80%+ coverage on features

## Technology Stack

| Layer       | Technology                                  | Notes                                         |
|-------------|---------------------------------------------|-----------------------------------------------|
| Frontend    | React 19, TypeScript 5.8, Vite 6.3+         | Server-side rendering via SSR not in scope    |
| Styling     | TailwindCSS + @tailwindcss/vite, Material Design 3 | Colors in `docs/DESIGN.md`; vite plugin for optimal build |
| State       | React Query, Zustand                        | React Query for server state, Zustand for UI  |
| Routing     | React Router DOM                            | Client-side routing with createBrowserRouter  |
| Markdown    | react-markdown with remark plugins          | GFM syntax support (tables, strikethrough)    |
| Backend     | FastAPI 0.115+, Python 3.11+                | Async-first design with asyncio               |
| Package Mgmt| uv                                          | Modern Python package manager; faster & reliable |
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

## Dependency Management

### Backend (uv)
The project uses **uv** — a modern, fast Python package manager written in Rust. It replaces `pip` with better performance and reliability.

```bash
cd apps/api

# Install all dependencies (including dev)
uv sync

# Add a new package
uv add package-name

# Add a dev-only package
uv add --dev package-name

# Remove a package
uv remove package-name

# Run commands in the venv
uv run python script.py
uv run pytest
uv run uvicorn app.main:app --reload
```

See [uv documentation](https://docs.astral.sh/uv/) for advanced usage.

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
1. Create feature folder in `src/features/` with `components/`, `hooks/`, `services/`, `types/`
2. Define React Query hooks in `hooks/useFeatureName.ts` (use `useQuery`/`useMutation`)
3. Add service functions in `services/featureName.ts` (axios-based API calls)
4. Create feature components in `components/` and page wrapper in `pages/`
5. Register route in `app/router.tsx` (use React Router DOM createElement)
6. Write tests for components and hooks in `*.spec.ts` files using Vitest + React Testing Library

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
- TailwindCSS uses `@tailwindcss/vite` plugin for optimal HMR and build performance
- All class names must be static strings (not dynamic) for TailwindCSS to scan and compile

### Open Library Integration
- Book search uses Open Library API (free, no auth required)
- Cache API responses to avoid rate limiting (consider Redis in future)
- Gracefully handle API timeouts; don't block user workflows

### State Management Strategy
- **Server State** (API data): React Query (TanStack Query) handles caching, invalidation, background refetch
- **Client State** (UI state): Zustand stores for auth, filters, UI toggles; keep minimal and focused
- **Local State** (form inputs): React hooks + react-hook-form; don't hoist to Zustand unnecessarily
- **Routing State**: React Router DOM manages navigation and route parameters via useParams/useNavigate

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
2. Install uv package manager
3. Set up Python 3.12
4. Install dependencies with `uv sync --frozen`
5. Run `uv run ruff check .`
6. Run `uv run ruff format --check .`
7. Run `uv run pytest --cov=app --cov-report=term-missing` (requires `SECRET_KEY` env var)

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
- **React Router**: https://reactrouter.com/
- **Axios**: https://axios-http.com/
- **React Hook Form**: https://react-hook-form.com/
- **SQLAlchemy 2.0**: https://docs.sqlalchemy.org/20/
- **Alembic**: https://alembic.sqlalchemy.org/
- **React Query (TanStack Query)**: https://tanstack.com/query/
- **Zustand**: https://github.com/pmndrs/zustand
- **uv Package Manager**: https://docs.astral.sh/uv/
- **Vite**: https://vitejs.dev/
- **TailwindCSS**: https://tailwindcss.com/

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->