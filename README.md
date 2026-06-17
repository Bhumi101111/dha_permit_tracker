# eVisa Application Tracker

A full-stack eVisa application status tracker. **No database** — all applicant data
is read from a local Excel file into server memory at startup and refreshed every
60 seconds. OTPs are delivered by email (Nodemailer), and paid-tier searches go
through Stripe Checkout (test mode).

```
evisa-tracker/
├── client/            React + Tailwind (Vite)
│   └── src/
│       ├── pages/       EmailPage, OtpPage, SearchPage, PaymentPage, ConfirmPage, ResultsPage
│       ├── components/  OtpInput, PassportRow, StatusBadge, OrderSummary
│       ├── hooks/       useAuth.js
│       └── App.jsx
├── server/            Node.js + Express
│   ├── routes/          auth.js, search.js, payment.js
│   ├── services/        otpService.js, excelService.js, emailService.js
│   ├── middleware/      authMiddleware.js
│   ├── scripts/         generateExcel.js  (sample data generator)
│   └── server.js
├── data/
│   └── applications.xlsx   (generated sample, 20 rows + free_users sheet)
├── .env.example
└── README.md
```

---

## 1. Setup

### Prerequisites
- Node.js 18+ (uses `node --watch` and native ESM)

### Install dependencies

```powershell
# from the project root
cd server
npm install

cd ../client
npm install
```

### Configure environment variables

Copy `.env.example` to `server/.env` and fill in your values:

```powershell
cd ..
Copy-Item .env.example server/.env
```

> If you leave the `SMTP_*` values blank, OTP and receipt emails are **printed to
> the server console** instead of being sent — convenient for local testing.

| Variable | Purpose |
|---|---|
| `SMTP_HOST/PORT/USER/PASS/FROM` | Nodemailer SMTP credentials |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe test keys |
| `JWT_SECRET` | Secret used to sign 1-hour JWTs |
| `CLIENT_URL` | Frontend origin (default `http://localhost:5173`) |
| `SERVER_URL` | Public URL of the server, used for Stripe `success_url` |
| `SEARCH_RATE_EUR` | Flat search fee (default `2.50`) |

---

## 2. The Excel data file

The server reads `data/applications.xlsx` with two sheets:

**Sheet 1 — `applications`**

| passport_number | applicant_name | visa_type | status | decision_date |
|---|---|---|---|---|

`status` must be one of: `approved`, `processing`, `pending`, `rejected`.

**Sheet 2 — `free_users`**

| email |
|---|

Emails listed here are treated as **free tier**; everyone else is **paid tier**.

### Generate / regenerate the sample file

A sample file with 20 applications (covering all 4 statuses) and 3 free-tier
emails is created by:

```powershell
cd server
npm run seed
```

### Use your own data
Replace `data/applications.xlsx` with your own file using the same column
headers and sheet names. **No restart needed** — the server reloads the file
every 60 seconds.

Sample free-tier emails in the generated file:
- `free.user@example.com`
- `demo@evisa.example`
- `tester@gov.example`

---

## 3. Run in dev mode

Open two terminals.

**Terminal 1 — backend** (http://localhost:4000):

```powershell
cd server
npm run seed   # first time only, to create the sample Excel
npm run dev
```

**Terminal 2 — frontend** (http://localhost:5173):

```powershell
cd client
npm run dev
```

Vite proxies `/auth`, `/data` and `/payment` to the backend, so no extra config
is needed. Open http://localhost:5173.

---

## 4. Stripe test mode

Use your Stripe **test** keys in `server/.env`. On the hosted checkout page use
the standard test cards:

| Card number | Result |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

Use any **future** expiry date (e.g. `12/34`), any 3-digit CVV, and any postal code.

> The in-app card form (cardholder name / number / expiry / CVV) is shown for
> UX realism only — the real charge happens on Stripe's hosted Checkout page, so
> raw card data is never sent to this server.

---

## 5. User flow

1. **Email** → backend checks the `free_users` sheet, returns tier, emails a 6-digit OTP.
2. **OTP** → 6-box input with 60-second countdown + resend; verifies and returns a 1-hour JWT (held in React memory only).
3. **Search** → Single or Bulk (max 10) passport numbers. Free tier searches immediately; paid tier sees a flat **€2.50** order summary and proceeds to payment.
4. **Payment** (paid only) → creates a Stripe Checkout session and redirects to Stripe.
5. **Confirmation** → after Stripe success, shows transaction ID + amount + email; a receipt email is sent.
6. **Results** → status table with colored badges (Approved / In progress / Awaiting docs / Rejected), "Not found" rows, plus client-side **Export CSV** and **Print**.

---

## 6. API reference

| Method | Path | Auth | Body / Query | Returns |
|---|---|---|---|---|
| POST | `/auth/send-otp` | — | `{ email }` | `{ tier, email }` |
| POST | `/auth/verify-otp` | — | `{ email, otp }` | `{ token, tier }` |
| GET | `/data/search` | Bearer | `?passports=GB123,GB456` | `{ tier, count, results[] }` |
| POST | `/payment/create-checkout` | Bearer | `{ passports[] }` | `{ url, sessionId }` |
| GET | `/payment/success` | — | `?session_id=xxx` | redirect to client |
| GET | `/payment/status` | — | `?session_id=xxx` | `{ paid, transactionId, amount, email, passports, token }` |

All `/data` and `/payment` (except the Stripe redirect handlers) routes require a
valid `Authorization: Bearer <jwt>` header. The tier is read directly from the
JWT — there is no database lookup.

---

## 7. Free deployment with CI/CD (Render + GitHub Actions)

This repository includes:

- CI workflow: `.github/workflows/ci.yml`
- CD workflow: `.github/workflows/cd-render.yml`
- Render blueprint: `render.yaml`

### One-time setup

1. Push this repo to your own GitHub account.
2. In Render, create a new **Blueprint** service from this GitHub repo.
3. Confirm the free plan and keep `render.yaml` defaults.
4. In Render service settings, copy a **Deploy Hook** URL.
5. In GitHub, open repository **Settings → Secrets and variables → Actions**.
6. Add a repository secret named `RENDER_DEPLOY_HOOK_URL` with that deploy hook URL.
7. Add your runtime env vars in Render (`SMTP_*`, `STRIPE_*`, etc.).

### Pipeline behavior

1. On every push/PR, CI installs dependencies, builds the React app, and validates server seed generation.
2. On pushes to `main`, CD triggers Render via deploy hook.
3. Render builds and starts the app using:
  - `buildCommand: npm run build`
  - `startCommand: npm start`

### Recommended branch flow

1. Create feature branch.
2. Open PR and wait for CI to pass.
3. Merge into `main`.
4. CD deploys automatically to the free Render URL.

---

## Notes
- All state (OTP store, Excel data, Stripe session records) lives **in memory** in
  the server process and is lost on restart.
- The JWT lives only in React state — not `localStorage`. Because the Stripe
  redirect leaves the SPA, a fresh short-lived token is minted by
  `/payment/status` once payment is verified so results can be fetched.
