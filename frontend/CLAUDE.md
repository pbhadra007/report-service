# IPDC Report Service (IRS) — Frontend Claude Code Context

## What this project is
This is the **frontend portal** for the IPDC Report Service (IRS) — an enterprise financial
reporting platform for **IPDC Finance PLC**, a Non-Banking Financial Institution (NBFI) in
Bangladesh regulated by Bangladesh Bank under the Financial Institutions Act 1993.

This frontend is a secure, role-controlled reporting portal that business users log into
to view, filter, generate, and export financial reports. Data is served by the IRS Spring Boot
backend API (separate project at `../backend`).

---

## Project location
```
D:\IPDC - Office Work\new_development\report_server\
├── frontend/   ← YOU ARE HERE (this project)
└── backend/    ← Spring Boot API (separate project)
```

---

## Technology stack — DO NOT suggest alternatives unless asked

| Layer                | Technology                                      |
|----------------------|-------------------------------------------------|
| Framework            | Next.js 14+ (App Router)                        |
| Language             | TypeScript (strict mode — no `any` types)       |
| Styling              | Tailwind CSS                                    |
| UI components        | Shadcn/ui                                       |
| Charts               | Apache ECharts (via echarts-for-react)          |
| Server state         | TanStack Query v5 (React Query)                 |
| Client state         | Zustand                                         |
| HTTP client          | Axios (centralized instance in lib/apiClient.ts)|
| Auth                 | NextAuth.js v5 (credentials + JWT strategy)     |
| Forms                | React Hook Form + Zod validation                |
| Tables               | TanStack Table v8                               |
| Date handling        | date-fns                                        |
| Export helpers       | file-saver (trigger downloads)                  |
| Testing              | Jest + React Testing Library                    |
| Linting              | ESLint + Prettier                               |

---

## Project structure

```
financial-report-frontend/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── next-env.d.ts
├── .env.local                        # Real secrets — never commit
├── .env.example                      # Template — commit this
├── .gitignore
├── middleware.ts                     # JWT auth guard, RBAC route protection
├── components.json                   # Shadcn/ui config
│
├── public/
│   ├── images/
│   │   └── ipdc-logo.png
│   └── favicon.ico
│
└── src/
    ├── app/                          # Next.js App Router
    │   ├── layout.tsx                # Root layout — providers only
    │   ├── globals.css
    │   ├── (auth)/                   # Public routes — no sidebar
    │   │   └── login/
    │   │       └── page.tsx
    │   └── (dashboard)/             # Protected routes — shared sidebar layout
    │       ├── layout.tsx            # Sidebar + header shell
    │       ├── page.tsx              # Redirects to /dashboard
    │       ├── dashboard/
    │       │   └── page.tsx          # Executive MIS dashboard
    │       ├── reports/
    │       │   ├── page.tsx          # Report catalogue list
    │       │   ├── new/page.tsx      # Dynamic report builder
    │       │   └── [id]/
    │       │       ├── page.tsx      # Report viewer
    │       │       └── generate/page.tsx
    │       ├── regulatory/
    │       │   └── page.tsx          # Bangladesh Bank returns
    │       ├── schedule/
    │       │   └── page.tsx          # Scheduled report management
    │       ├── audit/
    │       │   └── page.tsx          # Audit log viewer
    │       ├── admin/
    │       │   ├── page.tsx          # User management
    │       │   └── roles/page.tsx    # RBAC role assignment
    │       ├── etl/
    │       │   └── page.tsx          # COB pipeline status monitor
    │       └── profile/
    │           └── page.tsx
    │
    ├── components/
    │   ├── ui/                       # Shadcn/ui primitives (auto-generated)
    │   ├── common/
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Footer.tsx
    │   │   └── CobStatusBanner.tsx   # "Data as of [COB date]" — shown on every page
    │   ├── report/
    │   │   ├── ReportFilters.tsx
    │   │   ├── ReportTable.tsx
    │   │   ├── ReportPreview.tsx
    │   │   ├── ExportToolbar.tsx     # Excel/PDF/CSV buttons with permission check
    │   │   └── ReportBreadcrumb.tsx
    │   └── dashboard/
    │       ├── KpiCard.tsx
    │       ├── LoanPortfolioChart.tsx
    │       ├── DepositGrowthChart.tsx
    │       └── BranchContributionChart.tsx
    │
    ├── features/
    │   ├── auth/
    │   │   ├── components/
    │   │   │   └── LoginForm.tsx
    │   │   └── hooks/
    │   │       └── useAuth.ts
    │   ├── reports/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   │   └── useReport.ts
    │   │   ├── api.ts
    │   │   └── types.ts
    │   ├── regulatory/
    │   │   ├── components/
    │   │   ├── api.ts
    │   │   └── types.ts
    │   ├── schedule/
    │   │   ├── components/
    │   │   ├── api.ts
    │   │   └── types.ts
    │   ├── audit/
    │   │   ├── components/
    │   │   ├── api.ts
    │   │   └── types.ts
    │   ├── etl/
    │   │   ├── components/
    │   │   ├── api.ts
    │   │   └── types.ts
    │   └── admin/
    │       ├── components/
    │       ├── api.ts
    │       └── types.ts
    │
    ├── config/
    │   ├── roles.config.ts           # Role → permission map (matches backend RBAC)
    │   ├── routes.config.ts          # Protected route definitions per role
    │   └── reports.config.ts         # Report catalogue metadata
    │
    ├── store/
    │   ├── authStore.ts              # Zustand — user session, role, permissions
    │   ├── cobStore.ts               # Zustand — active COB date, load status
    │   └── uiStore.ts                # Zustand — sidebar collapsed, theme
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useReport.ts
    │   ├── usePermission.ts          # Check if current user can access a report
    │   └── useCobStatus.ts
    │
    ├── lib/
    │   ├── apiClient.ts              # Axios instance with JWT interceptors
    │   ├── auth.ts                   # NextAuth config and helpers
    │   ├── utils.ts                  # Date, number, currency formatters
    │   ├── download.ts               # File download helpers (Excel, PDF, CSV)
    │   └── constants.ts              # App-wide constants
    │
    ├── providers/
    │   ├── AuthProvider.tsx
    │   ├── QueryProvider.tsx         # TanStack Query provider
    │   └── ThemeProvider.tsx
    │
    └── types/
        └── index.ts                  # Global TypeScript types
```

