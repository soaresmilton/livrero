# Livrero

> **Your personal reading sanctuary.** — A platform to manage your reading life, build daily habits, and capture knowledge.

---

## Overview

Livrero is a Personal Reading OS built on the concept of "Digital Sanctuary." It helps you:

- 📚 Organize your personal library (Want to Read / Reading / Completed / Abandoned)
- ⏱️ Track reading sessions (time, pages, progress)
- 📝 Write Markdown notes and reflections
- 📊 Visualize reading habits via a GitHub-style heatmap
- 🎯 Set and track annual reading goals

## Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, TailwindCSS, TanStack Query |
| Backend    | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2       |
| Database   | PostgreSQL 16                                           |
| Migrations | Alembic                                                 |
| Infra      | Docker, Docker Compose, GitHub Actions                  |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- Git

### Running locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/livrero.git
cd livrero

# 2. Copy environment variables
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start all services
docker compose up --build

# 4. Access the app
#    Frontend:  http://localhost:5173
#    API Docs:  http://localhost:8000/docs
#    Health:    http://localhost:8000/api/v1/health
```

That's it. A single command to run the entire stack.

## Project Structure

```
livrero/
├── apps/
│   ├── api/              # FastAPI backend (Python)
│   │   ├── app/
│   │   │   ├── api/      # HTTP routers
│   │   │   ├── domain/   # Entities, repositories (interfaces)
│   │   │   ├── application/  # Use cases, DTOs
│   │   │   ├── infrastructure/  # SQLAlchemy, configs
│   │   │   └── shared/   # Shared utilities, exceptions
│   │   ├── tests/
│   │   └── alembic/      # Database migrations
│   └── web/              # React frontend (TypeScript)
│       └── src/
│           ├── app/      # Providers, router
│           ├── pages/    # Page components
│           ├── features/ # Feature modules (auth, books, etc.)
│           ├── components/ # Shared UI components
│           ├── hooks/
│           ├── services/ # API clients
│           ├── store/    # Zustand stores
│           └── types/    # Global TypeScript types
├── docs/                 # Product docs, design system, roadmap
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml
```

## Roadmap

| Milestone | Status         | Description                   |
| --------- | -------------- | ----------------------------- |
| M0        | ✅ In Progress  | Foundation & infrastructure   |
| M1        | 🔜 Planned     | Authentication (JWT)          |
| M2        | 🔜 Planned     | Library management            |
| M3        | 🔜 Planned     | Reading sessions & timer      |
| M4        | 🔜 Planned     | Markdown notes                |
| M5        | 🔜 Planned     | Dashboard & heatmap           |
| M6        | 🔜 Planned     | Annual reading goals          |
| M7        | 🔜 Planned     | Hardening & production-ready  |

## Development

### Backend

```bash
cd apps/api
pip install -e ".[dev]"

# Lint
ruff check .

# Format
ruff format .

# Tests
pytest
```

### Frontend

```bash
cd apps/web
npm install
npm run dev     # Dev server at http://localhost:5173
npm run lint    # ESLint
npm run build   # Production build
```

## License

Private — all rights reserved.
