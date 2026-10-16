# AI Resume Analyzer

Full-stack web app that analyzes PDF resumes and returns an ATS score, detailed breakdowns, and improvement suggestions. Analysis combines a deterministic local ATS engine with an AI ensemble (Google Gemini, OpenAI, Anthropic, and Groq) so reviews work even with just one API key.

## Features

- Register / login with JWT authentication
- Upload a PDF resume and get:
  - Overall ATS score with category breakdown (keywords, sections, skills)
  - Matched and missing skills
  - Section-by-section feedback
  - AI-generated summary, strengths, weaknesses, formatting issues, and suggestions
- Job description matching (keyword match %, matched/missing JD keywords)
- Dashboard with resume analysis history
- Optional password reset flow via email (SMTP), or on-screen fallback
- Exportable report (PDF) via the UI

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js, JWT, Multer (PDF uploads), pdf-parse, Nodemailer
- **Database:** SQLite via sql.js (file-based, no separate DB server required)
- **AI:** Gemini / OpenAI / Anthropic / Groq — enable whichever you have keys for

## Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── config/          # SQLite (sql.js) DB setup + migrations
│   ├── controllers/     # Auth & resume logic
│   ├── middleware/      # JWT auth middleware, error handler
│   ├── routes/          # /api/auth and /api/resumes routes
│   ├── services/        # ATS engine, AI providers (gemini, openai, anthropic, groq)
│   ├── server.js        # Express entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # ResumeReport, Confetti, ErrorBoundary
│   │   ├── context/     # AuthContext (bearer-token auth)
│   │   ├── pages/       # Home, Login, Register, Dashboard
│   │   └── services/    # Axios API client
│   ├── vite.config.js   # Dev proxy /api -> localhost:5000
│   └── .env.example
└── README.md
```

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login (returns JWT) |
| POST | /api/auth/forgot-password | No | Request a password reset code |
| POST | /api/auth/reset-password | No | Reset password with code |
| GET | /api/auth/profile | Yes | Get user profile |
| POST | /api/resumes/upload | Yes | Upload & analyze a resume (PDF) |
| GET | /api/resumes | Yes | List user's resumes |
| GET | /api/resumes/:id | Yes | Get a resume analysis by ID |
| DELETE | /api/resumes/:id | Yes | Delete a resume |

## Setup Instructions

### Prerequisites

- Node.js v18+
- At least one AI provider API key (e.g., a free Groq key from [console.groq.com](https://console.groq.com), or Gemini/OpenAI/Anthropic)

### 1. Backend

```bash
cd ai-resume-analyzer/backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
JWT_SECRET=some-long-random-string
GROQ_API_KEY=your_api_key        # or GEMINI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY
# Optional SMTP settings to email password-reset links
```

The SQLite database is created automatically on first run.

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd ai-resume-analyzer/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:3000` (Vite proxies `/api` to the backend).

### 3. Using the App

1. Open `http://localhost:3000`
2. Register an account
3. Upload a PDF resume (optionally paste a job description to match against)
4. View the ATS score, breakdowns, and improvement suggestions
5. Reopen previous analyses from the dashboard history

## Notes

- Deployed frontend + backend are supported: the API uses bearer-token auth and an optional `CLIENT_URL` origin allow-list in `backend/.env`.
- If SMTP is not configured, password reset codes are shown on-screen instead of being emailed.
