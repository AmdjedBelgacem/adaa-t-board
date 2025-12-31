## T-Board — Frontend

This repository contains the frontend for T-Board: a lightweight, practical task/kanban board built with Next.js using the App Router. The goal of this frontend is to be a focused, well-structured example of a small production-feel React/Next app: clean component boundaries, pragmatic client/server API usage, and practical features you expect in a task board — columns, cards, dialogs, real-time-feel interactions such as drag-and-drop, and simple auth gating.

## What this frontend provides

- A responsive kanban-style board UI with columns and task cards.
- Drag-and-drop for reordering tasks and moving them across columns (implemented for a smooth, intuitive UX).
- Modals/dialogs for creating, editing, and deleting tasks.
- A small authentication gate component used to protect application UI flows.
- A thin server API surface implemented under `app/api/tasks` (Next.js route handlers) that the frontend consumes.
- A small client-side services layer (`services/`, `clientApi.ts`, `tasks.ts`) that centralizes network calls and shapes data for the UI.
- A lightweight global store for client state in `lib/store.ts` and utility helpers in `lib/`.

## Architecture & design notes 

1. App Router and server routes
	- The project uses Next.js App Router with server route handlers under `app/api/tasks`. These routes provide a simple REST-like API for CRUD operations on tasks. Keeping tiny APIs colocated makes the app self-contained and ideal for demos and prototypes.

2. Component separation
	- UI concerns live under `components/` and the UI primitives under `ui/`. The `components/tasks` folder contains the core domain components: `Board`, `Column`, `TaskCard`, and `TaskDialogs`.
	- `ui/` components are composable primitives (buttons, dialogs, inputs) — they are intentionally generic and reused by higher-level domain components.

3. State and data flow
	- The application keeps transient UI state localized to components or dialogs where possible. Shared client state and optimistic updates are managed via the small store in `lib/store.ts` and through `services/tasks.ts` which encapsulates fetch logic.
	- The services layer acts as a single responsibility boundary for networking. 

4. Drag-and-drop
	- Drag-and-drop is implemented to allow reordering tasks within a column and moving tasks between columns. The UX aims to be immediate and forgiving: local order updates happen first (optimistic UI), and the backend is updated to persist changes.
	- The implementation focuses on accessibility and reasonable keyboard/mouse interactions where feasible, and keeps the move/reorder logic isolated inside `components/tasks` so the behavior is easy to reason about and test.

5. UX and accessibility
	- Dialogs and interactive elements use semantic markup and focus management where possible (via the `ui/` primitives). The goal is to make the app feel polished without sacrificing simplicity.

## Notable files and directories

- `app/` — Next.js app directory, contains top-level layout and pages and `app/api/tasks` route handlers.
- `components/` — Feature components. Key files:
  - `components/tasks/Board.tsx` — orchestrates the board layout and columns.
  - `components/tasks/Column.tsx` — renders a column and its task list; contains drop targets for drag-and-drop.
  - `components/tasks/TaskCard.tsx` — individual task UI, showing title, meta, and actions.
  - `components/tasks/TaskDialogs.tsx` — create/edit dialogs for tasks.
  - `components/AuthGate.tsx` — lightweight auth gate used to restrict UI when not authenticated.
- `ui/` — design-system-like primitives (dialog, input, button, etc.). These are small, composable, and intentionally unopinionated.
- `services/` — client-side network layer and data adapters. Centralizes calls to `app/api/tasks`.
- `lib/` — small utilities and client store: `helper.ts`, `store.ts`, `utils.ts`.
- `types/` — domain TypeScript types (e.g. `types/task.ts`).

## Development

Prerequisites: Node 18+ and a package manager (npm / pnpm / yarn).

1. Install

```bash
npm install
# or: pnpm install
```

2. Run

```bash
npm run dev
# open http://localhost:3000
```

3. Build

```bash
npm run build
npm run start
```

The app is configured to work as a self-contained frontend with the minimal API routes included in this repository.

## Data model & API

- Tasks are represented with a compact shape in `types/task.ts`. The server route handlers under `app/api/tasks` accept and return this shape. The client `services/tasks.ts` maps server responses to UI-friendly objects and centralizes error handling.

## Testing, linting & quality

- This project includes ESLint configuration (`eslint.config.mjs`) and TypeScript.
