# AGENTS.md

Guidance for AI coding agents working in this repository. Read this before generating or editing code.

## Project

**SpendWise** — a personal finance and budget dashboard. Frontend-only for now (backend to be added later). Built as a portfolio-grade demonstration of fintech-style frontend architecture, not a tutorial project — prioritize correctness and clean structure over speed.

Reference docs: `docs/PRD.md` (product requirements), `docs/design-system.md` (visual tokens), if present. Check for these before assuming requirements.

## Stack

- React (functional components + hooks only, no class components)
- Tailwind CSS for all styling — no inline styles, no CSS modules, no styled-components
- React Hook Form + Zod for every form and its validation
- Context API for global state (see State Management below)
- Recharts for charts
- MSW (Mock Service Worker) as the mock API layer, built against a REST contract
- Vitest + React Testing Library for tests
- Vite as the build tool

## Commands

```bash
npm run dev          # start dev server
npm run build         # production build
npm run test          # run Vitest
npm run test:watch    # watch mode
npm run lint            # eslint
```

Run `npm run test` and `npm run lint` before considering any task complete. Do not mark a task done with failing tests or lint errors.

## Folder Structure

src/
components/
layout/ # Navbar, Sidebar, PageContainer — structural, no business logic
ui/ # MetricCard, TransactionTable, BudgetProgressBar, SpendingChart,
# CategoryBadge, Modal, Toast, Skeleton, EmptyState — presentational,
# receive data via props only, never fetch or read global state
forms/ # AddTransactionForm, BudgetGoalForm — own local input state via
# React Hook Form, call a submit handler passed as a prop
pages/ # DashboardPage, TransactionsPage, BudgetsPage, SettingsPage —
# the ONLY components allowed to read global state directly
context/ # TransactionsContext, BudgetsContext, ThemeContext + reducers
services/ # api.js (or per-resource files) — all fetch/axios calls live here,
# never inline a fetch call inside a component
schemas/ # Zod schemas — one file per resource (transaction.ts, budget.ts)
mocks/ # MSW handlers, matching the REST contract below
utils/ # formatCurrency, date helpers, derived-value calculators


Do not put fetch/axios calls, Zod schemas, or derived-value math directly inside components. They belong in `services/`, `schemas/`, and `utils/` respectively, imported where needed.

## Component Rules

- **Container vs presentational split is mandatory.** Only page-level components (`pages/`) connect to Context. Everything in `components/ui/` and `components/forms/` receives data and callbacks via props only — never reach into Context from inside a `ui/` or `forms/` component.
- Every component takes typed/documented props — no implicit `any`, no undocumented prop shapes.
- No hardcoded copy or values that should come from props or a schema (e.g. don't hardcode a category list inside a component — import it from `schemas/`).

## State Management

Global state shape (see `docs/PRD.md` §9.2 for full rationale):

{
transactions: Transaction[],
budgets: Budget[],
user: { name, currency, theme },
ui: { isLoading, error }
}


**Critical rule: derived values are never stored.** Balance, monthly income/spend, category totals, and budget progress percentages are always computed from `transactions`/`budgets` at render time (via `useMemo`), never written into state as their own fields. If you find yourself adding a `balance` field to state and updating it manually on every transaction change, stop — compute it instead.

## Data Flow Pattern

Every write action (add/edit/delete transaction, create/update budget goal) follows this sequence — replicate it exactly for new write actions:

1. Client-side validation via the resource's Zod schema
2. Optimistic update to Context state (temp id for creates)
3. Call the matching function in `services/api.js`
4. On success: reconcile temp/optimistic entry with the server response
5. On failure: roll back the optimistic change, surface an error via the `Toast` component
6. Derived values recompute automatically (they're `useMemo`, not manually updated)
7. Persist the updated resource array to `localStorage`

Read/filter/sort/search actions (transaction table filtering, sorting) are local component state only — they must never touch Context or trigger an API call.

Theme toggling is local + `localStorage` only — never sent to an API in v1.

## API Contract

MSW handlers in `src/mocks/` must match this contract exactly, since it's designed to be swapped for a real backend without touching component or Context code:

GET /transactions
POST /transactions
PUT /transactions/:id
DELETE /transactions/:id

GET /budgets
POST /budgets
PUT /budgets/:id


Never have a component or Context action call anything outside `services/api.js`. If a new endpoint is needed, add it to both the MSW handler and `services/api.js` in the same change.

## Styling Conventions

- Tailwind utility classes only. If a pattern repeats more than twice, extract it into a component, not a `@apply` class.
- Use the theme's semantic color tokens (`accent`, `success`, `danger`, not raw `blue-500`/`green-500`) — check `tailwind.config.js` for the current token names before introducing new colors.
- All monetary values use `font-variant-numeric: tabular-nums` (Tailwind's `tabular-nums` class) and 2 decimal places.
- Cards: `rounded-xl` with a 1px hairline border, no heavy shadows. Badges/buttons: `rounded-lg`.
- Both light and dark theme variants are required for any new UI — do not ship a component that only looks correct in one theme.

## Validation Conventions

- Every form field's validity rule lives in a Zod schema in `schemas/`, not inline in the component.
- Use `z.enum([...])` for categories — never a free-text string — so a typo can't create an orphan category with no matching budget.
- Amount fields: `z.coerce.number().positive().multipleOf(0.01)`. Sign (income vs. expense) is derived from a separate `type` field, never from the sign of the amount itself.

## Testing

- Every schema in `schemas/` needs a corresponding validation test.
- Every function in `utils/` that computes a derived value (balance, category totals, budget progress) needs a unit test with edge cases (empty array, single item, over-budget).
- Presentational components (`components/ui/`) should be testable with static mock props — if a component can't be rendered in a test without mocking Context, it's in the wrong layer (see Component Rules).

## What Not To Do

- Don't generate a whole page in one shot — build and review one component at a time, matching the container/presentational split above.
- Don't add a UI library other than shadcn/ui (if introduced) without checking `docs/design-system.md` first.
- Don't store derived values in state (see State Management).
- Don't call `fetch`/`axios` outside `services/`.
- Don't skip the optimistic-update + rollback pattern for new write actions — implement the full sequence, not just the happy path.

