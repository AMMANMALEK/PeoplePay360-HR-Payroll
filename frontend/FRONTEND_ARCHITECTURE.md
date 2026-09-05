# FRONTEND_ARCHITECTURE.md — PeoplePay360 (HR Manager Experience)

> **Enterprise HR Operations Platform**  
> *Persona: HR Manager*  
> *Stack: React + Tailwind CSS + React Router + Decoupled Service Architecture*

---

## 1. Project Overview

### What is PeoplePay360?
**PeoplePay360** is an integrated human resources and payroll operations platform designed to eliminate friction between personnel management and finance. In growing organizations, disjointed tools lead to manual payroll calculation errors, missing attendance logs, and poor contract visibility. PeoplePay360 bridges this gap by unifying these workflows while maintaining strict, role-tailored boundaries.

### What the HR Manager Frontend Does
The **HR Manager** workspace is an operational command center. It empowers the HR department to handle:
- Complete workforce directory and employee profiles
- Daily attendance shifts, exception monitoring, and manual compliance corrections
- Legal employment contracts, active term verification, and renewal pipelines
- Working schedule configuration with automated hour calculations
- Leave requests, balance deductions, and multi-tier approval workflows
- Operational decision support reports

### Why the Employee is the Central Operational Hub
Rather than organizing the platform around disconnected database tables, PeoplePay360 treats **the Employee as the central operational anchor**:
```
                        ┌────────────────────────┐
                        │   EMPLOYEE RECORD      │
                        │ (Operational Hub)      │
                        └──────────┬─────────────┘
          ┌────────────────┬───────┴────────┬───────────────┐
          │                │                │               │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐ ┌──────▼──────┐
   │  Contracts  │  │ Attendance  │  │  Time Off   │ │ Allocations │
   │  (Active &  │  │   Logs &    │  │  Requests   │ │  Balances   │
   │ Historical) │  │ Corrections │  │  Workflow   │ │  & Quotas   │
   └─────────────┘  └─────────────┘  └─────────────┘ └─────────────┘
```
From any employee's profile, the HR Manager can inspect and execute actions across all related records in one click via **Smart Navigation Counter Cards**.

---

## 2. React Architecture

- **React 18**: Used to divide the application into reusable, maintainable UI components.
- **Declarative State**: Changes to local UI state (such as approving leave, auditing an attendance record, or toggling between List and Kanban views) trigger immediate, seamless re-renders without full-page reloads.
- **Component Separation**: Visual components (`src/components/ui/`) are strictly isolated from domain-specific forms and operational pages (`src/pages/`).

---

## 3. Tailwind CSS Usage

- **Consistent Enterprise Design System**: Built with Tailwind CSS utility classes using a tailored enterprise palette:
  - **Primary**: Indigo (`bg-indigo-600`, `text-indigo-600`) for primary actions, active navigation, and focal links.
  - **Success / Active**: Emerald (`bg-emerald-50`, `text-emerald-700`, `border-emerald-200`) for active employment contracts, present attendance, and approved leaves.
  - **Pending / Warning**: Amber (`bg-amber-50`, `text-amber-800`, `border-amber-300`) for pending time off, late arrivals, and contracts expiring soon.
  - **Error / Exception**: Rose (`bg-rose-50`, `text-rose-700`, `border-rose-300`) for unexcused absences, missing checkouts, contract conflicts, and refused requests.
  - **Informational**: Sky/Blue for shift rotations and non-critical badges.
  - **Historical / Inactive**: Slate/Gray for expired contracts and inactive employees.
- **Subtle Polish**: Restrained shadows (`shadow-subtle`, `shadow-dropdown`), 1px borders (`border-slate-200`), moderate corner radii (`rounded-xl`, `rounded-2xl`), and clean system typography (`font-sans`).

---

## 4. React Router Usage

- **Client-Side Routing**: Configured using React Router DOM v6 with a persistent layout shell:
  - `/`: HR Manager Dashboard (Needs Your Attention & Workforce Snapshot)
  - `/employees`: Employee Directory (List & Kanban views)
  - `/employees/:id`: Employee Detail Command Center
  - `/attendance`: Daily Attendance, Exception Tracking & Correction
  - `/contracts`: Employment Contracts Lifecycle & Conflict Warnings
  - `/schedules`: Shift Schedules & Weekly Hours Calculator
  - `/time-off`: Leave Requests, Allocations & Time Off Types
  - `/reports`: Operational Analytics & Decision Support
