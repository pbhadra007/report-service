Read CLAUDE.md carefully.

IPDC brand color: #ED017F (pink/magenta)
IPDC Logo: available at /images/ipdc-logo.png (use next/image)

Completely rebuild the UI to match the design references. 
Here is exactly what to build:

═══════════════════════════════════════
1. TAILWIND CONFIG — Add IPDC brand colors
═══════════════════════════════════════
In tailwind.config.ts add custom colors:
  ipdc: {
    pink: '#ED017F',
    'pink-dark': '#C4006A',
    'pink-light': '#FFE6F4',
    'pink-50': '#FFF0F9',
  }

═══════════════════════════════════════
2. LOGIN PAGE — Clean minimal design
═══════════════════════════════════════
Rebuild src/app/(auth)/login/page.tsx:

Layout: Full screen, split or centered card
- Left side (or top): IPDC logo (next/image, /images/ipdc-logo.png)
- Title: "IPDC Report Service"  
- Subtitle: "Sign in to your account"
- Username input (icon: user)
- Password input with show/hide eye toggle (icon: lock)
- "Sign In" button — bg-ipdc-pink hover:bg-ipdc-pink-dark text-white
- Error message: red text below button
- Footer: "© 2026 - Business Transformation, IPDC Finance Limited"
- Background: light gray (#F5F5F5) with white card center
- Card: rounded-2xl shadow-lg p-8 max-w-md

═══════════════════════════════════════
3. USER PORTAL LAYOUT — Image 1 style
═══════════════════════════════════════
Rebuild src/app/(dashboard)/layout.tsx and 
src/components/common/Sidebar.tsx:

LEFT SIDEBAR (fixed width 260px, full height):
Background: white, right border: #E5E7EB

TOP SECTION:
- IPDC logo at top (next/image, h-10, px-4, py-4)
- Divider line

USER PROFILE CARD (below logo):
- Circular avatar with user initials (bg-ipdc-pink text-white)
- User full name (font-semibold)
- Employee ID or designation below name
- Role badge: small pill, bg-ipdc-pink-light text-ipdc-pink

NAVIGATION MENU (below profile):
Label: "REPORT CATEGORIES" (text-xs text-gray-400 uppercase px-4 mb-2)
Menu items with icons:
- 🏠 Dashboard → /dashboard
- 💰 Loan → /reports/loan
- 🏦 Treasury Report → /reports/treasury  
- 💳 Deposit → /reports/deposit
- 📋 Other Reports → /reports/other
- 📊 Finance Report → /reports/finance
- 📜 Balance Certificate → /reports/balance-certificate
- 📈 Summary Report → /reports/summary
- 🗂️ IPDC CRB → /reports/crb

Active state: bg-ipdc-pink text-white rounded-lg
Hover state: bg-ipdc-pink-50 text-ipdc-pink

BOTTOM OF SIDEBAR:
- Divider
- Sign out button (icon + text, text-gray-500 hover:text-red-500)

TOP HEADER BAR (main content area, full width):
- Height: 64px, white background, bottom border
- Left: Page title (dynamic, e.g., "Deposit Reports")
- Right: 
  - COB Status badge (red/green/amber)
  - Notification bell icon
  - User name + designation text
  - Avatar circle (initials, bg-ipdc-pink)

MAIN CONTENT AREA:
- Background: #F8F9FA
- Padding: p-6

═══════════════════════════════════════
4. REPORT CATEGORY PAGE — Modern card grid
═══════════════════════════════════════
Rebuild src/app/(dashboard)/reports/[category]/page.tsx:

Page layout:
- Breadcrumb: Dashboard > Loan Reports
- Page title with category icon
- Search box: "Search reports..." (full width, rounded, with search icon)
- Report count: "Showing 24 reports"

Report cards grid (3 columns desktop, 2 tablet, 1 mobile):
┌─────────────────────────────────┐
│  [📊 icon - ipdc-pink]          │
│  Loan Sheet                     │
│  Report ID: 1001                │
│  ─────────────────────────────  │
│  [Generate Report →]            │
└─────────────────────────────────┘

Card style:
- bg-white rounded-xl shadow-sm border border-gray-100
- hover: shadow-md border-ipdc-pink transition
- Icon: bg-ipdc-pink-50 text-ipdc-pink rounded-lg p-2
- Report name: font-semibold text-gray-800
- Report ID: text-xs text-gray-400
- Button: bg-ipdc-pink hover:bg-ipdc-pink-dark text-white 
  w-full rounded-lg py-2 text-sm font-medium

═══════════════════════════════════════
5. REPORT PARAMETER FORM PAGE — Modern style
═══════════════════════════════════════
Rebuild src/app/(dashboard)/reports/[category]/[reportId]/page.tsx:

Layout:
- Breadcrumb: Dashboard > Loan > Loan Sheet
- Back button: "← Back to Loan Reports"

Main card (bg-white rounded-xl shadow-sm p-6):
- Title: Report name (font-bold text-xl text-gray-800)
- Report ID badge: "ID: 1001" (small pill, bg-gray-100)
- Divider

PARAMETERS SECTION:
- Section label: "Report Parameters" (font-semibold text-gray-600)
- Form fields in 2-column grid:
  Each field:
  - Label (text-sm font-medium text-gray-700)
  - Input (border rounded-lg px-3 py-2 w-full focus:ring-2 
    focus:ring-ipdc-pink focus:border-ipdc-pink)
  - Date fields: use date picker input type="date"

REPORT FORMAT SECTION (separate card below):
- Section label: "Report Format"
- Two option cards side by side:
  ┌──────────────┐  ┌──────────────┐
  │  📄 PDF      │  │  📊 Excel    │
  │  Format      │  │  Format      │
  │  ● Selected  │  │  ○           │
  └──────────────┘  └──────────────┘
  Selected card: border-2 border-ipdc-pink bg-ipdc-pink-50

ACTION BUTTONS:
- [Generate Report] — bg-ipdc-pink text-white px-8 py-3 rounded-lg 
  font-semibold with loading spinner when generating
- [Reset Input] — border border-gray-300 text-gray-600 px-8 py-3 
  rounded-lg ml-3

Footer: "© 2026 - Business Transformation, IPDC Finance Limited"

═══════════════════════════════════════
6. DASHBOARD PAGE — For now, clean welcome
═══════════════════════════════════════
Rebuild src/app/(dashboard)/dashboard/page.tsx:

Show:
- Welcome card: "Welcome back, [Name]!" with IPDC logo
- Stats row (4 cards):
  ├── Total Reports Available: [count from user permissions]
  ├── Last Report Generated: "Never" or date
  ├── Last Login: date/time  
  └── COB Status: Red/Green badge
- Quick Access section: 
  "Your Recent Reports" — shows last 4 accessed reports
  (empty state: "No reports generated yet — browse categories from the sidebar")
- Category overview: 
  Grid showing each category with report count user can access

═══════════════════════════════════════
7. ADMIN REDIRECT LOGIC
═══════════════════════════════════════
In src/lib/auth.ts mock credentials:
- any@email.com + "ipdc1234" → isAdmin: false → redirect to /dashboard
- admin@ipdc.com + "admin1234" → isAdmin: true → redirect to /admin/dashboard

In middleware.ts:
- /admin/* routes → require isAdmin: true → else redirect to /dashboard
- /dashboard/* routes → require authenticated → else redirect to /login

After all changes run: npm run dev
Check for TypeScript errors: npx tsc --noEmit