# AI Resume Analyzer

Full-stack application that analyzes resumes using Google Gemini AI, providing ATS scores, missing skills, and improvement suggestions.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js, JWT Authentication
- **Database:** MySQL
- **AI:** Google Gemini API
- **File Upload:** Multer (PDF)

## Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Auth & Resume controllers
│   ├── middleware/       # JWT authentication middleware
│   ├── models/          # Database queries (in config/db.js)
│   ├── routes/          # API route definitions
│   ├── uploads/         # Uploaded files (memory storage)
│   ├── .env             # Environment variables
│   ├── server.js        # Express app entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Navbar, ProtectedRoute
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Login, Register, Dashboard
│   │   └── services/    # API service (axios)
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  ats_score INT DEFAULT NULL,
  missing_skills TEXT DEFAULT NULL,
  suggestions TEXT DEFAULT NULL,
  extracted_text LONGTEXT DEFAULT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Routes

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | /api/auth/register    | No   | Register new user        |
| POST   | /api/auth/login       | No   | Login user               |
| GET    | /api/auth/profile     | Yes  | Get user profile         |
| POST   | /api/resumes/upload   | Yes  | Upload & analyze resume  |
| GET    | /api/resumes          | Yes  | List user's resumes      |
| GET    | /api/resumes/:id      | Yes  | Get resume by ID         |
| DELETE | /api/resumes/:id      | Yes  | Delete a resume          |

## Setup Instructions

### Prerequisites

- Node.js v18+
- MySQL server running
- Google Gemini API key

### 1. Database Setup

Create a MySQL database (or let the app auto-create it):

```sql
CREATE DATABASE resume_analyzer;
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env` and update:

```
DB_PASSWORD=your_mysql_password
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key_change_this
```

Start the backend:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

### 4. Using the App

1. Open `http://localhost:3000`
2. Register a new account
3. Upload a PDF resume
4. View ATS score, missing skills, and improvement suggestions
5. Click on previous analyses in the history panel
