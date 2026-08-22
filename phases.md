# Development Phases

The project is implemented in the following phases to prioritize a fully working end-to-end workflow:

## Phase 1: Database & Core Setup
- **Objective:** Establish the data models and authentication foundation.
- **Tasks:**
  - Define `User`, `MaintenanceRequest`, and `EscalationLog` models in Prisma.
  - Apply migrations to the PostgreSQL database.
  - Implement a database seed script to generate test users (`EMPLOYEE`, `ADMIN`, `TECHNICIAN`) using Argon2 hashing.
- **Status:** Complete

## Phase 2: Backend API & Automation
- **Objective:** Build the REST API and the automatic escalation system.
- **Tasks:**
  - Develop `authMiddleware.js` for Role-Based Access Control (RBAC).
  - Create `/api/requests` for Employee operations.
  - Create `/api/admin` for Admin management operations and dashboard statistics.
  - Implement `escalationJob.js` using `node-cron` to automatically check for SLA violations and update status to `ESCALATED`.
- **Status:** Complete

## Phase 3: Web Application (React)
- **Objective:** Provide a comprehensive portal for Admins and an alternative web dashboard for Employees.
- **Tasks:**
  - Update routing (`App.tsx`) to conditionally render content based on `user.role`.
  - Develop `EmployeeDashboard.tsx` with request creation and personal tracking.
  - Develop `AdminDashboard.tsx` with system-wide tracking, assignments, manual escalation, and resolution.
- **Status:** Complete

## Phase 4: Mobile Application (React Native)
- **Objective:** Provide an on-the-go experience for Employees and Admins.
- **Tasks:**
  - Update `AppNavigator.tsx` to conditionally load role-based screen stacks.
  - Develop `EmployeeDashboardScreen.tsx` and `AdminDashboardScreen.tsx`.
- **Status:** Complete

## Phase 5: Email Notification System
- **Objective:** Introduce email notifications for critical workflow events.
- **Tasks:**
  - Add `EmailLog` model to Prisma schema.
  - Integrate an SMTP mailer (e.g., `nodemailer`).
  - Create a reusable `EmailService` that handles automated and manual escalation alerts.
  - Ensure fail-safes so that email failures do not corrupt request state.
- **Status:** Pending

## Phase 6: Polish & Deployment (Future)
- **Objective:** Finalize UX and deploy to production.
- **Tasks:**
  - Implement SLA visual timers on dashboards.
  - Setup CI/CD and deploy Backend to a cloud provider, Web to Vercel/Netlify, and Mobile to App Stores.
- **Status:** Pending
