# Product Requirements Document

## 1. Product Overview

### Product Name

**Smart Maintenance Request & Escalation System**

### Purpose

Build an end-to-end maintenance management platform that allows employees to report maintenance issues, track their requests, and receive updates while enabling administrators/facility managers to monitor, assign, manage, resolve, and automatically escalate unresolved requests.

The system must provide visibility, accountability, and timely escalation for maintenance issues. The primary goal is a complete working workflow rather than an overly complex implementation. This directly follows the hackathon requirement to focus on an end-to-end functional system.

---

# 2. Product Goals

The system should:

1. Allow employees to submit maintenance requests.
2. Allow employees to track their submitted requests.
3. Allow admins to view and manage all requests.
4. Allow admins to assign requests to technicians.
5. Allow admins to update request statuses.
6. Automatically escalate unresolved requests after an SLA/time threshold.
7. Allow admins to manually escalate requests.
8. Maintain a complete escalation history.
9. Send email notifications when important escalation events occur.
10. Provide dashboards for employees and admins.
11. Provide a clean and responsive interface.
12. Demonstrate a complete end-to-end workflow suitable for a 2–3 minute presentation.

The core workflow required by the source document is:

**Employee Login → Raise Request → Admin Views & Assigns → Status Updates → Unresolved Request Automatically Escalates.**

---

# 3. User Roles

## 3.1 Employee

Employees can:

* Login
* Create maintenance requests
* View their own requests
* View request details
* Track request status
* View assigned technician
* View escalation status
* Receive email notifications
* View request history

Employees must not have access to other employees' requests.

---

## 3.2 Admin / Facility Manager

Admins can:

* Login
* View all maintenance requests
* View request details
* Filter requests
* Assign technicians
* Update request status
* Manually escalate requests
* Resolve requests
* View escalation history
* View dashboard statistics
* Receive escalation email notifications

The source document explicitly requires admins/facility managers to view all maintenance requests, update statuses, assign technicians, and close tickets.

---

## 3.3 Technician

Technicians are users who can be assigned to maintenance requests.

For the MVP, the technician does not require a complex independent workflow.

---

# 4. Authentication

The system should support role-based access.

For the fast MVP, support simplified/mock users:

```text
Employee
John Doe

Admin
Facility Manager

Technician
Maintenance Technician
```

The original requirements explicitly allow static/mock users and manual/dropdown role selection for rapid development. Full authentication is optional.

If full authentication is implemented, permissions must ensure:

```text
Employee → Own requests only
Admin    → All requests
Technician → Assigned requests
```

---

# 5. Maintenance Request

## 5.1 Create Request

Employees must be able to create a maintenance request.

### Required fields

* Title
* Description
* Category
* Priority

### Categories

```text
IT
FACILITY
ELECTRICAL
PLUMBING
HVAC
OTHER
```

### Priority

```text
LOW
MEDIUM
HIGH
CRITICAL
```

### Initial Status

Every newly created request must have:

```text
PENDING
```

---

# 6. Request Status Lifecycle

The system must support these statuses:

```text
PENDING
IN_PROGRESS
ESCALATED
RESOLVED
```

### Normal lifecycle

```text
PENDING
   ↓
IN_PROGRESS
   ↓
RESOLVED
```

### Escalation lifecycle

```text
PENDING
   ↓
IN_PROGRESS
   ↓
ESCALATED
   ↓
RESOLVED
```

A resolved request must not be automatically escalated.

---

# 7. Employee Dashboard

The employee dashboard should display:

### Summary Cards

```text
Total Requests
Pending
In Progress
Escalated
Resolved
```

### Request List

Each request should display:

* Request ID
* Title
* Category
* Priority
* Status
* Assigned technician
* Created date
* Updated date

### Actions

Employee can:

* View request
* Create request
* Track request

Employee cannot:

* Change status
* Assign technician
* Escalate manually
* View another employee's request

---

# 8. Admin Dashboard

The admin dashboard should provide a complete operational view.

### Summary

