# 📚 Livrero — Personal Reading OS

**Your personal reading sanctuary.** A full-stack application to organize your library, track reading sessions, write markdown notes, visualize reading habits, and achieve annual reading goals.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📖 **Library Management** | Organize books by status (Want to Read / Reading / Completed / Abandoned) |
| 📊 **Reading Sessions** | Log sessions with duration, pages read, and progress tracking |
| 📝 **Markdown Notes** | Write rich notes with GFM syntax (tables, strikethrough, code blocks) |
| 📈 **Reading Analytics** | Visualize habits with GitHub-style heatmaps and progress charts |
| 🎯 **Annual Goals** | Set and track yearly reading goals with progress monitoring |
| 🎨 **Beautiful Dashboard** | Overview of reading activity, stats, and key metrics |
| 🔐 **Secure Auth** | JWT-based authentication with bcrypt password hashing |

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Node.js 20+** (for local frontend dev)
- **Python 3.12+** (for local backend dev)

### Docker (Recommended)

```bash
docker compose up --build
```

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React dev server |
| API | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI documentation |
| Health | http://localhost:8000/api/v1/health | Service health check |

### Local Backend Development

```bash
cd apps/api

# Install dependencies
pip install -e ".[dev]"

# Environment
export DATABASE_URL=postgresql+asyncpg://livrero:livrero@localhost:5433/livrero
export SECRET_KEY=your-secret-key-here

# Quality checks
ruff check .      # Lint
ruff format .     # Format

# Testing
pytest --cov=app --cov-report=term-missing

# Run server
uvicorn app.main:app --reload
```

### Local Frontend Development

```bash
cd apps/web

# Install dependencies
npm install

# Development
npm run dev        # Start dev server
npm run lint       # ESLint check
npm run typecheck  # TypeScript check

# Testing
npm test                  # Run tests
npm test:coverage         # Coverage report

# Production
npm run build
```

## 🏗️ Architecture

### Backend: Clean Architecture

```
apps/api/app/
├── domain/              # Business entities & repository interfaces
├── application/         # Use cases, DTOs, services
├── infrastructure/      # Database, ORM, external services
├── api/                 # FastAPI routes & endpoints
└── shared/              # Utilities, exceptions, constants
```

**Principles**: Dependency inversion, domain-driven design, async-first with SQLAlchemy 2.0

### Frontend: Feature-Based

```
apps/web/src/
├── app/                 # Providers, routing
├── pages/               # Page components
├── features/            # Feature modules (auth, books, sessions, etc.)
├── components/          # Shared UI components
├── hooks/               # Custom React hooks
├── services/            # API client functions
├── store/               # Zustand state stores
└── types/               # TypeScript interfaces
```

**Principles**: TanStack Router (type-safe routing), React Query (server state), Zustand (client state)

## 📦 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + TypeScript 5.8 + Vite 6 | Modern UI development |
| Styling | TailwindCSS + Material Design 3 | Utility-first + design system |
| State | React Query + Zustand | Server + client state management |
| Routing | TanStack Router | Type-safe navigation |
| Backend | FastAPI 0.115+ + Python 3.12 | Async web framework |
| Database | PostgreSQL 16 + SQLAlchemy 2.0 (async) | Relational DB + ORM |
| Migrations | Alembic | Schema versioning |
| Auth | JWT + bcrypt | Secure authentication |
| Testing | pytest + Vitest + RTL | Backend + frontend tests |
| Infra | Docker Compose | Local development |

## 📖 Development Tasks

### Database Migrations

```bash
cd apps/api

# Generate migration from model changes
alembic revision --autogenerate -m "add_new_column"

# Review in alembic/versions/ and edit if needed

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Add API Endpoint

1. Define DTOs in `app/application/dto/`
2. Define repo interface in `app/domain/repositories/`
3. Implement repo in `app/infrastructure/repositories/`
4. Create use case in `app/application/use_cases/`
5. Add route in `app/api/v1/` with dependency injection
6. Write tests in `tests/`

### Add Frontend Feature

1. Create folder in `src/features/my-feature/`
2. Add hooks, services, types
3. Create page component
4. Register in `app/router.tsx`
5. Write tests

## 🧪 Testing

### Backend

```bash
cd apps/api

# All tests
pytest

# With coverage
pytest --cov=app --cov-report=term-missing

# Specific test
pytest tests/test_auth.py::test_login_user -v
```

### Frontend

```bash
cd apps/web

# All tests
npm test

# With coverage
npm test:coverage

# Specific file
npm test -- tests/features/auth/
```

**Target**: 80%+ coverage on business logic

## 🎨 Code Style

### Python

- **Line Length**: 88 chars (ruff)
- **Naming**: `snake_case` functions, `PascalCase` classes
- **Type Hints**: Mandatory on signatures
- **Tools**: ruff (lint/format), pytest

### TypeScript/React

- **Components**: Functional with hooks, `PascalCase`
- **Functions**: `camelCase`
- **Props**: Explicit interfaces, no `any`
- **Tools**: ESLint, TypeScript strict, Vitest

## 🔐 Environment Variables

### Backend (apps/api/.env)

```env
SECRET_KEY=your-secret-key-min-32-chars
DATABASE_URL=postgresql+asyncpg://livrero:livrero@localhost:5433/livrero
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=true
```

### Frontend (apps/web/.env)

```env
VITE_API_URL=http://localhost:8000
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Detailed architecture & development guide
- **[Design System](./docs/DESIGN.md)** — Material Design 3 colors & typography
- **[Roadmap](./docs/Livrero%20-%20Product%20Roadmap.md)** — Feature planning
- **[ADRs](./docs/ADRs.md)** — Architectural decisions
- **[Backlog](./docs/backlog.md)** — Prioritized work items
- **[Frontend Guidelines](./docs/FRONTEND_GUIDELINES.md)** — Frontend standards

## 🔄 CI/CD

Automated checks on every push:

- **Backend**: ruff lint/format, pytest with coverage
- **Frontend**: ESLint, TypeScript check, production build

**All checks must pass** before merging.

## 🎯 Git Workflow

- **`main`** — Production code (PR + CI required)
- **`dev`** — Integration branch (PR from features)
- **Feature branches** — `feature/name` or `fix/name`

**Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

## 🛠️ Debugging

### Backend
- **API Docs**: http://localhost:8000/docs
- **Debug Mode**: Set `DEBUG=true`
- **Database Queries**: Enable SQLAlchemy echo mode

### Frontend
- **Browser DevTools**: Console, Network, React Profiler
- **React Query DevTools**: Auto-enabled in dev
- **Vite HMR**: Auto-reload on file changes

## 📋 Project Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ | JWT + bcrypt |
| Books | ✅ | Open Library API |
| Reading Sessions | ✅ | Tracking & analytics |
| Notes | ✅ | GFM support |
| Dashboard | ✅ | Analytics overview |
| Goals | ✅ | Goal tracking |
| Docker | ✅ | Full setup |
| CI/CD | ✅ | GitHub Actions |

## 📞 Support

- **Issues**: GitHub issues for bugs/features
- **Questions**: See [CLAUDE.md](./CLAUDE.md)
- **Email**: eng.milton.soares@gmail.com

## 📝 License

MIT License — see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) — Backend framework
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — Frontend
- [PostgreSQL](https://www.postgresql.org/) — Database
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM
- [TanStack Query](https://tanstack.com/query/) + [Zustand](https://github.com/pmndrs/zustand) — State management
- [Docker](https://www.docker.com/) — Containerization

---

**Happy reading! 📖✨**