- **Deep Linking**: Search query parameters (e.g. `/attendance?filter=exceptions`, `/time-off?status=Pending`, `/contracts?filter=expiring`) preserve user context and allow direct one-click resolution from alerts.

---

## 5. Folder Structure

```
people pay_frontend/
├── index.html                   # HTML entry with Inter font
├── package.json                 # Core dependencies and build scripts
├── vite.config.js               # Vite config
├── tailwind.config.js           # Brand colors, shadows, typography tokens
├── FRONTEND_ARCHITECTURE.md      # Comprehensive architecture documentation
└── src/
    ├── main.jsx                 # Application DOM mount
    ├── App.jsx                  # Client routing and provider hierarchy
    ├── index.css                # Tailwind directives and custom scrollbar
    ├── constants/
    │   ├── api.js               # Centralized empty API_BASE_URL and endpoint placeholders
    │   └── navigation.js        # Role definitions and sidebar routes
    ├── data/
    │   └── mockData.js          # Realistic enterprise HR dataset
    ├── services/
    │   ├── apiService.js        # Decoupled fetch wrapper
    │   ├── employeeService.js   # Employee CRUD service interface
    │   ├── attendanceService.js # Attendance & correction service interface
    │   ├── contractService.js   # Contract lifecycle service interface
    │   ├── scheduleService.js   # Schedule configuration service interface
    │   ├── timeOffService.js    # Time off & allocations service interface
    │   └── dashboardService.js  # Dashboard KPIs and alerts service interface
    ├── context/
    │   └── HRDataContext.jsx    # Stateful reactive in-memory store for live demo workflows
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.jsx     # Responsive shell layout
    │   │   ├── Sidebar.jsx      # Navigation, role indicator (NO Payroll)
    │   │   ├── TopBar.jsx       # Breadcrumbs, global search, actionable notifications
    │   │   └── GlobalSearchModal.jsx # Command-style search across modules
    │   ├── ui/
    │   │   ├── StatCard.jsx     # Actionable KPI metric cards
    │   │   ├── AttentionCard.jsx# Urgency-ranked actionable alert cards
    │   │   ├── DataTable.jsx    # Reusable enterprise table (sorting, pagination, empty/loading states)
    │   │   ├── StatusBadge.jsx  # Accessible semantic status pills
    │   │   ├── EmployeeAvatar.jsx # Photo/initials avatar
    │   │   ├── FilterBar.jsx    # Search, category filters, removable chips
    │   │   ├── Modal.jsx        # Accessible dialog wrapper
    │   │   ├── ConfirmDialog.jsx# Confirmation modal for destructive actions
    │   │   ├── EmptyState.jsx   # Friendly empty state with CTA
    │   │   ├── SkeletonLoader.jsx # Skeleton rows and cards
    │   │   └── Toast.jsx        # Non-intrusive floating feedback
    │   ├── employees/
    │   │   ├── EmployeeListView.jsx   # Streamlined table list view
    │   │   ├── EmployeeKanbanView.jsx # Department/Status grouped board
    │   │   ├── EmployeeFormModal.jsx  # Multi-section structured add/edit form
    │   │   └── SmartNavCard.jsx       # Contextual navigation cards
    │   ├── contracts/
    │   │   ├── ContractFormModal.jsx  # Contract creation with conflict blocker
    │   │   └── ContractConflictAlert.jsx # Overlap warning alert banner
    │   ├── schedules/
    │   │   └── ScheduleEditorModal.jsx# Mon-Sun editor with automatic weekly hours
    │   ├── attendance/
    │   │   └── AttendanceCorrectionModal.jsx # Focused correction drawer/modal with audit trail
    │   └── timeoff/
    │       ├── TimeOffReviewModal.jsx # Review drawer/modal with balance deduction
    │       ├── AllocationCard.jsx     # Visual consumption progress bar
    │       └── TimeOffTypeModal.jsx   # Time off type configuration
    └── pages/
        ├── Dashboard/DashboardPage.jsx    # HR Manager overview & Needs Your Attention
        ├── Employees/
        │   ├── EmployeesPage.jsx          # Employees directory
        │   └── EmployeeDetailPage.jsx     # Central hub with smart cards & tabbed sections
        ├── Contracts/ContractsPage.jsx    # Active vs Historical contracts & conflict alerts
        ├── Schedules/SchedulesPage.jsx    # Shift schedules & weekly hours calculator
        ├── Attendance/AttendancePage.jsx  # Attendance summary, exceptions & audit corrections
        ├── TimeOff/TimeOffPage.jsx        # Requests, Allocations & Types
        └── Reports/ReportsPage.jsx        # Operational decision support
```

