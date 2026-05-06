# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server (Turbopack, http://localhost:3000)
npm run build    # production build + type-check
npm run lint     # ESLint
npx tsc --noEmit # type-check without emitting
```

No test runner is configured yet.

To add a shadcn/ui component:
```bash
npx shadcn@latest add <component-name>
```

## Architecture

All state lives client-side. There is no backend yet — `src/lib/store.ts` reads/writes `localStorage` directly. The planned backend (Supabase + Google OAuth) is documented in `docs/` but not yet wired up.

**Data flow:**
`src/app/page.tsx` (sole stateful component) → props down to presentational components → callbacks up → `saveTasks`/`saveMembers` in `src/lib/store.ts` → localStorage.

**Key files:**
- `src/types/index.ts` — single source of truth for `Task`, `TeamMember`, `Status`, `Priority`, and the `STATUSES`/`PRIORITIES` lookup arrays (labels + Tailwind color strings) used throughout the UI.
- `src/lib/store.ts` — localStorage CRUD. `loadTasks()` seeds sample data on first visit; `createTask()` generates IDs client-side.
- `src/app/page.tsx` — owns all state: `tasks`, `members`, filter state, dialog open/close. All mutations flow through here.
- `src/components/KanbanBoard.tsx` — stateless; renders one column per entry in `STATUSES`.
- `src/components/TaskCard.tsx` — display only; fires `onEdit`/`onDelete`/`onStatusChange` callbacks.
- `src/components/TaskDialog.tsx` — create/edit modal controlled by `page.tsx`.
- `src/components/FilterBar.tsx` — exports the `Filters` type consumed by `page.tsx`.

## shadcn/ui specifics

Style preset is `base-nova` (uses `@base-ui/react` primitives). **`asChild` prop does not exist** on these components — use the `render` prop or a plain wrapper element instead.

Tailwind v4 is in use: there is no `tailwind.config.ts`. Theme tokens are declared in `src/app/globals.css` via `@theme`.

## Docs (product decisions)

| File | Contents |
|------|----------|
| `docs/personas.md` | 3 user personas + MVP feature scope (5 features) |
| `docs/user-stories.md` | Day-in-the-life scenario for persona 이개발 |
| `docs/requirements.md` | F-01…F-05 functional + non-functional requirements |
| `docs/architecture.md` | Target stack: Next.js · Supabase · Google OAuth · Vercel |
| `docs/db.md` | Planned `tasks` table DDL (Supabase/Postgres) |
| `docs/api.md` | Planned 7 API endpoints |
