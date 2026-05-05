# VibeQuiz

AI-powered quiz generator and interactive learning tool. Vanilla TypeScript SPA with Vite + Tailwind CSS v4, plus an MCP server for AI-driven quiz sessions.

## Directory Structure

```
F:\projects\VibeQuiz/
├── index.html              # Single entry point, contains all views (import/quiz/report)
├── src/
│   ├── main.ts             # Core app logic: state, view rendering, event handlers, MCP session support
│   ├── types.ts            # Shared types (QuestionData, QuizResults, etc.)
│   └── style.css           # Tailwind v4 import + custom utility classes
├── server/
│   ├── index.ts            # MCP server (@modelcontextprotocol/sdk) + Express HTTP server
│   ├── session.ts          # Session store with JSON file persistence + TTL cleanup
│   └── api.ts              # Express routes: GET /api/quiz/:id, POST /api/submit/:id
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── .sessions.json          # Persisted sessions (auto-generated)
├── vite.config.ts          # Vite + @tailwindcss/vite plugin + API proxy
├── tsconfig.json           # Frontend TypeScript config
├── tsconfig.server.json    # Server TypeScript config
├── package.json            # pnpm, ESM (type: "module")
├── pnpm-lock.yaml
└── README.md
```

## Architecture

### Dual Mode

**Standalone mode** (original): User pastes JSON manually → quiz → report (copy AI prompt).
**MCP mode** (new): AI model calls MCP tool `create_quiz` → session URL → user takes quiz → model calls `check_results` for analysis.

### Frontend (src/)

- **No JS framework** — vanilla TypeScript, manual view switching via `.hidden` class toggling
- **No router** — `AppState.view` (`"import" | "quiz" | "report"`) drives which container is visible
- **No state management** — global mutable `state` object, imperative `render*View()` calls after mutations
- **MCP session** — URL param `?s=<sessionId>` triggers `loadQuizFromServer()`, quiz completion auto-submits via `submitResultsToServer()`
- **DRY** — `startQuiz(data: QuestionData[])` is the shared entry point for both `importJSON()` and `loadQuizFromServer()`

### Server (server/)

- **MCP Protocol** — `@modelcontextprotocol/sdk` with dual transport:
  - **stdio** (default, local): spawned by MCP client as subprocess
  - **Streamable HTTP** (remote, `MCP_TRANSPORT=sse`): exposes `/mcp` endpoint for remote MCP clients
  - Two tools: `create_quiz` and `check_results`
- **HTTP Server** — Express, serves built frontend (`dist/`) + REST API
  - `GET /api/quiz/:id` — returns quiz questions for a session
  - `POST /api/submit/:id` — receives user answers, stores in session
  - `GET /mcp` + `POST /mcp` — Streamable HTTP transport endpoint (only when `MCP_TRANSPORT=sse`)
- **Session Store** — `Map<string, Session>` persisted to `.sessions.json` (disk), 1-hour TTL, auto-cleanup every 10 minutes

## Data Flow

### MCP Mode
1. Model → MCP `create_quiz(questions)` → `{ sessionId, "http://localhost:3001/?s=xxx" }`
2. Model gives URL to user → user opens in browser
3. Frontend fetches quiz from `GET /api/quiz/:id` → `startQuiz()` → quiz view
4. User completes quiz → frontend POSTs results to `/api/submit/:id`
5. Model → MCP `check_results(sessionId)` → `{ status: "completed", score: 8, total: 10 }`
6. Model analyzes results, provides feedback

### Standalone Mode
1. User opens page directly (no `?s=` param)
2. Pastes JSON → `importJSON()` → `startQuiz()` → quiz view
3. Completes quiz → report view → copies AI prompt for manual AI analysis

### Shared (both modes)
1. `toggleOption()` / `submitCurrentQuestion()` / `goToNextQuestion()` — quiz progression
2. `renderQuizView()` / `renderReportView()` — view rendering
3. Fisher-Yates shuffle for both questions and options
4. `generateBatchAIPrompt()` — generates AI error-analysis prompt for incorrect questions

## Dev Workflow

```bash
# Terminal 1: Frontend (Vite dev server, port 5173)
pnpm dev

# Terminal 2: MCP + Express server (port 3001, proxies via Vite)
pnpm dev:server

# For MCP mode, set BASE_URL so create_quiz returns Vite URL:
$env:BASE_URL="http://localhost:5173"; pnpm dev:server

# Production build + run (stdio transport, default)
pnpm build
pnpm start

# Production with Streamable HTTP transport (for remote/Docker)
$env:MCP_TRANSPORT="sse"; pnpm start
```

## Docker

```dockerfile
FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3001
ENV MCP_TRANSPORT=sse
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
services:
  vibe-quiz:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MCP_TRANSPORT=sse
      - BASE_URL=http://your-domain.com:3001
    restart: unless-stopped
```

## MCP Client Configuration

### Local (stdio)
```json
{
  "mcpServers": {
    "vibe-quiz": {
      "command": "node",
      "args": ["--import", "tsx/esm", "server/index.ts"],
      "cwd": "F:\\projects\\VibeQuiz"
    }
  }
}
```

### Remote (Streamable HTTP)
```json
{
  "mcpServers": {
    "vibe-quiz": {
      "url": "http://your-domain.com:3001/mcp"
    }
  }
}
```

## Conventions

- **Package manager:** pnpm
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` via `@tailwindcss/vite` plugin)
- **Language:** TypeScript strict mode, ES2022, ESM
- **Shuffle:** Fisher-Yates algorithm for both questions and options
- **Dead code:** `src/counter.ts` is a Vite template leftover — not imported anywhere