```text
Total Requests
Pending
In Progress
Escalated
Resolved
```

### Filters

```text
All
Pending
In Progress
Escalated
Resolved
```

The source document explicitly lists dashboard filtering as a bonus feature.

### Request Table

Display:

* Request ID
* Issue
* Employee
* Category
* Priority
* Status
* Assigned Technician
* Created At
* Updated At
* SLA state
* Actions

### Actions

```text
View
Assign
Update Status
Escalate
Resolve
```

---

# 9. Request Details

A request detail screen/modal must show:

```text
Request ID
Title
Description
Employee
Category
Priority
Status
Assigned Technician
Created At
Updated At
Escalated At
```

## Request Timeline

Display a visual timeline:

```text
Request Created
       ↓
Assigned
       ↓
In Progress
       ↓
SLA Warning
       ↓
Escalated
       ↓
Resolved
```

Only display events that actually occurred.

---

# 10. Technician Assignment

Admin can assign a technician to a request.

### Flow

```text
Admin opens request
       ↓
Select Technician
       ↓
Assign
       ↓
Technician assigned
       ↓
Request becomes IN_PROGRESS
```

The assigned technician should be visible on:

* Admin request details
* Employee request details

---

# 11. Automatic Escalation

Automatic escalation is a core product feature.

The system must monitor unresolved requests.

### Logic

```text
Request Created
       ↓
Request remains unresolved
       ↓
SLA threshold reached
       ↓
System detects overdue request
       ↓
Status → ESCALATED
       ↓
Create escalation log
       ↓
Send email notification
```

The source document specifically states that requests remaining unresolved beyond a threshold should automatically escalate and that this may be simulated using simple timer logic.

---

# 12. SLA Configuration

The escalation threshold should be configurable.

Example development/demo value:

```text
ESCALATION_THRESHOLD = 1 minute
```

Production-style values can later be different.

The system should determine whether:

```text
Current Time - Request Created Time
```

has exceeded the configured threshold.

Do not escalate requests when:

```text
status = RESOLVED
```

Do not repeatedly escalate:

```text
status = ESCALATED
```

---

# 13. Manual Escalation

Admins must be able to manually escalate any unresolved request.

### Flow

```text
Admin
 ↓
Open Request
 ↓
Click Escalate
 ↓
Enter Reason
 ↓
Confirm
 ↓
Request → ESCALATED
 ↓
Create Escalation Log
 ↓
Send Email Notification
```

Example reason:

```text
Issue unresolved beyond SLA
```

---

# 14. Escalation Log

Every escalation must create a permanent history record.

Store:

```text
ID
Request ID
Previous Status
New Status
Reason
Escalated To
Escalated At
Escalation Type
```

### Escalation Type

```text
AUTOMATIC
MANUAL
```

Example:

```text
Request #101

Previous Status:
IN_PROGRESS

New Status:
ESCALATED

Reason:
Issue unresolved beyond SLA

Type:
AUTOMATIC

Escalated At:
10:42 AM
```

---

# 15. Email Notification System

Email notification is an important enhancement to the base MVP and corresponds to the source document's optional escalation notification feature.

The system must send an email when a request is escalated.

## Email Events

### Automatic Escalation

When the SLA timer automatically escalates a request:

```text
Request
 ↓
Escalated
 ↓
Email Notification
```

### Manual Escalation

When an admin manually escalates:

```text
Admin Escalates
 ↓
Email Notification
```

---

# 16. Email Recipients

At minimum, send escalation notifications to:

### Admin / Facility Manager

The admin should receive:

```text
Request #101 has been escalated.
```

Optionally notify:

### Employee

The employee can receive:

```text
Your maintenance request #101 has been escalated.
```

---

# 17. Email Content

## Escalation Email

### Subject

```text
Maintenance Request #101 Escalated
```

### Body

```text
Maintenance Request Escalation

Request ID:
#101

Issue:
Internet Not Working

Employee:
John Doe

Category:
IT

Priority:
HIGH

Current Status:
ESCALATED

Reason:
Request exceeded the configured SLA threshold.

Assigned Technician:
Mike

Please review and take appropriate action.
```

