# Backend Documentation

This document explains the Python Flask backend service of the **SyllabiX** platform. It describes the Flask API architecture, routing layers, utility functions, database helper pipelines, and security mechanisms.

---

## Backend Architecture

The backend is built as a single-entry Python Flask microservice located in `backend/app.py`. It operates as a lightweight API server that communicates with a local SQLite database (`curriculum_ai.db`) and handles authentication, user profile management, and curriculum generation logs.

### Key Technology Components
- **Flask**: Python web application framework.
- **Flask-CORS**: Handles Cross-Origin Resource Sharing (CORS) configurations, allowing requests from specific frontend dev and production origins.
- **Flask-JWT-Extended**: Manages stateless JWT authentication, access tokens, and refresh tokens.
- **Bcrypt**: Hashes and validates local passwords.
- **SQLite3**: Lightweight, file-based SQL database for local data persistence.

---

## File Documentation: `backend/app.py`

### Purpose
The core entry point of the backend. It registers middleware configurations (CORS, JWT), initializes database connection contexts, runs table migrations, and defines all REST API endpoints.

---

### Database Utility & Helper Functions

#### 1. `init_db()`
* **Purpose**: Initializes the SQLite database tables and applies necessary columns migrations.
* **Tables Created**:
  - `users`: Stores account information, hashed passwords, Firebase UIDs, and profile fields.
  - `history_records`: Stores generated course outlines, domain inputs, export status flags, and serialized curriculum JSON strings.
* **Inputs**: None.
* **Outputs**: None.

#### 2. `get_db()`
* **Purpose**: Returns the database connection for the current Flask request context. It sets the `row_factory` to `sqlite3.Row` to allow accessing query results by column names.
* **Inputs**: None.
* **Outputs**: `conn` (`sqlite3.Connection` object).

#### 3. `close_db(exc)`
* **Purpose**: Teardown callback that safely closes the connection to `curriculum_ai.db` once the request completes.
* **Inputs**: `exc` (Exception object if triggered).
* **Outputs**: None.

#### 4. `user_row_to_dict(row)`
* **Purpose**: Converts a database row from the `users` table into a clean JSON-serializable Python dictionary, omitting sensitive fields (like password hash).
* **Inputs**: `row` (`sqlite3.Row` object).
* **Outputs**: `dict` representation of user details.

---

### API Routing Layer

#### 1. `/api/register` [POST]
* **Purpose**: Registers a new local email/password account.
* **Inputs**:
  - JSON Body: `{ "name": "string", "email": "string", "password": "string" }`
* **Outputs**:
  - Success (`201`): `{ "message": "Account created", "user": {}, "access_token": "JWT", "refresh_token": "JWT" }`
  - Error (`400` / `409`): Validation or duplication error message.

#### 2. `/api/login` [POST]
* **Purpose**: Authenticates credentials for local logins.
* **Inputs**:
  - JSON Body: `{ "email": "string", "password": "string" }`
* **Outputs**:
  - Success (`200`): `{ "message": "Login successful", "user": {}, "access_token": "JWT", "refresh_token": "JWT" }`
  - Error (`400` / `401`): Validation or invalid credential warnings.

#### 3. `/api/google-auth` [POST]
* **Purpose**: Validates or registers accounts authenticated via Firebase Google OAuth.
* **Inputs**:
  - JSON Body: `{ "name": "string", "email": "string", "photoURL": "string", "uid": "string" }`
* **Outputs**:
  - Success (`200`): `{ "message": "Google login successful", "user": {}, "access_token": "JWT", "refresh_token": "JWT" }`
  - Error (`400`): Missing parameters error.

#### 4. `/api/logout` [POST] (JWT Required)
* **Purpose**: Triggers logouts. Since JWT is stateless, it returns a confirmation message, and the client discards its cached tokens.
* **Inputs**: Bearer Authorization Header.
* **Outputs**:
  - Success (`200`): `{ "message": "Logged out" }`


#### 7. `/api/profile` [GET, PUT] (JWT Required)
* **Purpose**: Retrieves or updates user profile metadata.
* **Inputs**:
  - GET: None.
  - PUT: JSON Body with fields `{ "name", "email", "phone", "institution", "role", "bio", "country", "timezone", "photo_url" }`
* **Outputs**:
  - GET Success (`200`): `{ "user": {} }`
  - PUT Success (`200`): `{ "message": "Profile updated successfully", "user": {} }`
  - Error (`400` / `409`): Validation errors or email duplication checks.

#### 8. `/api/history` [GET] (JWT Required)
* **Purpose**: Retrieves past curriculum generation logs for the current user.
* **Query Params**: `role` (optional filter: `faculty` or `student`).
* **Outputs**:
  - Success (`200`): Array of history objects containing loaded curriculum outputs.

#### 9. `/api/history` [POST] (JWT Required)
* **Purpose**: Saves a newly generated curriculum outline to history records.
* **Inputs**:
  - JSON Body: Full curriculum configuration details.
* **Outputs**:
  - Success (`201`): `{ "message": "History saved successfully", "id": integer }`

#### 10. `/api/history/<int:record_id>` [DELETE] (JWT Required)
* **Purpose**: Deletes a specific history record if owned by the requesting user.
* **Outputs**:
  - Success (`200`): `{ "message": "History deleted successfully" }`
  - Error (`404`): Unauthorized access or not found.

#### 11. `/api/history/<int:record_id>/export` [PUT] (JWT Required)
* **Purpose**: Updates the pdf/json export status flag for a history record.
* **Inputs**:
  - JSON Body: `{ "type": "pdf" | "json", "status": boolean }`
* **Outputs**:
  - Success (`200`): `{ "message": "Export status updated successfully" }`
  - Error (`400` / `404`): Invalid parameters or not found.

#### 12. `/api/health` or `/health` [GET]
* **Purpose**: Simple health check route returning server status.
* **Outputs**: `{ "status": "ok", "service": "SyllabiX Auth API" }`
