# RapidResQ Backend — Integration Testing Specification

**Document type:** Integration test design (API-level)  
**System under test:** RapidResQ Express API (`backend/`)  
**Local base URL:** `http://localhost:5000` (default `PORT` from `server.js`; override with `.env`)

**Routing note:** On Vercel, paths may normalize with an `/api` prefix. The **local** server mounts routes under **`/api/...`** as below. Community endpoints exist at **`/api/posts...`** and **`/api/community/posts...`** (same behaviour).

---

## Table of Contents

1. [Scope and assumptions](#1-scope-and-assumptions)
2. [Endpoint specifications](#2-endpoint-specifications)
3. [Master test cases table](#3-master-test-cases-table)
4. [Authentication flow](#6-authentication-flow-as-implemented)
5. [API chaining](#7-api-chaining-adjusted-to-actual-behaviour)
6. [Test coverage](#8-test-coverage-summary)
7. [Global error responses](#9-global-error-responses)
8. [Prerequisites](#10-prerequisites-for-local-integration-test-run)

---

## 1. Scope and assumptions

| Item | Detail |
|------|--------|
| Database | MongoDB (Atlas) via Mongoose; `MONGO_URI` required for data routes except `/api/health` |
| Content type | JSON for bodies; use `Content-Type: application/json` where a body is sent |
| CORS | Enabled; browser clients may send `OPTIONS` preflight |
| Auth | No server-side JWT/session middleware in this codebase; see [Section 6](#6-authentication-flow-as-implemented) |

---

## 2. Endpoint specifications

---

### 2.1 Health check

#### Endpoint details

| Field | Value |
|--------|--------|
| **HTTP method** | `GET` |
| **Route** | `/api/health` |
| **Description** | Verifies API process and routing; does **not** connect to MongoDB. |
| **Authentication required** | **No** |

#### Request

| Headers | Example |
|---------|---------|
| Optional | `Accept: application/json` |

**Body:** none.

#### Response

**Success — `200 OK`**

```json
{
  "ok": true,
  "service": "rapidresq-api"
}
```

#### Postman

| Field | Value |
|--------|--------|
| **Method & URL** | `GET http://localhost:5000/api/health` |
| **Headers** | *(none required)* |

**Tests (Scripts → Tests):**

```javascript
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Body has ok and service", () => {
  const j = pm.response.json();
  pm.expect(j.ok).to.be.true;
  pm.expect(j.service).to.eql("rapidresq-api");
});
```

---

### 2.2 User signup

#### Endpoint details

| Field | Value |
|--------|--------|
| **HTTP method** | `POST` |
| **Route** | `/api/signup` |
| **Description** | Registers a user; hashes password (`bcryptjs`); rejects duplicates. |
| **Authentication required** | **No** |

#### Request

| Headers | Example |
|---------|---------|
| Required for JSON | `Content-Type: application/json` |

**Example JSON body:**

```json
{
  "fullName": "Test User",
  "username": "testuser001",
  "email": "testuser001@example.com",
  "password": "Str0ngPass",
  "phone": "+92-300-1234567",
  "location": "Islamabad",
  "age": 21,
  "gender": "Male",
  "bloodGroup": "O+",
  "skills": ["First Aid"],
  "otherSkill": null
}
```

**Validation:** full name, username, email, password, phone, location; age optional (13–120 if present).  
**Password rules:** length 8–50; at least one uppercase, one lowercase, one digit.

#### Response

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "username": "testuser001",
    "email": "testuser001@example.com",
    "fullName": "Test User",
    "timestamp": "2026-05-02T12:00:00.000Z"
  }
}
```

**Errors (representative)**

| Status | Condition |
|--------|-----------|
| `400` | Validation failed — `errors` array |
| `409` | Duplicate email/username |
| `409` | Mongo duplicate key (`11000`) |
| `503` | Mongo unavailable — `code: mongo_unavailable` |
| `500` | Unexpected server error |

#### Postman

| Field | Value |
|--------|--------|
| **Method & URL** | `POST http://localhost:5000/api/signup` |
| **Headers** | `Content-Type: application/json` |
| **Body** | raw JSON (see above) |

**Tests:**

```javascript
pm.test("Status 201 or error branch", () => {
  pm.expect(pm.response.code).to.be.oneOf([201, 400, 409, 503, 500]);
});
if (pm.response.code === 201) {
  const j = pm.response.json();
  pm.test("Signup success shape", () => {
    pm.expect(j.success).to.be.true;
    pm.expect(j.data).to.have.keys("username", "email", "fullName", "timestamp");
  });
} else {
  pm.test("Error has success false", () => {
    pm.expect(pm.response.json().success).to.be.false;
  });
}
```

---

### 2.3 User login

#### Endpoint details

| Field | Value |
|--------|--------|
| **HTTP method** | `POST` |
| **Route** | `/api/login` |
| **Description** | Authenticates by username **or email** plus password; optional login audit depending on env. |
| **Authentication required** | **No** |

#### Request

**Headers:** `Content-Type: application/json`

```json
{
  "username": "testuser001",
  "password": "Str0ngPass"
}
```

#### Response

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "username": "testuser001",
    "email": "testuser001@example.com",
    "fullName": "Test User",
    "timestamp": "2026-05-02T12:05:00.000Z"
  }
}
```

**Errors:** `400` validation; `401` invalid credentials; `503` mongo; `500`

#### Postman

`POST http://localhost:5000/api/login`

**Tests:**

```javascript
pm.test("Status in allowed set", () => {
  pm.expect(pm.response.code).to.be.oneOf([200, 400, 401, 503, 500]);
});
if (pm.response.code === 200) {
  const j = pm.response.json();
  pm.test("Login returns user fields", () => {
    pm.expect(j.data).to.include.keys("username", "email", "fullName");
  });
}
```

---

### 2.4 Get user profile

| Field | Value |
|--------|--------|
| **Method** | `GET` |
| **Route** | `/api/profile/:username` |
| **Auth** | **No** |

**Success `200`:** `{ "success": true, "message": "...", "data": { ...no password... } }`  
**Errors:** `404`, `500`

**Postman:** `GET http://localhost:5000/api/profile/testuser001`

```javascript
pm.test("Status 200 or 404", () => {
  pm.expect(pm.response.code).to.be.oneOf([200, 404]);
});
if (pm.response.code === 200) {
  pm.expect(pm.response.json().data).to.not.have.property("password");
}
```

---

### 2.5 Update user profile

| Field | Value |
|--------|--------|
| **Method** | `PUT` |
| **Route** | `/api/profile/:username` |
| **Auth** | **No** |

Body strips `password`, `username`, `_id` server-side.

**Postman:** `PUT http://localhost:5000/api/profile/testuser001` + JSON partial fields.

---

### 2.6 Emergency nearby

| Field | Value |
|--------|--------|
| **Method** | `GET` |
| **Route** | `/api/emergency/nearby` |
| **Query** | `lat`, `lon` (required); `radius` optional (default 25000 m, clamped 500–50000) |
| **Auth** | **No** |

**Example:** `GET http://localhost:5000/api/emergency/nearby?lat=33.6844&lon=73.0479&radius=25000`

**Success `200`:** `{ "success": true, "hospitals": [], "emergencyServices": [], "radius": ..., "dataSource": "...", "location": { "lat", "lon" } }`  
**Error `400`:** invalid coordinates.

---

### 2.7 Crisis chat (Groq)

| Field | Value |
|--------|--------|
| **Method** | `POST` |
| **Route** | `/api/chat` |
| **Auth** | **No** |

```json
{
  "message": "I feel anxious",
  "userId": "user-session-001"
}
```

**Success `200`:** `{ "success": true, "reply": "..." }`  
**Errors:** `400` missing message; `503` no `GROQ_API_KEY`; `500`

---

### 2.8 Clear chat memory

| **GET** | `/api/chat/clear/:userId` | **No** auth |

---

### 2.9 Panic button

| **POST** | `/api/panic` | Body: `{ "username": "..." }` |

Requires user in DB with valid phone + location on profile.

**Success `201`** with `post` summary. **Errors:** `400`, `404`, `500`.

---

### 2.10 Community posts (`/api/posts` or `/api/community/posts`)

| Method | Route | Purpose |
|--------|--------|---------|
| `GET` | `/api/posts` | List/filter posts (query params) |
| `POST` | `/api/posts` | Create post |
| `PATCH` | `/api/posts/:postId/status` | Update status (`username` must match author) |
| `DELETE` | `/api/posts/:postId?username=` | Delete own post |
| `GET` | `/api/posts/:postId` | Single post |
| `PATCH` | `/api/posts/:postId/respond` | Increment response count |

**Auth:** **No** (ownership enforced by comparing `username` in body/query where applicable).

---

## 3. Master test cases table

| Test ID | Scenario | Input | Expected output | Actual output |
|---------|-----------|--------|-----------------|---------------|
| TC-H-01 | Health | `GET /api/health` | `200`, `ok: true` | |
| TC-SU-01 | Signup valid | Valid JSON body | `201`, `data.username` present | |
| TC-SU-02 | Signup weak password | Password no digit | `400`, `errors` array | |
| TC-SU-03 | Signup duplicate email | Same email twice | Second: `409` | |
| TC-LI-01 | Login valid | Correct username/password | `200`, `data.email` | |
| TC-LI-02 | Login wrong password | Bad password | `401` | |
| TC-LI-03 | Login unknown user | Random username | `401` | |
| TC-PR-01 | Profile get exists | Known username | `200`, no `password` in `data` | |
| TC-PR-02 | Profile get missing | Random username | `404` | |
| TC-PR-03 | Profile update | `PUT` partial fields | `200`, persisted fields | |
| TC-EM-01 | Emergency valid coords | lat/lon Islamabad | `200`, arrays + `location` | |
| TC-EM-02 | Emergency invalid | lat=999 | `400` | |
| TC-CH-01 | Chat no key | No `GROQ_API_KEY` | `503` (unless key configured) | |
| TC-CH-02 | Chat missing message | `{}` | `400` | |
| TC-PA-01 | Panic valid user | User with phone+location | `201`, `post.id` | |
| TC-PA-02 | Panic no phone on user | User missing phone | `400`, `missingField: phone` | |
| TC-CO-01 | Create post | Valid body | `201` | |
| TC-CO-02 | List posts default | `GET /api/posts` | `200`, `posts` array | |
| TC-CO-03 | Status update wrong user | `username` ≠ author | `403` | |
| TC-CO-04 | Delete own post | `DELETE` + `?username=` | `200` | |
| TC-CO-05 | Respond increment | `PATCH .../respond` | `200`, `responses` increased | |

---

## 6. Authentication flow (as implemented)

| Topic | Finding in this codebase |
|--------|---------------------------|
| **JWT generation** | **Not implemented.** `JWT_SECRET` in `env.example` is not used by route handlers reviewed. |
| **Login response** | Returns user fields (`username`, `email`, `fullName`, `timestamp`) only — **no Bearer token**. |
| **Protected routes** | **None** require `Authorization: Bearer`. |

**Note for reports:** Identify this as client-stored identity; not OAuth2/JWT bearer security without further middleware.

---

## 7. API chaining (adjusted to actual behaviour)

1. `POST /api/signup` → store `username` from `data`.
2. `POST /api/login` → verify same user.
3. `GET /api/profile/:username` → read profile.
4. `PUT /api/profile/:username` → update (e.g. volunteer flag for panic emails).
5. `POST /api/panic` with `{ "username" }`.
6. Community flows using `author` / `username` matching stored identity.

**Postman snippet (save username after login):**

```javascript
const j = pm.response.json();
if (j.data && j.data.username) {
  pm.collectionVariables.set("username", j.data.username);
}
```

Use: `http://localhost:5000/api/profile/{{username}}`

---

## 8. Test coverage summary

| Category | Examples |
|----------|----------|
| **Positive** | Health 200; signup 201; login 200; profile 200; emergency 200; posts 200/201; panic 201. |
| **Negative** | Emergency 400; login 401; signup 400/409; profile 404; chat 400/503; panic 400/404; community 400/403/404. |
| **Edge** | Login with email in `username` field; radius clamp; Mongo `503` when DB unreachable; chat memory cleared on cold start (serverless). |

---

## 9. Global error responses

| Status | Typical body |
|--------|----------------|
| `404` | `{"success":false,"message":"Route not found"}` |
| `500` | `{"success":false,"message":"Internal server error",...}` |
| `503` | Mongo-related unavailability (`mongo_unavailable` or similar) |

---

## 10. Prerequisites for local integration test run

| Requirement | Notes |
|--------------|--------|
| MongoDB | Atlas or local; `MONGO_URI` in `backend/.env` |
| Node | `>=18` per `package.json` |
| Start API | e.g. `node backend/server.js` from project root (`RapidResQ-Final`) |
| Groq | Optional; without `GROQ_API_KEY`, `/api/chat` returns `503` |
| Email | Optional for panic (`EMAIL_USER`, `EMAIL_PASSWORD`) |

---

*Fill the **Actual output** column during execution; export Postman results or run Newman for evidence.*
