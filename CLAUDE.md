# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (first time)
npm run setup           # install deps + generate Prisma client + run migrations

# Development
npm run dev             # Next.js dev server with Turbopack on http://localhost:3000
npm run dev:daemon      # dev server as daemon, logs to logs.txt

# Testing
npm run test            # run all Vitest tests
npm run lint            # ESLint check

# Build
npm run build && npm start

# Database
npm run db:reset        # force reset SQLite database
npx prisma migrate dev  # run new migrations
npx prisma generate     # regenerate Prisma client after schema changes
```

To run a single test file: `npx vitest run src/path/to/__tests__/file.test.ts`

## Environment

- `ANTHROPIC_API_KEY` in `.env` — optional. Without it, a `MockLanguageModel` generates static example components instead of calling Claude.
- Database: SQLite at `prisma/dev.db`
- Node.js requires `node-compat.cjs` loaded via `NODE_OPTIONS='--require ./node-compat.cjs'` (handles browser APIs in Node environment)

## Architecture

UIGen is an AI-powered React component generator. Users describe UI in chat; Claude generates React/JSX files that are previewed live in an iframe.

### Data Flow

1. User submits prompt → `ChatContext` POSTs to `/api/chat` with messages + serialized virtual file system
2. `/api/chat` streams Claude's response; Claude calls tools (`str_replace_editor`, `file_manager`) to create/modify files
3. Tool calls stream back to the client → `ChatContext.handleToolCall()` → `FileSystemContext` updates the virtual FS
4. `PreviewFrame` detects FS changes, transforms JSX via Babel (client-side), renders in sandboxed iframe
5. On stream completion (if authenticated), project is saved to DB via server actions

### Key Modules

**Virtual File System** (`src/lib/file-system.ts`) — In-memory only, never writes to disk. Serialized as JSON and stored in the `Project.data` DB column. `FileSystemContext` wraps it with React state and a `refreshTrigger` counter to notify the preview/editor.

**Chat API** (`src/app/api/chat/route.ts`) — The single backend AI endpoint. Receives the full message history and current FS state, calls Claude with tool definitions and ephemeral prompt caching, streams the response. Saves the project to DB in `onFinish`.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) — Babel standalone transforms JSX → JS in the browser. Creates blob URLs for dynamic `import()`. Handles missing modules with stubs and injects a basic CSS handler.

**AI Tools** (`src/lib/tools/`) — `str_replace_editor` (create/overwrite/patch files) and `file_manager` (rename/delete). Defined as Vercel AI SDK tool schemas; executed client-side by `FileSystemContext`.

**LLM Provider** (`src/lib/provider.ts`) — Exports the Claude model or `MockLanguageModel`. Mock simulates multi-step tool-calling workflow for development without an API key.

**Auth** (`src/lib/auth.ts`, `src/actions/index.ts`) — JWT in httpOnly cookie, bcrypt password hashing. `src/middleware.ts` protects `/api/projects` and `/api/filesystem` routes.

### DB Schema (Prisma + SQLite)

- `User`: id, email, passwordHash, timestamps
- `Project`: id, name, userId (FK), `messages` (JSON — chat history), `data` (JSON — serialized FS), timestamps

### Path Aliases

`@/*` resolves to `src/*` (configured in `tsconfig.json`).

### UI

- shadcn/ui components (new-york style) live in `src/components/ui/`
- Tailwind CSS v4 with CSS variables
- Main layout: resizable panels — chat left, preview/code-editor right (tabs)
- `[projectId]` dynamic route loads a saved project into contexts
