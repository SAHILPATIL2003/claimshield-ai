# ClaimShield AI 🛡️

AI-enabled Healthcare Record Verification and Insurance Fraud Prevention platform. Designed using a hybrid centralized database structure combined with a lightweight permissioned blockchain ledger.

---

## Technical Stack Overview

### Frontend
- **Next.js 15** (App Router, Server components)
- **React & TypeScript**
- **TailwindCSS & Framer Motion** (Animations & dark mode design system)
- **Zustand** (Auth session management state store)
- **Recharts** (Admin analytical dashboards)
- **QRCode.react** (Provider QR validations badges)

### Backend
- **Node.js + Express.js**
- **Prisma ORM + PostgreSQL**
- **Firebase Admin SDK** (Mobile phone OTP verification)
- **Supabase Storage SDK** (File upload repository)
- **Tesseract.js** (OCR content translation engine)
- **Crypto (SHA-256)** (Decentralized block transaction calculations)
- **JWT** (Token auth session configurations)

---

## Core System Architecture

```
                               ┌─────────────────────────┐
                               │   Next.js 15 Frontend   │
                               └────────────┬────────────┘
                                            │ JWT Auth
                                            ▼
                               ┌─────────────────────────┐
                               │   Express.js API Node   │
                               └────────────┬────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
      ┌─────────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
      │  Supabase Cloud Storage │ │    PostgreSQL     │ │ Blockchain Simulation │
      │     (Medical Files)     │ │ (Metadata + logs) │ │   (Immutable ledger)  │
      └─────────────────────────┘ └───────────────────┘ └───────────────────────┘
```

1. **Patient Upload**: Document uploads are hashed (SHA-256), files are uploaded to Supabase Storage, and metadata is saved to PostgreSQL.
2. **Blockchain Ledger Anchor**: The file hash is mined into a blockchain block sequence with a proof-of-work Nonce, referencing the previous block's hash.
3. **Auditor checks**: If database data is modified later, current file hashes mismatch blockchain transaction ledger entries, raising visual red flags.

---

## API Endpoints Reference

### Authentication Routing (`/api/auth`)
- `POST /verify-otp`: Verifies Firebase mobile token, logins/creates user, issues JWT.
- `POST /demo-login`: Dev bypass. Autogenerates JWT matching database seeds.
- `POST /set-role`: Set user roles (PATIENT / DOCTOR / ADMIN) and names on first log-in.
- `GET /me`: Returns current user session profiles.

### Medical Files Routing (`/api/records`)
- `POST /upload`: multers image/pdf, generates SHA-256 hash, processes OCR and AI summary, mines blockchain block, writes DB log. (Patient access).
- `GET /my`: Returns patient's own records history list.
- `GET /timeline`: Returns chronological patient list.
- `GET /verify/:id`: Compares current file hash with blockchain ledger and reports tampering warnings.
- `GET /qr/:id`: Generates data codes pointing to public verifiers.
- `GET/:id`: Details selector lookup.

### Patient Lookup Routing (`/api/patients`)
- `GET /?query=...`: Searches registry database matching PATIENT roles. (Doctor/Admin access).
- `GET /:id/records`: Returns patient's clinical reports list. (Doctor/Admin access).
- `POST /notes`: Doctor appends observation records.

### Admin Operations Routing (`/api/admin`)
- `GET /analytics`: Monthly frequency trends, fraud risk divisions, count totals.
- `GET /users`: CRUD user list views.
- `PATCH /users/:id`: Edits name, role activation, hospital.
- `DELETE /users/:id`: Deletes account from postgres.
- `GET /fraud`: Filter list containing all flagged records (Risk score >= 60).
- `GET /blockchain`: Blockchain ledger explorer showing full chained block logs.
- `GET /logs`: Shell trace terminal log.
- `GET /claims`: Review filed claims.
- `PATCH /claims/:id`: Approve/Reject claim billing payouts.
- `DELETE /records/:id`: Errata database deletion (deletion transaction added to ledger).
- `GET /hospitals`: Provider list.
- `POST /hospitals`: Add clinic profiles.

---

## Setup & Running Locally

Ensure **Node.js (v18+)** and **PostgreSQL** are installed.

### 1. Database Setup
Configure environment variables:
Copy `backend/.env.example` to `backend/.env` and edit your `DATABASE_URL`.
```bash
# Generate Prisma Client classes
cd backend
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed databases with realistic healthcare dummy data
npm run seed
```

### 2. Launch Backend Server
```bash
# Install dependencies
npm install

# Start Express hot-reload server (Running on Port 5000)
npm run dev
```

### 3. Launch Frontend App
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```
```bash
cd ../frontend

# Install dependencies
npm install

# Launch Next.js dev server (Running on Port 3000)
npm run dev
```

### 4. Docker Deployment
Launch database and backend server containers:
```bash
docker-compose up --build
```
This launches PostgreSQL (5432), API (5000), and frontend (3000).

### 5. Production Deploy

| Layer | Target | Config |
|-------|--------|--------|
| Frontend | Vercel | `frontend/` — set `NEXT_PUBLIC_BACKEND_URL` |
| API | Render | `render.yaml` — link `DATABASE_URL`, Firebase, Supabase |
| DB | Supabase Postgres | `DATABASE_URL` in backend env |
| Storage | Supabase bucket `medical-records` | `SUPABASE_SERVICE_ROLE_KEY` |

See [API.md](./API.md) for endpoint reference.

### Demo Accounts (after `npm run seed`)

| Role | Mobile |
|------|--------|
| Patient | +919999999991 |
| Doctor | +919999999981 |
| Admin | +919999999900 |