---

## Environment variables

### .env.local (never commit — real values)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_ENV=dev
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### .env.example (commit this — template only)
```
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_ENV=dev
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## Coding rules — always follow these

### TypeScript
- **Strict mode is ON** — never use `any` type, ever
- Always define explicit return types on functions and hooks
- Use `interface` for object shapes, `type` for unions and primitives
- All API response shapes must be typed — no untyped `data` objects
- Use `unknown` instead of `any` when type is genuinely unknown, then narrow it

### Component rules
- All components must be **functional components with TypeScript props interface**
- Props interface named as `{ComponentName}Props`
- Use named exports for all components — no default exports except page.tsx files
- Keep components **small and single-purpose** — if a component exceeds ~150 lines, split it
- Never put API calls directly inside components — use hooks or TanStack Query
- Never use `useEffect` for data fetching — use TanStack Query (`useQuery`, `useMutation`)

### File naming
- Components: `PascalCase.tsx` → `ReportTable.tsx`
- Hooks: `camelCase.ts` prefixed with `use` → `useReport.ts`
- Utilities: `camelCase.ts` → `apiClient.ts`
- Types: `camelCase.ts` → `types.ts`
- Config: `camelCase.config.ts` → `roles.config.ts`
- Store: `camelCase.Store.ts` → `authStore.ts`
- Pages: `page.tsx` (Next.js App Router convention)
- Layouts: `layout.tsx`

### Styling rules
- Use **Tailwind CSS utility classes only** — no inline `style={{}}` props
- No custom CSS files except `globals.css`
- Use Shadcn/ui components as the base — do not rebuild buttons, inputs, modals from scratch
- IPDC brand colors defined in `tailwind.config.ts` as custom tokens
- Responsive design required — all pages must work on desktop, tablet, and mobile
- Dark mode support via `ThemeProvider` — use Tailwind `dark:` variants

### State management rules
- **TanStack Query** → all server state (API data, loading, errors, caching)
- **Zustand** → client-only global state (user session, UI state, COB date)
- **React Hook Form** → all form state
- **useState** → simple local component state only
- Never use `useContext` for global state — use Zustand stores instead

### API and data fetching rules
- All API calls go through `lib/apiClient.ts` — never use `fetch` directly
- The Axios instance automatically injects the JWT token from the session
- The Axios instance handles 401 responses by redirecting to `/login`
- Define all API functions in `features/{feature}/api.ts` — not inside components
- All API functions return typed responses — no `any` return types
- TanStack Query keys follow the pattern: `['reports', reportId, filters]`

### Auth and security rules
- `middleware.ts` protects all `(dashboard)` routes — unauthenticated users redirect to `/login`
- Use `usePermission` hook to conditionally render UI based on user role
- **Never hide buttons with CSS** for security — remove them from the DOM if not permitted
- Export buttons (Excel, PDF, CSV) must check export permission before rendering
- Sensitive pages (audit logs, admin, regulatory) check role in middleware AND in the component
- Never store JWT tokens in localStorage — NextAuth handles this via httpOnly cookies

### Performance rules
- Use `React.memo` on expensive list items (report table rows, chart components)
- All report tables must use **virtualization** (TanStack Virtual) for large datasets
- Use `next/image` for all images — never raw `<img>` tags
- Use `next/dynamic` with `ssr: false` for chart components (ECharts is client-only)
- TanStack Query cache time for report data: `staleTime: 5 * 60 * 1000` (5 minutes)

---

## User roles and UI permissions

These roles come from the JWT token. The frontend reads the role and controls what is visible.

| Role | Dashboard | Reports | Export | Regulatory | Audit | Admin | ETL Monitor |
|---|---|---|---|---|---|---|---|
| SYSTEM_ADMIN | Full | Full | Full | Full | Full | Full | Full |
| IT_OPERATIONS | System | System | System | None | Full | None | Full |
| MD_CEO | Executive | All read | PDF/Excel | Summary | None | None | None |
| CFO_FINANCE_HEAD | Finance | Finance+MIS | Full | Full | None | None | None |
| COMPLIANCE_OFFICER | Compliance | All read | Full | Full | Read | None | None |
| INTERNAL_AUDITOR | Audit | All read | PDF only | Full | Full | None | None |
| CREDIT_HEAD | Credit | Credit+Loan | Full | Credit | None | None | None |
| TREASURY_HEAD | Treasury | Treasury | Full | Treasury | None | None | None |
| BRANCH_MANAGER | Branch | Branch only | PDF/Excel | None | None | None | None |
| RELATIONSHIP_MANAGER | RM | RM portfolio | PDF only | None | None | None | None |

---

## CobStatusBanner — critical UX requirement

Every page inside `(dashboard)` must show the COB status banner. This is a Bangladesh Bank
compliance requirement — users must always know the data freshness.

Banner shows:
- "Data as of: [COB date] — Last loaded: [timestamp]" in green when fresh
- "COB data loading in progress..." in amber during ETL
- "COB data load failed — contact IT" in red on failure

COB status is fetched from: `GET /api/v1/etl/cob-status`
Stored in Zustand `cobStore` and polled every 60 seconds.

---

## Report catalogue pages — key behaviour

### Report list page (`/reports`)
- Shows all reports the current user's role can access (filtered by backend)
- Search, filter by category (Financial, Loan, Deposit, Treasury, Operational, MIS)
- Each report card shows: name, category, last generated, available export formats

### Report viewer page (`/reports/[id]`)
- Load report with default parameters (current COB date, all branches)
- Filter panel on left: date range, branch, product, sector, currency
- Data table in center: paginated, sortable, with TanStack Table
- Export toolbar top-right: Excel / PDF / CSV buttons (shown only if role has export permission)
- "Generate" button triggers `POST /api/v1/reports/{id}/generate` with filter params

### Dynamic report builder (`/reports/new`)
- Field selector: user picks columns from the permitted domain model
- Filter builder: add filter conditions
- Preview button: shows first 100 rows
- Save as: saves custom report definition with a name
- Only shown to roles with dynamic builder permission

---

## Key API endpoints (Spring Boot backend at NEXT_PUBLIC_API_BASE_URL)

```
POST   /auth/login                          # Authenticate, receive JWT
GET    /auth/me                             # Get current user profile + role

