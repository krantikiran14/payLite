# PayLite — Payroll Management for Indian Micro-Businesses

A production-ready MVP payroll web app built for businesses with under 10 employees. Handles salary calculations, PF/ESI deductions (Indian compliance), attendance tracking, PDF payslips, and Excel exports.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Angular 18 (standalone, signals)    |
| Backend     | Node.js + Fastify                   |
| Database    | PostgreSQL via Supabase             |
| ORM         | Prisma                              |
| Auth        | Supabase Auth (email/password)      |
| PDF         | pdfmake (server-side)               |
| Excel       | exceljs                             |
| Testing     | Vitest (13 test cases)              |

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account (free tier works) — [supabase.com](https://supabase.com)

## Quick Start

### 1. Clone & Install

```bash
cd paylite
npm install          # root (concurrently)
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **Settings > API** and copy:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings > Database** and copy:
   - Connection string (Transaction pooler, port 6543) → `DATABASE_URL`
   - Connection string (Direct, port 5432) → `DIRECT_URL`

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

Your `backend/.env` should look like:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=your-secret
PORT=3000
COMPANY_NAME=PayLite Demo Company
```

### 4. Push Schema & Seed

```bash
cd backend
npx prisma db push       # creates tables in Supabase
npx prisma generate       # generates Prisma client
npx prisma db seed        # creates demo user + 5 employees + April 2026 data
```

### 5. Run Development Servers

From the project root:
```bash
npm run dev
```

This starts:
- **Backend** at `http://localhost:3000`
- **Frontend** at `http://localhost:4200` (proxies API calls to backend)

### 6. Login

Open `http://localhost:4200` and sign in with:
- **Email:** `demo@paylite.in`
- **Password:** `demo1234`

---

## Project Structure

```
paylite/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth, employees, attendance, bonuses, payroll
│   │   ├── services/
│   │   │   ├── payrollEngine.ts   # ← pure calculation function
│   │   │   ├── pdfService.ts      # payslip PDF generation
│   │   │   └── excelService.ts    # monthly Excel export
│   │   ├── plugins/
│   │   │   ├── auth.ts            # Supabase JWT validation
│   │   │   └── db.ts              # Prisma client singleton
│   │   ├── app.ts                 # Fastify app factory
│   │   └── server.ts              # entry point
│   ├── prisma/
│   │   ├── schema.prisma          # 6 models
│   │   └── seed.ts                # demo data
│   ├── tests/
│   │   └── payrollEngine.test.ts  # 13 test cases
│   └── package.json
├── frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── login/             # email+password auth
│       │   ├── employees/         # CRUD + drawer form
│       │   ├── attendance/        # inline-editable grid + bonuses
│       │   └── payroll/           # dashboard + expandable breakdowns
│       ├── shared/
│       │   ├── services/          # api.service, auth.service
│       │   ├── pipes/             # INR currency pipe
│       │   └── guards/            # auth guard
│       └── app.routes.ts
├── package.json                   # root monorepo scripts
└── README.md
```

## API Endpoints

| Method | Route                          | Description                    |
|--------|--------------------------------|--------------------------------|
| POST   | `/auth/login`                  | Sign in (Supabase Auth)        |
| POST   | `/auth/logout`                 | Sign out                       |
| GET    | `/employees`                   | List employees                 |
| POST   | `/employees`                   | Create employee                |
| PUT    | `/employees/:id`               | Update employee                |
| GET    | `/attendance/:month/:year`     | Monthly attendance grid        |
| POST   | `/attendance`                  | Bulk upsert attendance         |
| GET    | `/bonuses/:month/:year`        | List bonuses for month         |
| POST   | `/bonuses`                     | Create bonus event             |
| DELETE | `/bonuses/:id`                 | Delete bonus event             |
| POST   | `/payroll/run`                 | Run payroll for all employees  |
| GET    | `/payroll/:month/:year`        | Get payroll with breakdowns    |
| GET    | `/payslip/:id/pdf`             | Download payslip PDF           |
| GET    | `/payroll/export/:month/:year` | Download Excel summary         |

## Payroll Calculation Engine

The core `calculatePayroll()` function is a pure function in `backend/src/services/payrollEngine.ts`:

- **Prorated salary** for mid-month joining
- **Overtime:** `(basic / 26 / 8) × hours × 1.5`
- **PF:** `basic × 12%` (if enabled)
- **ESI:** `gross × 0.75%` (if enabled AND gross ≤ ₹21,000)
- **Unpaid leave deduction:** `(basic / 26) × days`
- **Warning flags** for policy violations (e.g., >1 unpaid leave day)

## Running Tests

```bash
cd backend
npx vitest run
```

13 test cases covering:
1. Standard full-month salary
2. Overtime pay calculation
3. Unpaid leave deduction
4. ESI applied when gross ≤ ₹21,000
5. ESI NOT applied when gross > ₹21,000
6. Mid-month joining proration
7. PF disabled employee
8. Multiple bonuses summed
9. Warning flag for unpaid leave > 1
10. No warning for exactly 1 unpaid leave
11. Zero overtime edge case
12. Future joining date (zero payout)
13. Complex scenario with all components

## Deployment

### Backend → Railway

```bash
# From backend/
railway init
railway up
# Set env vars in Railway dashboard
```

### Frontend → Vercel

```bash
# From frontend/
npx vercel --prod
# Set API URL in environment: VITE_API_URL=https://your-railway-app.railway.app
```

Update `frontend/src/app/shared/services/api.service.ts` to use the deployed backend URL in production.

## Color Scheme

| Purpose    | Color     | Hex       |
|------------|-----------|-----------|
| Primary    | Blue      | `#185FA5` |
| Processed  | Green     | `#2E7D32` |
| Pending    | Amber     | `#F9A825` |
| Flagged    | Red       | `#D32F2F` |
| Surface    | White     | `#FFFFFF` |
| Background | Slate     | `#F1F5F9` |

## License

MIT
