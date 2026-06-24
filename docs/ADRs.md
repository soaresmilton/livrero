# ADR-001: Monorepo Structure

**Status:** Accepted  
**Date:** 2026-06-24  
**Deciders:** Product Owner, Engineering

## Context

The Livrero project needs a repository structure that supports a separate frontend (React/TypeScript/Vite) and backend (Python/FastAPI), with shared infrastructure (Docker Compose, CI/CD), while keeping the codebase in a single repository for simpler development workflow at this stage.

## Decision

Use a **monorepo** with the following structure:

```
livrero/
├── apps/
│   ├── api/   ← FastAPI backend
│   └── web/   ← React frontend
├── docs/      ← Product documentation
└── .github/   ← CI/CD workflows
```

Each app maintains its own build system, dependencies, and Dockerfile. They are coordinated through `docker-compose.yml` at the root.

## Consequences

- **Positive:** Single clone to run the whole stack. Shared CI pipeline. Easy cross-app refactoring.
- **Negative:** Slightly more complex CI configuration per app. Must be careful not to couple the two apps at the code level.
- **Future:** If the project grows significantly, each app can be extracted to its own repository without major changes.

---

# ADR-002: Authentication Strategy (JWT + Refresh Token Table)

**Status:** Accepted  
**Date:** 2026-06-24  
**Deciders:** Product Owner, Engineering

## Context

The application needs user authentication. Several approaches exist: session-based, JWT stateless, JWT with server-side refresh token store.

## Decision

Use **JWT with a server-side `refresh_tokens` table** in PostgreSQL:

- `access_token`: short-lived (30 min), JWT signed with HS256, stateless
- `refresh_token`: long-lived (30 days), stored as a hashed value in `refresh_tokens` table

## Rationale

- Allows true logout (refresh token can be revoked from the database)
- Supports future multi-device session management (mobile app)
- Enables "sign out all devices" feature
- Minimal overhead — one DB lookup per refresh cycle, not per request

## Consequences

- **Positive:** Secure logout, device management, future-proof for mobile.
- **Negative:** Slightly more complex than pure stateless JWT. Requires one DB write per login and one DB delete per logout.

---

# ADR-003: Book Cover Strategy

**Status:** Accepted  
**Date:** 2026-06-24  
**Deciders:** Product Owner, Engineering

## Context

Book covers are an important visual element of the library UX. Options include user-uploaded files, external URLs, or API integration.

## Decision

**V0:** Accept external image URLs only (`cover_url` field as a simple string).  
**Future (V1+):** Add file upload support with object storage (S3/Cloudflare R2).

The domain model uses `cover_url: str | None` — this field can be populated from:
1. A URL pasted by the user
2. A URL returned by the Open Library API (implemented in M2)
3. A signed URL to object storage (future)

The abstraction does not need to change between these sources.

## Consequences

- **Positive:** Zero infrastructure complexity in V0. The `cover_url` field works for all future sources.
- **Negative:** No offline cover storage in V0. External URLs can break.

---

# ADR-004: Open Library Integration for Book Search

**Status:** Accepted  
**Date:** 2026-06-24  
**Deciders:** Product Owner, Engineering

## Context

Manually entering book metadata (title, author, cover, ISBN) creates friction. The Open Library API is free and requires no API key.

## Decision

In **Milestone 2**, integrate with the [Open Library Search API](https://openlibrary.org/developers/api) to autocomplete book metadata when adding a new book.

The integration will be implemented in `app/infrastructure/integrations/open_library/` as an adapter behind a `BookSearchPort` interface in the domain, keeping the domain clean and allowing future replacement with Google Books or another provider.

## Consequences

- **Positive:** Significantly better UX for adding books. Free, no API key required.
- **Negative:** External dependency. Must handle failures gracefully (network errors, missing data).
