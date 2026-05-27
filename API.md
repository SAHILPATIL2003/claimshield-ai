# ClaimShield AI — API Reference

Base URL: `{BACKEND_URL}/api` (default `http://localhost:5000/api`)

Auth header: `Authorization: Bearer <JWT>`

## Auth `/auth`

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/verify-otp` | — | `{ firebaseToken }` |
| POST | `/demo-login` | — | `{ mobileNumber, role, fullName }` |
| POST | `/set-role` | JWT | `{ role, fullName, hospitalId? }` |
| GET | `/me` | JWT | — |

## Public `/public`

| Method | Path | Auth |
|--------|------|------|
| GET | `/hospitals` | — |

## Records `/records`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/upload` | JWT PATIENT | `multipart/form-data` field `medicalFile` |
| GET | `/my` | JWT PATIENT | — |
| GET | `/timeline` | JWT PATIENT | — |
| GET | `/verify/:id` | JWT | Re-hash + ledger compare |
| GET | `/public/verify/:id` | — | QR public verify |
| GET | `/qr/:id` | JWT | QR payload |
| GET | `/:id` | JWT | Record detail |

## Patients `/patients`

| Method | Path | Auth |
|--------|------|------|
| GET | `/?query=` | JWT DOCTOR/ADMIN |
| GET | `/:id/records` | JWT DOCTOR/ADMIN |
| POST | `/notes` | JWT DOCTOR `{ recordId, note }` |

## Admin `/admin` (ADMIN only)

| Method | Path |
|--------|------|
| GET | `/analytics` |
| GET/PATCH/DELETE | `/users`, `/users/:id` |
| GET | `/fraud` |
| GET | `/blockchain` |
| GET | `/logs` |
| GET/PATCH | `/claims`, `/claims/:id` |
| DELETE | `/records/:id` |
| GET/POST | `/hospitals` |

## Health

`GET /health` — no prefix
