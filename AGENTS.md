# Project Guidelines & Package Manager Standards

### ?? Package Manager Rules
- **Backend (`backend/`)**: Always use **`pnpm`** (e.g. `pnpm install`, `pnpm run build`, `pnpm run develop`, `pnpm run start`). Never use npm, yarn, or bun directly for backend package management.
- **Frontend (`frontend/`)**: Always use **`bun`** (e.g. `bun install`, `bun run build`, `bun dev`, `bun run lint`).

### ??? Architecture
- **Backend**: Strapi v5 (Headless CMS)
- **Frontend**: Next.js 16 (App Router)