The email should contain a clear call-to-action directing the recipient back to the request/admin dashboard when a dashboard URL is available.

---

# 18. SMTP Configuration

The application must support configurable SMTP credentials through environment configuration.

Example:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
MAIL_FROM
```

Do not hardcode:

* SMTP username
* SMTP password
* App password
* Email credentials

The application should use an SMTP account with an app password where required by the email provider.

---

# 19. Email Service

Create a reusable email service rather than sending emails directly from request controllers.

Required capability:

```text
sendEscalationEmail()
```

Example logical flow:

```text
Escalation Service
       ↓
Update Request
       ↓
Create Escalation Log
       ↓
Email Service
       ↓
SMTP
       ↓
Admin
```

Email failure must not corrupt the maintenance request state.

For example:

```text
Database Escalation → SUCCESS
Email               → FAILED
```

The request should remain:

```text
ESCALATED
```

and the email failure should be logged for debugging/retry.

---

# 20. Email Logs

Maintain basic email delivery logs.

Store:

```text
ID
Request ID
Recipient
Subject
Notification Type
Status
Message ID
Error
Created At
```

### Notification Type

```text
REQUEST_ESCALATED
```

### Status

```text
SENT
FAILED
```

This provides traceability between an escalation and its notification.

---

# 21. API Requirements

## User

```text
GET /api/auth/me
```

## Employee

```text
POST /api/requests
GET /api/requests/my
GET /api/requests/:id
```

## Admin

```text
GET /api/admin/requests
GET /api/admin/dashboard

PATCH /api/admin/requests/:id/assign

PATCH /api/admin/requests/:id/status

POST /api/admin/requests/:id/escalate

GET /api/admin/escalations
```

## Optional Email Monitoring

```text
GET /api/admin/notifications
```

This can show email notification history.

---

# 22. Database Requirements

## Users

```text
id
name
email
role
created_at
```

## Maintenance Requests

```text
id
title
description
category
priority
status
employee_id
assigned_to
created_at
updated_at
escalated_at
```

## Escalation Logs

```text
id
request_id
previous_status
new_status
reason
escalated_to
escalation_type
created_at
```

## Email Logs

```text
id
request_id
recipient
subject
notification_type
status
message_id
error
created_at
```

The original requirements explicitly require storage for employee data, maintenance requests, and escalation logs.

---

# 23. Real-Time Request Updates

The employee interface should reflect request status changes without requiring a full page reload.

The MVP can periodically refresh request data.

Example:

```text
Admin changes status
       ↓
Request updated
       ↓
Employee dashboard refreshes
       ↓
New status displayed
```

Important updates include:

* Assigned
* In Progress
* Escalated
* Resolved

---

# 24. Notifications in UI

In addition to email, show in-app feedback:

```text
Request created successfully.

Request assigned successfully.

Request status updated.

Request escalated successfully.

Request resolved successfully.
```

For escalation:

```text
⚠ Request #101 has been escalated.
```

---

# 25. Optional Smart Features

After the core workflow is complete, implement these in priority order:

### Priority 1 — SLA Timer

Show:

```text
SLA Remaining: 00:42
```

### Priority 2 — Dashboard Filters

```text
Pending
In Progress
Escalated
Resolved
```

### Priority 3 — Category Auto-Assignment

Example:

```text
IT → IT Team
HVAC → Facility Team
Electrical → Electrical Team
```

### Priority 4 — Email Notifications

Already included as a core enhancement.

### Priority 5 — Priority-Based SLA

```text
CRITICAL → Shortest SLA
HIGH     → Short SLA
MEDIUM   → Medium SLA
LOW      → Longest SLA
```

These features align with the bonus features listed in the source document.

---

# 26. Complete End-to-End Scenario

The primary demo must work as follows:

```text
Employee Login
      ↓
Employee Dashboard
      ↓
Create "Internet Not Working"
      ↓
Status = PENDING
      ↓
