# PeoplePay360 Frontend Architecture & Enterprise Documentation

PeoplePay360 is an enterprise-grade HR & Payroll management platform designed for scale, compliance, and multi-tenant security. The frontend is built on **React 18**, **Tailwind CSS**, and **React Router 6**, adhering to a single cohesive design system across all user personas.

---

## 1. Persona Architecture: Separation of Concerns

PeoplePay360 implements strict role differentiation around operational scope rather than superficial button hiding:

| Persona | Core Philosophy | Primary Scope | Primary Command Center |
| :--- | :--- | :--- | :--- |
| **Employee** | *"My Work"* | Personal profile, shift schedule, clocking daily attendance, and time off requests. | Employee Portal |
| **HR Manager** | *"Manage People"* | Workforce records, onboarding, employment contracts, shifts, and leave approvals. | Workforce Snapshot (`/`) |
| **HR Payroll User** | *"Run Payroll Operations"* | Computing payruns, inspecting attendance registers, and drafting payslips. | Payroll Operations (`/payroll`) |
| **HR Payroll Manager** | *"Run HR & Payroll"* | Unified operational authority over workforce contracts, salary structures, rule formulas, and payrun validation. | Unified Workforce & Payroll Command (`/`) |
| **Admin** | *"Control the Platform"* | Highest-privilege platform authority over user accounts, role assignments, security policy enforcement, audit trails, and system telemetry. | Admin Overview & Access Governance (`/admin`) |

> [!NOTE]
> **Judge-Friendly Q&A: Why does Admin have a different dashboard?**
> *"Admin is responsible for controlling the platform rather than operating a specific HR workflow. Therefore, the Admin workspace prioritizes users, roles, permissions, governance, and system status while reusing the same HR and payroll modules with broader permissions."*

---

## 2. Admin UI Architecture

### A. Admin Responsibilities
1. **User Identity & Access Management (IAM)**: Create, inspect, update, activate, and deactivate platform user accounts across departments.
2. **Role Assignment & Governance**: Assign and reassign platform roles with mandatory confirmation dialogues and immediate session token invalidation.
3. **RBAC Policy Administration**: Maintain centralized authorization matrices across all 12 platform modules.
4. **Security & Auditability**: Maintain an immutable, searchable audit log of every role reassignment, security policy change, and user status modification.
5. **Subsystem Telemetry**: Monitor runtime operational status, latency, and uptime across the HR, Attendance, Time Off, Payroll, and Reporting subsystems.
6. **Platform-Wide Module Access**: Full administrative read/write authority across existing operational screens (Employees, Attendance, Contracts, Schedules, Time Off, and Payroll) without code duplication.

---

### B. Admin Navigation Structure (Information Architecture)
The Admin workspace is organized into five logical governance domains within the PeoplePay360 sidebar:

```
OVERVIEW
└── Admin Overview (/admin)

ORGANIZATION
├── Users (/admin/users)
└── Roles & Permissions (/admin/roles)

HR & PAYROLL (Platform-wide Access)
├── Employees (/employees)
├── Attendance (/attendance)
├── Contracts (/contracts)
├── Working Schedules (/schedules)
└── Time Off (/time-off)

PAYROLL (Platform-wide Access)
├── Payruns (/payroll?tab=payruns)
├── Payslips (/payroll?tab=payslips)
├── Salary Structures (/payroll?tab=structures)
└── Salary Rules (/payroll?tab=rules)

SYSTEM
├── Audit Log (/admin/audit)
└── System Administration (/admin/system)
```

---

### C. Centralized Role-Based Access Control (RBAC) Architecture
All permission logic is anchored in a single, authoritative configuration file:
`frontend/src/constants/rbac.js`.

- **5 Platform Roles**: `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`.
- **12 Managed Modules**: `employees`, `attendance`, `contracts`, `schedules`, `timeOff`, `payruns`, `payslips`, `salaryStructures`, `salaryRules`, `reports`, `users`, `roles`, `auditLog`, `systemAdmin`.
- **4 Discrete Actions**: `create`, `read`, `update`, `delete`.
- **Deterministic Helpers**:
  - `hasPermission(roleCode, moduleId, action)`
  - `canAccess(roleCode, moduleId)`
  - `canCreate(roleCode, moduleId)`
  - `canUpdate(roleCode, moduleId)`
  - `canDelete(roleCode, moduleId)`
  - `getRoleAccessSummary(roleCode)`
  - `getPermissionMatrix()`

*Zero permission logic is duplicated or hardcoded inside individual UI components.*

---

