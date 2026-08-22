# API Documentation
## Smart Maintenance Request & Escalation System

Base URL: `http://localhost:5000/api`

### Authentication (`/auth`)

#### `POST /auth/login`
Authenticates a user and returns a JWT token.
- **Body:** `{ "email": "employee@test.com", "password": "password123" }`
- **Response:** `{ "success": true, "token": "jwt_string", "user": { "id": "cuid", "role": "EMPLOYEE", ... } }`

#### `GET /auth/me`
Fetches the currently authenticated user based on the JWT token.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "isAuthenticated": true, "user": { ... } }`

#### `POST /auth/logout`
Client-side stateless logout (instructs client to delete token).
- **Response:** `{ "success": true, "message": "Logged out successfully" }`

---

### Employee Requests (`/requests`)
*Requires Role: `EMPLOYEE` or `ADMIN`*

#### `POST /requests`
Creates a new maintenance request.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "title": "string", "description": "string", "category": "IT", "priority": "HIGH" }`
- **Response:** `{ "success": true, "request": { ... } }`

#### `GET /requests/my`
Retrieves all maintenance requests created by the authenticated user.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "requests": [ ... ] }`

#### `GET /requests/:id`
Retrieves details of a specific maintenance request owned by the user.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "request": { ..., "escalationLogs": [ ... ] } }`

---

### Admin Management (`/admin`)
*Requires Role: `ADMIN`*

#### `GET /admin/dashboard`
Fetches aggregate statistics for the admin dashboard.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "stats": { "total": 10, "pending": 2, "inProgress": 3, "escalated": 1, "resolved": 4 } }`

#### `GET /admin/requests`
Retrieves all system maintenance requests, with optional status filtering.
- **Headers:** `Authorization: Bearer <token>`
- **Query:** `?status=PENDING` (optional)
- **Response:** `{ "success": true, "requests": [ ... ] }`

#### `GET /admin/requests/:id`
Retrieves full details of any maintenance request, including logs and user details.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "request": { ... } }`

#### `PATCH /admin/requests/:id/assign`
Assigns a technician to the request and automatically sets status to `IN_PROGRESS`.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "technicianId": "cuid" }`
- **Response:** `{ "success": true, "request": { ... } }`

#### `PATCH /admin/requests/:id/status`
Updates the status of a request (e.g., to `RESOLVED`).
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "status": "RESOLVED" }`
- **Response:** `{ "success": true, "request": { ... } }`

#### `POST /admin/requests/:id/escalate`
Manually escalates a request.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "reason": "Manually escalated by Admin" }`
- **Response:** `{ "success": true, "request": { ... } }`

#### `GET /admin/technicians`
Retrieves a list of all users with the `TECHNICIAN` role for assignment dropdowns.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "success": true, "technicians": [ ... ] }`