Admin Dashboard
      ↓
Admin sees Request #101
      ↓
Admin assigns Technician
      ↓
Status = IN_PROGRESS
      ↓
Request remains unresolved
      ↓
SLA threshold exceeded
      ↓
Automatic Escalation
      ↓
Status = ESCALATED
      ↓
Escalation Log Created
      ↓
Email Sent to Admin
      ↓
Employee sees ESCALATED
      ↓
Admin reviews request
      ↓
Admin resolves request
      ↓
Status = RESOLVED
```

This is the central product workflow and matches the required MVP flow from the source document.

---

# 27. Error Handling

The system must handle:

* Invalid request data
* Missing required fields
* Request not found
* Unauthorized access
* Invalid status transition
* Invalid technician
* Duplicate escalation
* SMTP failure
* Database failure
* Failed email notification

Email failure should never undo a successful escalation.

---

# 28. UI/UX Requirements

The application should be:

* Clean
* Responsive
* Easy to understand
* Consistent between employee and admin modules
* Clear about request status
* Clear about escalation
* Clear about SLA state

Use strong visual distinction between:

```text
PENDING
IN_PROGRESS
ESCALATED
RESOLVED
```

The source document evaluates UI/UX based on clarity, responsiveness, and user experience.

---

# 29. MVP Priority

## Must Have

```text
Employee Login
Create Request
Employee Request List
Admin Request List
Request Details
Assign Technician
Update Status
Manual Escalation
Automatic Escalation
Escalation Logs
Email on Escalation
Employee Status Tracking
Admin Dashboard
```

## Should Have

```text
Dashboard Filters
SLA Timer
Request Timeline
Email Logs
In-App Notifications
```

## Nice to Have

```text
Category Auto-Assignment
Priority-Based SLA
Advanced Analytics
Advanced Authentication
Push Notifications
```

Do not implement nice-to-have features until the complete end-to-end workflow is stable.

---

# 30. Demo Acceptance Criteria

The application passes the MVP test when the following scenario works without manual database manipulation:

### Test 1 — Request Creation

Employee creates a request.

Expected:

```text
Request created
Status = PENDING
```

### Test 2 — Admin Management

Admin sees the request.

Expected:

```text
Request visible in Admin Dashboard
```

### Test 3 — Assignment

Admin assigns technician.

Expected:

```text
Technician assigned
Status = IN_PROGRESS
```

### Test 4 — Automatic Escalation

Request exceeds SLA.

Expected:

```text
Status = ESCALATED
Escalation Log Created
Email Notification Sent
```

### Test 5 — Employee Tracking

Employee opens dashboard.

Expected:

```text
Request #101
Status = ESCALATED
```

### Test 6 — Resolution

Admin resolves the request.

Expected:

```text
Status = RESOLVED
```

### Test 7 — No Duplicate Escalation

An already escalated request must not generate repeated escalation records every time the escalation checker runs.

---

# 31. Final Product Flow

The final system should provide this complete experience:

```text
                    ┌──────────────────┐
                    │     Employee     │
                    └────────┬─────────┘
                             │
                             ▼
                    Create Maintenance
                         Request
                             │
                             ▼
                    ┌──────────────────┐
                    │     PENDING      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      ADMIN       │
                    │ View & Assign    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   IN_PROGRESS    │
                    └────────┬─────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                 Resolved         SLA Exceeded
                    │                 │
                    ▼                 ▼
              ┌───────────┐    ┌────────────┐
              │ RESOLVED  │    │ ESCALATED  │
              └───────────┘    └──────┬─────┘
                                      │
                              ┌───────┴────────┐
                              │                │
                              ▼                ▼
                       Escalation Log     Email Alert
                              │                │
                              └───────┬────────┘
                                      │
                                      ▼
                               Admin Action
                                      │
                                      ▼
                                  RESOLVED
```

The product should ultimately demonstrate visibility, accountability, request tracking, assignment, status management, escalation, and notification in one complete workflow. The source document emphasizes that this end-to-end functionality is the most important part of the submission.
