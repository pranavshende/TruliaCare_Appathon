# 🏆 TruliaCare Database Pitch Script & Key Talking Points for Judges

---

## 🎙️ 60-Second Pitch Script (Word-for-Word Guide)

> "Hello Judges! As the **Database Developer** for TruliaCare, my objective was to engineer a **high-performance, secure, and enterprise-audit-ready data architecture** for our Smart Maintenance Request & Escalation System using **PostgreSQL and Prisma ORM 7**.
>
> In high-stakes maintenance operations—like server room outages or electrical faults—data reliability and SLA compliance are critical. Here is what makes our database design stand out:
>
> 1. **Unified Polymorphic Roles**: Instead of creating bloated multi-table schemas for Employees and Technicians, we unified them into a clean `User` model using dual named Prisma relations (`EmployeeRequests` and `AssignedRequests`). This eliminates slow multi-table JOINs and drastically speeds up dashboard queries.
>
> 2. **Enterprise CUID Security**: We standardized all identifiers to collision-resistant **CUID strings** rather than predictable integer IDs, preventing ID enumeration and scraping attacks.
>
> 3. **Forensic SLA Auditability**: Every escalation—whether triggered by automated timer logic or manual admin intervention—generates an immutable record in `EscalationLog` with `previousStatus`, `newStatus`, trigger type, and reason.
>
> 4. **Notification Observability**: Through our dedicated `EmailLog` table, we track the delivery status (`SENT`/`FAILED`), message IDs, and errors of every escalation alert dispatched, ensuring zero lost notifications.
>
> 5. **Sub-Millisecond Indexing**: We placed dedicated B-Tree indexes across ticket statuses, employee IDs, technician IDs, and categories to guarantee real-time filtering even under high ticket volume.
>
> Our database is fully migrated, strictly typed, and pre-seeded with realistic mock scenarios for our live demo!"

---

## 🎯 5 Core Pitch Pillars (Quick Bullet Points)

| # | Pillar | What We Built | The Business & Technical Value |
|---|---|---|---|
| **1** | **Unified Relational Model** | `User` with dual relations: `requestsCreated` & `requestsAssigned` | Avoids duplicate profile tables; allows users to be employees, admins, or assigned technicians with zero data duplication. |
| **2** | **Distributed CUID Identifiers** | All PKs (`User`, `MaintenanceRequest`, `EscalationLog`, `EmailLog`) use `cuid()` | Collision-resistant, URL-safe, non-sequential security preventing ID guessing attacks. |
| **3** | **Immutable Escalation Audit Trail** | Dedicated `EscalationLog` with `onDelete: Cascade` | Full forensic history of SLA breaches, state changes, trigger types (`AUTOMATIC` vs `MANUAL`), and target roles. |
| **4** | **Outbound Alert Observability** | `EmailLog` tracking `SENT` / `FAILED` states & errors | Guarantees compliance and auditability for critical escalations sent to leadership. |
| **5** | **Optimized Query Indexing** | Composite & single indexes on `status`, `employeeId`, `technicianId`, `category` | Ensures instant dashboard filter updates and fast background cron/timer polling. |

---

## 🧠 Judge Q&A Cheat Sheet (How to Answer Common Database Questions)

### Q1: *"Why did you combine Technicians and Employees into a single `User` table?"*
> **Answer:** *"In enterprise workflows, technicians and employees share 90% of identity attributes (auth, email, department, status). By unifying them into `User` with a `role` discriminator and dual Prisma foreign keys (`EmployeeRequests` and `AssignedRequests`), we eliminate JOIN bottlenecks and make technician reassignment as simple as updating a single foreign key."*

### Q2: *"Why use CUIDs instead of traditional auto-increment integers?"*
> **Answer:** *"Auto-increment integers are vulnerable to enumeration attacks (where someone can guess ticket #102 follows #101). CUIDs are horizontally scalable, collision-resistant, URL-safe, and ready for distributed architectures without ID collisions."*

### Q3: *"How does the database support automated SLA escalation?"*
> **Answer:** *"The `MaintenanceRequest` model stores `createdAt` and `escalatedAt`. When an SLA breach is triggered, the transition is recorded both on the ticket (`status = ESCALATED`, `escalatedAt = now()`) and in an immutable `EscalationLog` entry detailing `previousStatus`, `newStatus`, `escalationType: AUTOMATIC`, and `reason`."*

### Q4: *"How do you maintain data cleanliness when tickets are deleted?"*
> **Answer:** *"We defined strict referential integrity with cascading constraints (`onDelete: Cascade`) on `EscalationLog` and `EmailLog`, ensuring zero orphan records if a parent maintenance request is purged."*

---

## 📊 Summary Architecture Snapshot for Slides / Verbal Summary

- **Database Engine**: PostgreSQL
- **Data Access Layer**: Prisma ORM v7.9 (TypeScript type safety)
- **Primary Entities**: `User` (RBAC), `MaintenanceRequest` (Core lifecycle), `EscalationLog` (SLA audit), `EmailLog` (Alert tracking), `Session` (Auth store).
- **Index Count**: 7 optimized indexes targeting filter bottlenecks.
- **Migration & Seeding**: 100% automated via Prisma Migrate and custom Argon2 seed scripts.