---

## 6. Component Architecture

| Component Name | Purpose | Where Used | Reusability Rationale | Key Props |
|---|---|---|---|---|
| `StatCard` | Clickable KPI metric card with trend and action cue. | Dashboard, Reports | Standardizes KPI visualization across the app with consistent hover states and colors. | `title`, `value`, `secondaryValue`, `subtext`, `icon`, `colorScheme`, `onClick` |
| `AttentionCard` | High-priority actionable alert item. | Dashboard Attention Center | Handles variable urgency levels (`urgent`, `warning`, `info`) with direct route navigation. | `item` (title, description, count, actionLabel, targetRoute) |
| `DataTable` | Reusable sortable, paginated enterprise data table. | Employees, Contracts, Attendance, Time Off | Eliminates table boilerplate; standardizes pagination, sort icons, and row clicks. | `columns`, `data`, `isLoading`, `onRowClick`, `pageSize`, `emptyTitle` |
| `StatusBadge` | Semantic status indicator for employees, contracts, attendance, and leave. | Across all tables and cards | Prevents inconsistent color usage; pairs color with text and dots for accessibility. | `status`, `size` |
| `FilterBar` | Search input, filter dropdowns, and active removable filter chips. | Employees, Contracts, Attendance, Time Off | Keeps filtering interaction uniform across all modules with instant chip removal. | `searchQuery`, `onSearchChange`, `filters`, `activeFilters`, `onFilterChange`, `onClearAll` |
| `SmartNavCard` | Compact contextual navigation button with counts and active view highlights. | Employee Detail Page | Encapsulates the "Employee as Central Hub" design pattern with live badges. | `type`, `label`, `primaryValue`, `secondaryValue`, `isActive`, `onClick` |
| `Modal` | Accessible modal dialog with backdrop blur, keyboard escape, and transitions. | Across all forms | Provides standard dialog behavior and focus management. | `isOpen`, `onClose`, `title`, `description`, `children`, `maxWidth` |
| `ConfirmDialog` | Confirmation modal for destructive or high-impact actions. | Employee delete, contract actions | Prevents accidental data loss with clear cancellation and execution buttons. | `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `isDestructive` |
| `EmptyState` | Informative state when search/filter returns zero records. | Tables, Lists | Replaces blank screens with clear explanations and call-to-action buttons. | `icon`, `title`, `description`, `action` |
| `Toast` | Non-intrusive floating feedback notification. | Global AppShell | Provides visual acknowledgment of background operations (approvals, edits). | `toast`, `onClose` |

---

## 7. Service & API Architecture

To keep the frontend independent of backend development timelines:
1. **Empty Base URL**: `API_BASE_URL = ""` in `src/constants/api.js`.
2. **Endpoint Placeholders**: Constants like `EMPLOYEES_ENDPOINT = ""` and `ATTENDANCE_ENDPOINT = ""` are left blank.
3. **Decoupled Service Interface**: Services (`employeeService`, `attendanceService`, etc.) define methods matching future REST endpoints (`getEmployees()`, `createEmployee(data)`).
4. **Mock Store Fallback**: When endpoints are empty, the services query the reactive mock dataset, allowing live interactive demonstrations.

---

## 8. Mock Data Architecture

The mock store in `src/data/mockData.js` is structured as relational entities:
- **Employees**: 8+ realistic employees across 5 departments with managers, avatars, schedules, and profile completion states.
- **Contracts**: Historical and active contracts with dates, agreed wages, salary bands, and conflict edge cases.
- **Attendance**: Shift logs containing real-world exceptions: late arrivals, missing checkouts, unexcused absences, and audited corrections.
- **Time Off**: Pending, approved, and refused requests with durations and stated reasons.
- **Allocations**: Quotas for Annual Leave, Sick Leave, and Sabbaticals tracking Allocated, Taken, and Remaining days.

---

## 9. State Management

- **Local UI State**: Handled with `useState` and `useMemo` for search inputs, active filter dropdowns, modal visibility, and table sorting.
- **Domain State**: Managed cleanly in `src/context/HRDataContext.jsx`. This context acts as a client-side reactive store that provides mutations (`approveTimeOff`, `correctAttendance`, `addEmployee`).
- **Zero Redux/MobX Bloat**: By relying on standard React Context, the codebase remains lightweight, easy to understand, and fast to execute.

---

## 10. Form Validation & UX

- **Labels above inputs**: Never using placeholders as the only label.
- **Required Indicators**: Red asterisks (`*`) clearly signify mandatory fields.
- **Contextual Inline Errors**: Clear messages below the input (e.g., "Work email is required", "End date cannot be prior to start date").
- **Mandatory Justifications**: Refusing time off or correcting attendance strictly requires entering an explanation for HR compliance.
- **Automatic Calculations**: In the schedule form, daily start/end/break times automatically calculate total weekly hours without requiring manual entry.

---

## 11. Employee-Centric Data Relationships

The cornerstone of PeoplePay360 is that **no HR entity exists in a silo**:
- From Sarah Jenkins' profile, clicking the "Contracts (2 records · 1 active)" card switches to the Employment tab to review her active term and previous history.
- Clicking the "Attendance (28 records · 2 exceptions)" card filters her attendance logs without navigating away to an unfiltered global list.

---

## 12. Role-Based Access Control (RBAC)

PeoplePay360 strictly enforces role boundaries in the user interface:
- **HR Manager Role**: Full operational command of Employees, Attendance, Contracts, Working Schedules, and Time Off.
- **Payroll Segregation**: Payruns, payslips, salary structures, salary rules, and payroll processing are strictly omitted from the HR Manager sidebar and navigation.

---

## 13. Responsive Design & Smooth Interactions

- **Desktop (1024px+)**: Persistent left sidebar with smooth width easing (`w-64` to `w-20`) and synchronized label/badge fade transitions (`transition-all duration-300 ease-in-out`), eliminating abrupt visual jumps.
- **Tablet (768px - 1023px)**: One-click collapse with smooth Chevron rotation and icon-centered navigation.
- **Mobile (<768px)**: Smooth slide-in off-canvas drawer (`transform transition-transform duration-300 ease-in-out`) with smooth backdrop blur/opacity fade, horizontally scrollable tables, and single-column stacked cards.
- **Universal Smooth Scrolling**: Implemented `scroll-behavior: smooth` and iOS WebKit momentum scrolling (`-webkit-overflow-scrolling: touch`) across `html`, `body`, `<main>`, modals, and tables with refined scrollbar thumb transitions.

---

## 14. Accessibility (a11y)

- **Semantic HTML**: Proper `<header>`, `<nav>`, `<main>`, `<aside>`, `<table scope="col">` elements.
- **Keyboard Navigation**: Modals close on `Escape`; table headers sortable via `Enter`/`Space`; global search opens with `Cmd/Ctrl + K`.
- **Contrast Compliance**: Text colors (slate-900, slate-700, slate-600) strictly meet WCAG AA contrast against white and slate-50 backgrounds.
- **Color Independence**: Badges and status pills combine distinct background colors, borders, and text labels with status dots so users do not rely on color perception alone.

---

## 15. Loading, Error, and Empty States

- **Skeleton Loaders**: `SkeletonLoader.jsx` renders pulsing table rows and cards instead of jarring blank screens or generic spinners.
- **Empty States**: `EmptyState.jsx` displays an icon, clear title, explanation, and a "+ Add" button when zero records are returned.
- **Error Feedback**: Inline validation and warning alerts (`ContractConflictAlert`) clearly state what is wrong and how the user can resolve it.

---

## 16. Important Business Rules Represented in the UI

1. **Active vs Historical Contracts**: Multiple contracts may exist for an employee, but the current active contract is visually prominent with green styling and `CURRENT ACTIVE` badge.
2. **Contract Conflict Blocker**: Overlapping active contract dates display an immediate warning banner with `[ View Existing Contract ]` and `[ Cancel ]`, preventing duplicate active terms.
3. **Attendance Audit Trail**: Manual attendance corrections require an explicit reason and record an immutable timestamp: `"Attendance corrected by HR Manager at [time]"`.
4. **Time Off Allocation Deduction**: Approving a leave request immediately deducts days from the employee's available allocation balance.
5. **Automated Weekly Hours**: Schedule hours are derived from daily shift definitions ($End - Start - Break$) rather than error-prone manual typing.
6. **Strict Payroll Isolation**: The HR Manager workspace contains zero payroll actions, payslips, or execution controls.

---

## 17. Why We Made These UI Decisions

- **Why Action before Information on Dashboard?** HR Managers need to solve operational bottlenecks first. Putting the Attention Center before static metrics reduces daily administrative delay.
- **Why a Persistent Left Sidebar?** An enterprise HR manager switches frequently between employees, attendance, and time off. A persistent sidebar provides predictable navigation with zero click depth.
- **Why Smart Counter Buttons on Employee Profile?** Keeps all related entities (contracts, attendance, leaves) accessible without forcing the user into nested sub-menus.
- **Why Removable Filter Chips?** Users need immediate visibility of which filters are currently applied, with the ability to dismiss individual filters in one click.

---

## 18. Hackathon Judge Talking Points ("How to explain to judges")

> *"PeoplePay360 is an enterprise platform integrating HR operations with payroll. We specifically designed the HR Manager experience as an operational command center centered on the employee."*
>
> *"Notice that the Employee record isn't just a basic CRUD form. It acts as an operational hub linking contracts, attendance logs, time-off requests, and leave balances through smart counter cards."*
>
> *"We prioritized usability over generic decoration: weekly schedule hours calculate automatically, attendance corrections generate a compliance audit note, and approving a leave request immediately updates the employee's leave balance in real time."*
>
> *"From an engineering perspective, our architecture is clean and decoupled: React with Tailwind CSS, a centralized empty API configuration, and a dedicated service layer so our backend team can connect endpoints without modifying UI components."*

---

## 19. Common Technical Questions & Answers

**Q: Why React?**  
*A: React's component-based architecture allows us to break complex HR workflows into reusable, predictable units (tables, filters, smart cards) while maintaining reactive state updates across pages.*

**Q: Why Tailwind CSS?**  
*A: Tailwind provides a consistent, tokenized visual system (colors, spacing, typography) that compiles down to a lightweight CSS bundle without bloated custom stylesheets.*

**Q: Why separate services from components?**  
*A: UI components should only care about presentation and user actions. Isolating API calls inside a service layer allows the backend team to connect REST endpoints without changing any UI code.*

**Q: Why mock data?**  
*A: In hackathons and agile teams, frontend and backend work in parallel. A realistic mock store adhering to the exact service contract allows end-to-end testing and demoing before API deployment.*

**Q: How is role-based access handled?**  
*A: PeoplePay360 enforces segregation of duties. The HR Manager navigation strictly excludes payroll processing, payruns, and salary rules, maintaining focused operational responsibility.*

**Q: Why drawers / focused modals for corrections and approvals?**  
*A: Navigating the user to a separate full page for a quick correction breaks their context. A focused drawer/modal keeps the user grounded in their workflow and requires 50% fewer clicks.*

---

## 20. Technical Trade-Offs

- **React Context vs Redux Toolkit**: We intentionally selected standard React Context and custom hooks over Redux. Given the application scope, React Context delivers complete reactivity without hundreds of lines of action/reducer boilerplate.
- **Tailwind Utility Classes vs CSS Modules**: Tailwind CSS was chosen to maintain design system consistency, reduce custom CSS payload, and enable rapid iteration during the hackathon.

---

## 21. Future Improvements

1. **Real-time WebSockets**: Push notifications for immediate time-off submissions and badge tap events.
2. **Document Upload & OCR**: Scanning signed contracts or medical certificates directly into employee files.
3. **Granular Multi-Role Permissions**: Differentiating between HR Associate, HR Manager, and HR Director approval thresholds.
4. **Offline Mode & IndexedDB Caching**: Enabling offline operations for field managers with automatic sync upon reconnection.
