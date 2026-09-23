<div align="center">

# ATSUp ➟ AI-Powered Resume Analysis & Builder Platform

_Upload your resume → Get ATS score, keyword gaps & Improvement suggestions → Build a ats-winning resume in minutes_

</div>

<p align="center">
  <img src="./frontend/public/atsup_home.png" alt="ATSUp Homepage Preview" width="100%" style="border-radius:12px; border:1px solid #e5e7eb;" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20Prisma%20%7C%20Redis%20%7C%20Gemini%20AI-blue?style=flat-square" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/Auth-Google%20OAuth%20%7C%20JWT-orange?style=flat-square" alt="Auth" />
</p>

---

## 📋 Table of Contents

- [Why ATSUp?](#-why-atsup)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [API Endpoints](#-api-endpoints)
- [System Design](#-system-design)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Why ATSUp?

> **75% of resumes are rejected by ATS before a human ever sees them.**

ATSUp fixes that. Upload any PDF & job description, get an instant **ATS compatibility score (0-100)**, see **missing keywords**, **section-by-section breakdown**, and **Improvement suggestions** tailored to the job description. Build a new ATS-perfect resume and export to **PDF** only for now. You can also rewrite your resume via AI, providing your existing resume PDF and job description.

---

## 🌐 Live Demo

**Try it live ➜ [https://atsup.vercel.app](https://atsup.vercel.app/)**

---

## ✨ Features

### 🎯 ATS Score Analysis

- **0-100 ATS Compatibility Score** based on `resume` and `job description`
- **Check 24 criteria** including contact information, education, experience, skills, formatting, measurable impacts, action verbs etc.
- **Improvement suggestions** for missing, weak, or incomplete sections.
- **History & rescan** where you can track progress over time, rename/delete scans

### 📄 Resume Builder

- Visual builder with **live preview**, drag-and-drop sections based on need
- 100% ATS-friendly reusme format that scored on jobscan
- Export to **PDF** format only for now
- Duplicate, history, and delete-all

### 🧲 Rewrite Resume with AI

- Upload your existing resume and targeted job description to rewrite
- Only rewrite existing information, do not invent anything new
- Review and make changes to the rewritten resume
- Download if everything looks good


### 🔐 Auth & Security

- **JWT access + refresh** with Redis-backed rotation & queue-safe interceptor (`frontend/src/api/api.ts:30`)
- **Google OAuth 2.0** via Passport (`GOOGLE_CALLBACK_URL`)
- Device fingerprinting (`@fingerprintjs`), IP tracking (`cf-connecting-ip` → `x-forwarded-for`), `trust proxy: 1`
- Helmet, CORS, rate-limiting (RedisStore), Zod validation


### 👑 Admin, Support & Analytics

- Admin dashboard — users, payments, support tickets, **reviews moderation** (`toggle-home`)
- Support tickets (`/api/support`) + feedback/reviews (`/api/feedback`, home reviews)
- Visitor tracking via `fingerprint` + `SiteStats` singleton
- Role-based access (`admin` / `user`), ban/active flags

### 🌙 Dark Mode

- Light Mode is enabled by default
- Toggle between Light Mode and Dark Mode

---

## 🖼️ Screenshots

|                                   ATS Scan                                    |                                 Resume Builder                                  |
| :---------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: |
|  <img src="./frontend/public/scan.png" alt="ATS Scan Light" width="100%" />   |  <img src="./frontend/public/builder.png" alt="Builder Light" width="100%" />

---

## 🛠️ Tech Stack

### Frontend — `frontend/`

| Layer         | Tech                                                                   |
| :------------ | :--------------------------------------------------------------------- |
| Framework     | **React 18** + TypeScript + **Vite 5**                                 |
| State & Data  | **Redux Toolkit**, **TanStack Query**, React Router 6                  |
| Styling       | **TailwindCSS 3**, `tailwind-merge`, `clsx`, `tailwindcss-animate`     |
| UI/UX         | **Framer Motion**, `lucide-react`, `react-icons`, `react-toastify`     |
| Editor & DnD  | `react-quill`, `@dnd-kit` (core/sortable)                              |
| Export        | `jspdf` (PDF)
| Auth & Upload | `@fingerprintjs`, `axios` (queued 401 refresh), `react-dropzone`       |
| Validation    | `zod`                                                                  |

### Backend — `backend/`

| Layer         | Tech                                                                              |
| :------------ | :-------------------------------------------------------------------------------- |
| Runtime       | **Node 20** + **Express 4** + TypeScript + `tsx watch` / `esbuild` bundle         |
| Database      | **PostgreSQL (Neon)** + **Prisma 7** (`@prisma/adapter-neon`, `prisma.config.ts`) |
| Auth          | **Passport** (Google OAuth 20 + JWT), `jsonwebtoken`, `bcryptjs`, `cookie-parser` |
| AI            | **Google Gemini** (`@google/genai` + `googleapis`, dual keys with fallback)       |
| Cache & Limit | **ioredis** + `rate-limit-redis` + `express-rate-limit`, `helmet`, `cors`         |
| Files         | `multer`, `pdf-parse`, `uuid`, `dotenv`                                           |
| Validation    | `zod`                                                                             |

### Infra

- **Vercel** (frontend + serverless backend — `backend/vercel.json`, `frontend/vercel.json`)
- **Nginx** (`frontend/nginx.conf` + `Dockerfile`)
- **Redis** (local or managed — `REDIS_URL`)
- **Docker Compose** (template in `docker-compose.yml` — currently commented, see below)

---

## 📁 Project Structure

```
atsup/
├── backend/                          # Express API — src/server.ts:12 (Vercel-aware)
│   ├── prisma/
│   │   ├── schema.prisma             # PostgreSQL + 11 models (User, Resume, Analysis, AtsScore...)
│   │   └── migrations/
│   ├── src/
│   │   ├── server.ts                 # http.createServer + connectDB(), Vercel export
│   │   ├── app.ts                    # Express app, middleware, moduleRoutes, 404/errorHandler
│   │   ├── db/                       # Prisma + Neon connection
│   │   ├── lib/redis.ts              # ioredis client
│   │   ├── modules/                  # Feature modules (routes → controller → service)
│   │   │   ├── index.ts              # moduleRoutes → /api/auth, /api/users, /api/ats-score...
│   │   │   ├── auth/                 # login, register, google OAuth, refresh, logout, /me
│   │   │   ├── ats-score-check/      # parse-resume, parse-jd, analyze, rescan, history
│   │   │   ├── resume-builder/       # /resumes CRUD, /parse, /ai-rewrite, /content, duplicate
│   │   │   ├── admin-dashboard/      # admin stats, reviews moderation
│   │   │   ├── users/                # profile, credits, free-credits-status
│   │   │   ├── support/              # tickets
│   │   │   ├── feedback/             # reviews / home reviews
│   │   │   └── visitor/              # fingerprint tracking + SiteStats
│   │   ├── shared/
│   │   │   ├── ai/ { gemini/, cache/ }  # Gemini prompts, caching (PROMPT_VERSION, AI_CACHE_TTL)
│   │   │   ├── config/ { env.ts, passport.ts }
│   │   │   ├── middlewares/ { middlewareConfig.ts, auth.ts, errorHandler.ts }
│   │   │   ├── resume-parser/        # pdf-parse helpers
│   │   │   ├── scoring/              # ATS algorithm: constants, formatting, keywords, skills...
│   │   │   ├── skills/skillNormalizer.ts
│   │   │   └── utils/ { credits.ts, tokenService.ts, deviceCheck.ts }
│   │   └── generated/prisma/         # Prisma client output
│   ├── Dockerfile
│   ├── prisma.config.ts
│   └── package.json                  # dev: tsx watch, build: esbuild bundle
│
├── frontend/                         # React SPA — Vite + Redux + Tailwind
│   ├── src/
│   │   ├── api/api.ts                # axios + queued 401 refresh interceptor
│   │   ├── App.tsx                   # Routes, Private/Public guards, OAuth redirect
│   │   ├── pages/ { HomePage, Login, AtsScan, AtsScanDetail, ScanHistory, ResumeBuilder... }
│   │   ├── components/ + animations/ + hooks/ (useVisitorTracking)
│   │   ├── store/ (Redux slices) + types/ + utils/authGuard
│   │   └── main.tsx
│   ├── public/ { atsup_home.png, scan.png, scanDark.png, builder.png, builderDark.png }
│   ├── vite.config.ts                # dev proxy /api → localhost:5000, port 3000
│   ├── tailwind.config.js + index.css + nginx.conf
│   └── package.json
│
├── docker-compose.yml                # Template (Postgres + pgAdmin + backend + frontend) — uncomment to use
├── systemdesign.md                   # Architecture deep-dive & roadmap
└── README.md                         # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (backend `esbuild --target=node20`)
- **PostgreSQL** — Neon cloud (recommended) or local Postgres 16
- **Redis** — local (`redis://localhost:6379`) or managed (Upstash/Redis Cloud)
- **Google Cloud** — Gemini API key + OAuth 2.0 credentials

### 1. Clone

```bash
git clone <repository-url>
cd atsup
```

### 2. Install

```bash
# Backend
cd backend && npm install
# Frontend
cd ../frontend && npm install
```

### 3. Environment Variables

Create **`backend/.env`** (see `backend/src/shared/config/env.ts:29`):

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
REDIS_URL=redis://localhost:6379
PROMPT_VERSION=v1
AI_CACHE_TTL=86400
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_SECONDARY=your_secondary_key_optional
```

Create **`frontend/.env`**:

```env
VITE_API_URL=/api
# or for direct backend: VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

> **Tip:** `frontend/vite.config.ts:15` already proxies `/api` → `http://localhost:5000` in dev, so `VITE_API_URL=/api` works out of the box.

### 4. Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev   # or prisma db push for quick sync
```

---

## ▶️ Running the App

### Local Dev (recommended)

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev        # tsx watch src/server.ts

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm run dev        # vite — proxies /api to backend
```

Health check: `GET http://localhost:5000/health` → `{"status":"OK","message":"ATSUp is healthy"}`

### Production Build

```bash
# Backend — esbuild bundle → dist/server.js
cd backend && npm run build && npm start

# Frontend — tsc + vite build
cd frontend && npm run build && npm run start   # vite preview
```

### Docker (optional)

`docker-compose.yml` is currently commented as a template. To use:

1. Uncomment services (`postgres`, `pgadmin`, `backend`, `frontend`)
2. Create root `.env` with `ROOT_USERNAME`, `ROOT_PASSWORD`, `DATABASE_NAME`, `DATABASE_URL`
3. Run:

```bash
docker compose up -d --build
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000` (or `VITE_API_URL`). All routes prefixed via `backend/src/modules/index.ts:10`.

### Auth — `/api/auth`

| Method | Endpoint                    | Description                                                 |
| :----- | :-------------------------- | :---------------------------------------------------------- |
| POST   | `/api/auth/register`        | Register (email, password, name)                            |
| POST   | `/api/auth/login`           | Login → access + refresh tokens                             |
| GET    | `/api/auth/me`              | Current user (Bearer access)                                |
| POST   | `/api/auth/refresh`         | Refresh tokens (Bearer refresh) — queued + deduped          |
| POST   | `/api/auth/logout`          | Logout (Bearer refresh)                                     |
| GET    | `/api/auth/google`          | Google OAuth start                                          |
| GET    | `/api/auth/google/callback` | OAuth callback → redirect to `FRONTEND_URL/?accessToken...` |

### ATS Score — `/api/ats-score` (`atsScoreCheck.routes`)

| Method | Endpoint                              | Description                                                                                                 |
| :----- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------- |
| POST   | `/api/ats-score/parse-resume`         | Upload PDF (`multipart/form-data`) → parsed content                                                         |
| POST   | `/api/ats-score/parse-jd`             | `{ description }` → structured JD                                                                           |
| POST   | `/api/ats-score/analyze`              | `{ resumeName, jobDescription?, structuredJD?, aiResearch?, originalPdf? }` → full ATS + job-match analysis |
| POST   | `/api/ats-score/rescan/:id`           | Rescan existing history entry                                                                               |
| GET    | `/api/ats-score/history?page=&limit=` | Paginated history (default 3)                                                                               |
| GET    | `/api/ats-score/history/:id`          | Single scan detail                                                                                          |
| PUT    | `/api/ats-score/history/:id/rename`   | Rename `resumeName`                                                                                         |
| DELETE | `/api/ats-score/history/:id`          | Delete one                                                                                                  |
| DELETE | `/api/ats-score/history`              | Delete all                                                                                                  |

### Resumes — `/api/resumes` (`resumeBuilder.routes`)

| Method | Endpoint                                | Description                                   |
| :----- | :-------------------------------------- | :-------------------------------------------- |
| GET    | `/api/resumes?page=&limit=&sourceType=` | List (`uploaded` \| `builder`)                |
| GET    | `/api/resumes/:id`                      | Get one                                       |
| POST   | `/api/resumes`                          | Upload resume (`multipart/form-data`)         |
| POST   | `/api/resumes/parse`                    | Parse PDF only                                |
| POST   | `/api/resumes/ai-rewrite`               | `{ resumeText, jobDescription }` → AI rewrite |
| POST   | `/api/resumes/content`                  | Create from `ResumeContent` JSON              |
| PUT    | `/api/resumes/:id`                      | Update                                        |
| POST   | `/api/resumes/:id/duplicate`            | Duplicate                                     |
| DELETE | `/api/resumes/:id`                      | Delete one                                    |
| DELETE | `/api/resumes/delete-all`               | Delete all                                    |

### Users — `/api/users`

| Method | Endpoint                         | Description             |
| :----- | :------------------------------- | :---------------------- |
| GET    | `/api/users/profile`             | Get profile             |
| PUT    | `/api/users/profile`             | Update profile          |
| DELETE | `/api/users/account`             | Delete account          |
| POST   | `/api/users/use-credit`          | Consume 1 credit        |
| POST   | `/api/users/add-free-credits`    | Claim free credits      |
| GET    | `/api/users/free-credits-status` | Free credit eligibility |

### Support / Feedback / Visitor / Admin

| Method | Endpoint                                       | Description                              |
| :----- | :--------------------------------------------- | :--------------------------------------- |
| POST   | `/api/support`                                 | Create ticket `{ type, title, message }` |
| GET    | `/api/support/mine`                            | My tickets                               |
| POST   | `/api/feedback`                                | Submit review `{ rating, message }`      |
| GET    | `/api/feedback/home`                           | Home-page reviews (`showOnHome=true`)    |
| GET    | `/api/admin-dashboard/reviews`                 | [Admin] All reviews                      |
| PATCH  | `/api/admin-dashboard/reviews/:id/toggle-home` | [Admin] Toggle home visibility           |
| DELETE | `/api/admin-dashboard/reviews/:id`             | [Admin] Delete                           |
| DELETE | `/api/admin-dashboard/reviews`                 | [Admin] Delete all                       |
| \*     | `/api/visitor/*`                               | Fingerprint tracking                     |
| \*     | `/api/admin-dashboard/*`                       | Admin stats & management                 |
| GET    | `/`, `/health`                                 | Welcome + health check (`src/app.ts:17`) |

> Auth: `Authorization: Bearer <accessToken>` — refresh via `Authorization: Bearer <refreshToken>` on `/auth/refresh` & `/auth/logout`. Frontend `api.ts:44` handles auto-refresh with request queue.

---

## ☁️ Deployment

- **Vercel** — both `backend/vercel.json` and `frontend/vercel.json` configured. Backend exports `app` for serverless (`src/server.ts:7`), only listens locally when `VERCEL!=1`.
- **Env on Vercel:** set all `backend/.env` vars in Vercel dashboard. Ensure `DATABASE_URL` (Neon pooled), `REDIS_URL` (managed), `FRONTEND_URL` (your Vercel frontend URL), `GOOGLE_CALLBACK_URL` (Vercel backend URL + `/api/auth/google/callback`).
- **Frontend:** `VITE_API_URL` should point to deployed backend (or use relative `/api` with Vercel rewrites).

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/name`
3. Commit: `git commit -m 'feat: add ...'`
4. Push: `git push origin feature/name`
5. Open a Pull Request

Please run `npm run build` in both workspaces before PR and keep Prisma migrations in sync.

---

<div align="center">

**Built with ❤️ for job seekers everywhere**

_If ATSUp helped you land an interview, leave a ⭐ and a review — it fuels the project!_
