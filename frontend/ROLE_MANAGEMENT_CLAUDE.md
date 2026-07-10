Read ROLE_MANAGEMENT_CLAUDE.md carefully — this is the complete
design spec for the Role Management page.

Rewrite src/app/(dashboard)/admin/roles/page.tsx from scratch
following the EXACT spec below.

SCOPE: READ-ONLY. Roles are a fixed TypeScript enum (10 roles),
not a database table — there is no create/edit/delete here. This
page is a browsable reference view of the real permission model.

DATA SOURCE (real, not mock):
  import { ROLE_PERMISSIONS, type RolePermissions } from "@/config/roles.config";
  import type { Role } from "@/types";

  Iterate Object.entries(ROLE_PERMISSIONS) as [Role, RolePermissions][].
  Each entry has: dashboard, reports, regulatory, audit
  (each one of "FULL" | "SYSTEM" | "EXECUTIVE" | "SCOPED" | "NONE"),
  exportFormats (ExportFormat[]), admin (boolean), dynamicReportBuilder (boolean).

  Role label formatting: role.replace(/_/g, " ") title-cased, e.g.
  SYSTEM_ADMIN -> "System Admin", CFO_FINANCE_HEAD -> "Cfo Finance Head".

1. STAT CARDS — exactly 3 cards, same as User Management page:
   - Total Roles (Object.keys(ROLE_PERMISSIONS).length)
   - Admin-Level Roles (count where admin === true)
   - Dynamic Builder Roles (count where dynamicReportBuilder === true)
   - Plain white Bento cards, no icons, no trend badges, no colored circles
   - Large number on top (text-3xl font-bold text-gray-900)
   - Label below (text-sm text-gray-500)
   - Centered text, min-h-[100px]
   - grid grid-cols-3 gap-4

2. FILTER CARD — grid-cols-3 (fewer filters than Users page since
   roles have no branch/status concept):
   - Search (matches formatted role label)
   - Dashboard Access filter — options: FULL / SYSTEM / EXECUTIVE / SCOPED / NONE
   - Admin Access filter — options: Admin / Standard
   All selects use a custom ChevronDown icon overlay (not the browser
   default arrow) — same selectClass/ChevronDown pattern as the Users
   page filter card.
   Below the filter grid: Reset Filters (left, plain text button) —
   no Export button (nothing meaningful to export for a fixed enum).

3. TABLE — exact columns:
   ROLE | DASHBOARD | REPORTS | REGULATORY | AUDIT | EXPORT FORMATS | ADMIN | ACTIONS
   - ROLE: bold label only (no avatar — roles aren't people)
   - DASHBOARD / REPORTS / REGULATORY / AUDIT: each rendered as a
     colored dot + text pill with border, same visual language as
     the Users page STATUS column. Color mapping by access scope:
       FULL      -> green (border-green-200 bg-green-50 text-green-700, dot bg-green-500)
       SYSTEM    -> blue  (border-blue-200 bg-blue-50 text-blue-700, dot bg-blue-500)
       EXECUTIVE -> purple(border-purple-200 bg-purple-50 text-purple-700, dot bg-purple-500)
       SCOPED    -> amber (border-amber-200 bg-amber-50 text-amber-700, dot bg-amber-500)
       NONE      -> gray  (border-gray-200 bg-gray-50 text-gray-500, dot bg-gray-400)
   - EXPORT FORMATS: small gray pills, one per format (uppercase: XLSX, PDF, CSV)
   - ADMIN: "Yes" pill (bg-[#FFE6F4] text-[#ED017F]) or "No" pill
     (bg-gray-100 text-gray-500)
   - ACTIONS: single Eye icon button only (no Pencil, no MoreVertical —
     nothing to edit or delete on a read-only page). Opens a detail
     drawer/modal listing the full permission breakdown for that role,
     plus dynamicReportBuilder shown as a Yes/No pill.

4. TOOLBAR ABOVE TABLE:
   LEFT: "Showing X of Y roles" (no pagination needed — only 10 rows
   total, everything fits on one page; still compute the count from
   the filtered list so it stays correct if roles are ever added)
   RIGHT: none — no Table View / Card View toggle needed at this size.

5. Client-side filtering only — search + both dropdowns filter the
   in-memory ROLE_PERMISSIONS list live, no pagination/page-reset
   logic needed since there is no pagination.

Reuse existing helpers/classes from the Users page implementation
where they already exist in the codebase (inputClass, selectClass,
labelClass, StatCard pattern, SelectField pattern) rather than
redefining them — extract to a shared file only if actually reused
by a third page later.

TypeScript strict. No any types. No mock data — ROLE_PERMISSIONS
is the real source of truth.
Run npm run dev after. Fix all TypeScript errors.
