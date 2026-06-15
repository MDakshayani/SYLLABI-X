# Authentication Flow Documentation

This document explains the authentication architecture of the **SyllabiX** platform. It details the hybrid authentication flow, which uses local JWT credentials and Google OAuth verified via the Google Firebase Client SDK.

---

## Authentication Architecture Overview

SyllabiX uses a secure hybrid authentication workflow:
- **Local Authentication**: Handled via standard REST API endpoints on the Flask backend, storing hashed passwords using Bcrypt.
- **Social Sign-In**: Uses Google Authentication handled via the Firebase Client SDK popup. The verified profile information is sent to the Flask API, which signs the user in or automatically creates a profile.
- **Session Management**: Handled using JSON Web Tokens (JWT) through access tokens and refresh tokens.

```text
[LOCAL LOGIN FLOW]
User Credentials ──► React Client (authStore) ──► POST /api/login ──► Check Bcrypt ──► Return JWTs

[GOOGLE OAUTH FLOW]
Click Google Auth ──► Firebase SDK Consent ──► Returns Identity Token ──► POST /api/google-auth ──► Return JWTs
```

---

## Local Authentication Workflows

### 1. Account Signup (`/api/register`)
1. The user enters their name, email, and password (minimum 8 characters) on the signup screen.
2. The React client calls `register(name, email, password)` in `authStore.js`.
3. The store dispatches a `POST` request to `/api/register`.
4. The Flask backend:
   - Validates that fields are present.
   - Queries SQLite `users` table to check if the email is already registered.
   - Hashes the password using `bcrypt.hashpw` with a random salt.
   - Inserts the record into the `users` table.
   - Generates JWT Access Token (expires in 24 hours) and Refresh Token (expires in 30 days).
   - Returns the user profile object and the tokens.
5. The React client saves the tokens in `localStorage` and updates the global user state.

### 2. Standard Login (`/api/login`)
1. The user inputs their email and password on the login screen.
2. The store dispatches a `POST` request to `/api/login`.
3. The Flask backend:
   - Queries `users` for the matching email.
   - Validates the password using `bcrypt.checkpw(password, hashed_password)`.
   - Generates and returns JWT tokens on success.

---

## Google Authentication Workflow

Google OAuth is coordinated via the Firebase SDK on the client and verified on the backend:

1. **Trigger Popup**: The user clicks the **Sign in with Google** button. This calls the `triggerGoogleLogin()` handler in `src/hooks/useGoogleAuth.js`.
2. **Firebase Auth Handshake**: The browser triggers the Firebase Google Authentication popup (`signInWithPopup`). The user selects their Google account and consents.
3. **Retrieve Credentials**: Firebase Client SDK returns the authenticated user object containing:
   - `uid`: Unique Google/Firebase ID.
   - `displayName`: Full Name.
   - `email`: Google account email.
   - `photoURL`: Account picture.
4. **Backend Ingestion (`/api/google-auth`)**: The custom hook intercepts the Firebase response and dispatches a request to `/api/google-auth` on the Flask backend:
   - The backend checks if a user with that email exists in SQLite.
   - If not, it automatically registers a user with the provider set to `'google'` and password set to empty.
   - If the user exists, it updates their `photo_url` and `firebase_uid` fields.
   - The backend returns standard JWT access and refresh tokens.

---


## Session Management & User Persistence

- **Stateless Tokens**: The backend uses stateless JWT tokens (`Flask-JWT-Extended`). The tokens are passed in the `Authorization: Bearer <access_token>` request header.
- **Local Cache**:
  - The client stores the `access_token` and `refresh_token` in the browser's `localStorage`.
  - The user profile JSON is cached in `localStorage` under `auth_user`.
- **Profile Reload**: On boot, the layout dispatches `fetchProfile()` to reload user settings from `/api/profile` to check token validity and sync profile information.

---

## Logout Workflow

1. The user clicks **Sign Out** in the sidebar.
2. The client dispatches `logout()` in `authStore.js`.
3. A `POST` request is dispatched to `/api/logout` (enabling backend audits if desired).
4. The client clears `access_token`, `refresh_token`, and `auth_user` from `localStorage`.
5. The global state store resets `user` to `null`, redirecting the interface to `/login`.