GET    /etl/cob-status                      # Latest COB load status and date

GET    /reports                             # Report catalogue (filtered by role)
POST   /reports/{id}/generate              # Generate report with parameters
GET    /reports/{id}/export?format=xlsx    # Download Excel export
GET    /reports/{id}/export?format=pdf     # Download PDF export
GET    /reports/{id}/export?format=csv     # Download CSV export

GET    /dashboard/kpis                      # Executive KPI tiles
GET    /dashboard/charts/loan-trend        # 12-month loan portfolio data
GET    /dashboard/charts/deposit-growth    # Deposit growth chart data
GET    /dashboard/charts/branch-contribution

GET    /regulatory/returns                  # BB regulatory return list
GET    /schedule                            # Scheduled reports list
POST   /schedule                            # Create new schedule
GET    /audit/logs                          # Audit log (paginated)
GET    /admin/users                         # User list (SYSTEM_ADMIN only)
```

---

## What NOT to do

- Do not use `any` type — ever
- Do not call APIs directly in components — use hooks and TanStack Query
- Do not use `fetch()` directly — always use `lib/apiClient.ts`
- Do not use `useEffect` for data fetching
- Do not use `localStorage` or `sessionStorage` for tokens — NextAuth manages this
- Do not use inline `style={{}}` — Tailwind classes only
- Do not use default exports for components (only for page.tsx and layout.tsx)
- Do not render export buttons if the user role has no export permission
- Do not use `React.useContext` for global state — use Zustand stores
- Do not use `<img>` tags — use `next/image` always
- Do not import ECharts at the top level — use `next/dynamic` with `ssr: false`
- Do not skip the CobStatusBanner on any dashboard page
- Do not commit `.env.local` — only `.env.example` goes to git