### D. User Management & Role Assignment Flow
- **User Directory (`/admin/users`)**: Searchable, filterable table showing user identities, business emails, role pills, department tags, active/inactive status badges, and last active timestamps.
- **User Creation (`UserFormModal.jsx`)**: Slide-over drawer with real-time profile badge, field validations, role assignment dropdown, and sticky action footer.
- **User Detail & Access Summary (`UserDetailDrawer.jsx`)**: Dynamically computes allowed/denied capabilities for the user's role directly from the RBAC engine (`getRoleAccessSummary`), displaying human-readable indicators (`✓ Allowed` / `— Not allowed`).
- **Role Assignment Dialog (`RoleChangeDialog.jsx`)**: Prevents silent role escalations. Prominently alerts the administrator:
  > *"Sarah Jenkins will change from HR Manager to HR Payroll Manager. This will change the permissions available to this user."*
  Confirming records an explicit audit entry in the Audit Log in real time.

---

### E. Permission Matrix (`/admin/roles`)
Provides a bird's-eye governance view:
- **Rows**: 12 Platform Modules (`Employees`, `Attendance`, `Contracts`, `Schedules`, `Time Off`, `Payruns`, `Payslips`, `Salary Structures`, `Salary Rules`, `Users`, `Roles`, `System Administration`).
- **Columns**: 5 Platform Roles (`Employee`, `HR Manager`, `HR Payroll User`, `HR Payroll Manager`, `Admin`).
- **Granular Indicators**: Discrete capability tags (`C` = Create, `R` = Read, `U` = Update, `D` = Delete) with accessible badges and contrast guarantees.

---

### F. Audit Log (`/admin/audit`)
An immutable audit trail documenting administrative activities:
- **Fields**: Timestamp, Administrator, Action, Module, Target Details, and Status.
- **Filtering**: Multi-dimensional filtering by Module, Action Type, and Status.
- **Export**: Real-time JSON export utility for compliance audits.

---

### G. System Administration (`/admin/system`)
- **Platform Telemetry**: Application version, runtime environment, cryptographic standard (AES-256 GCM, TLS 1.3), and synchronous database status.
- **Active Controls**:
  - `Strict Data Validation`: Real-time toggle enforcing zero-tolerance checks on payroll batch calculations.
  - `Admin Inactivity Timeout`: Dynamic dropdown (15, 30, 60, 120 minutes) logging modifications to the audit trail.
- **Subsystem Health Monitoring**: Dedicated live status indicators for HR Management, Attendance Service, Time Off Registry, Payroll Engine, and Reports.

---

## 3. Engineering & Security Principles

### A. Reuse of Existing Modules (No Duplication)
Admin accesses existing HR and Payroll modules (`/employees`, `/attendance`, `/contracts`, `/schedules`, `/time-off`, `/payroll`, `/reports`) directly. Admin does not have separate duplicate screens; rather, the existing components render with Admin-level authorization flags derived from the RBAC engine.

### B. Service & API Layer Architecture
Per Hackathon Architecture Guidelines, frontend components never contain hardcoded API URLs. All requests flow through a layered pipeline:
```
React UI Components
       ↓
Context Hooks (`useHRData()`)
       ↓
Service Layer (`adminService.js`, `payrollService.js`, etc.)
       ↓
API Layer (`apiService.js` with configurable `API_BASE_URL`)
       ↓
Future Backend Endpoints
```

### C. Frontend vs. Backend Security Responsibility
> [!IMPORTANT]
> **Hiding a button is NOT security.**
> The frontend RBAC layer delivers a polished, context-aware user experience by tailoring available views and actions to the active persona. However, true security must be enforced on the server. In production, backend microservices independently authenticate JSON Web Tokens (JWT) and evaluate cryptographic permissions before executing any database mutation.

---

## 4. Hackathon Judge Demonstration Flow

Judges can evaluate the entire RBAC architecture in a fluid 2-minute walkthrough:

1. **TopBar Persona Switcher**: Click `Admin` on the top bar. Notice the active persona switches with instant UI transition.
2. **Admin Overview (`/admin`)**: Inspect the Platform Snapshot cards (24 Users, 5 Roles, 86 Permissions, 2 Access Alerts, ● Healthy status) and Access Governance banner.
3. **User Management (`/admin/users`)**:
   - Filter by department or role.
   - Click a user row to open `UserDetailDrawer`. Notice the dynamic **Access Summary** generated from RBAC.
   - Change their role in the dropdown; observe the **Role Change Confirmation Dialog** warning about permission changes. Confirm the reassignment.
4. **Audit Log (`/admin/audit`)**: Open the Audit Log to see the role change logged live with timestamp and administrator details.
5. **Roles & Permission Matrix (`/admin/roles`)**:
   - Inspect the 5 role cards with user counts and scopes.
   - Switch to the **Permission Matrix** tab to inspect the 12×5 matrix derived from `rbac.js`.
6. **Platform-Wide Access**: From the Admin sidebar, click `Employees` or `Payroll` to verify that Admin navigates to the shared HR & Payroll modules seamlessly without duplicate pages.
