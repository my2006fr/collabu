# CollabU v2 — Student Collaboration Platform

A university-only platform where students create projects, find collaborators,
manage Kanban task boards, track GitHub contributions, and configure their profiles.

---

## 📁 Full Folder Structure

```
student-collab/
├── backend/
│   ├── models/
│   │   ├── __init__.py          # SQLAlchemy db instance
│   │   ├── user.py              # User (avatar, theme, github, skills…)
│   │   ├── project.py           # Project (cover image, repo name, status)
│   │   ├── collaboration.py     # Join requests + skill matching + github_added
│   │   ├── task.py              # Task (status, priority, assignee, due date)
│   │   └── task_comment.py      # Comments + threaded replies
│   ├── routes/
│   │   ├── auth.py              # POST /register  POST /login
│   │   ├── users.py             # GET/PATCH /profile  POST /profile/avatar  /password
│   │   ├── projects.py          # CRUD /projects  /join  /accept  /cover
│   │   ├── tasks.py             # CRUD /projects/:id/tasks  comments  suggest-assignees
│   │   └── github.py            # OAuth  /github/stats  /github/progress
│   ├── services/
│   │   ├── auth_service.py      # bcrypt hashing, email domain check, skill matching
│   │   ├── github_service.py    # GitHub REST API (add collab, contributors, commits)
│   │   ├── project_service.py   # URL validation, methodology → board columns
│   │   └── upload_service.py    # Avatar resize (Pillow), file type handling
│   ├── uploads/                 # Created automatically at runtime
│   │   ├── avatars/
│   │   └── projects/
│   ├── app.py                   # Flask factory
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Sticky nav, theme toggle, avatar, logout
    │   │   ├── Spinner.jsx       # Loading spinner
    │   │   ├── Modal.jsx         # Reusable modal (Esc to close)
    │   │   ├── FormComponents.jsx # Input, Button, Alert, Badge, Avatar, Select…
    │   │   └── SkillBadges.jsx   # Skill chips with match highlighting
    │   ├── pages/
    │   │   ├── Login.jsx         # Login form
    │   │   ├── Register.jsx      # Register form (skills + level)
    │   │   ├── Dashboard.jsx     # Project grid + search + filter tabs
    │   │   ├── CreateProject.jsx # Create project + cover image upload
    │   │   ├── ProjectDetail.jsx # Overview + progress bar + pending requests + GitHub stats
    │   │   ├── TaskBoard.jsx     # Kanban board (drag & drop, create tasks, comments)
    │   │   ├── Profile.jsx       # 4-tab settings (profile, security, github, preferences)
    │   │   └── GithubCallback.jsx# GitHub OAuth popup handler
    │   ├── services/
    │   │   ├── api.js            # All fetch calls (auth, projects, tasks, github)
    │   │   ├── AuthContext.jsx   # Global auth state
    │   │   └── ThemeContext.jsx  # Dark/light theme state + localStorage
    │   ├── App.jsx               # Router + protected routes
    │   ├── main.jsx
    │   └── index.css             # CSS variables (dark+light themes), animations
    ├── index.html
    ├── vite.config.js            # Dev server + proxy for /api and /uploads
    └── package.json
```

---

## ⚙️ Prerequisites

| Tool    | Version  |
|---------|----------|
| Python  | 3.9+     |
| Node.js | 18+      |
| npm     | 9+       |

---

## 🚀 Local Setup — Step by Step

### 1. Backend

```bash
cd student-collab/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

Edit `.env`:
```
SECRET_KEY=any-long-random-string
JWT_SECRET_KEY=another-random-string
ALLOWED_DOMAIN=university.edu        # ← change to your uni domain
DATABASE_URL=sqlite:///student_collab.db
GITHUB_CLIENT_ID=                    # fill in after GitHub OAuth setup below
GITHUB_CLIENT_SECRET=
GITHUB_PAT=                          # Personal Access Token
FRONTEND_URL=http://localhost:5173
UPLOAD_FOLDER=uploads
```

```bash
python app.py
# → Running on http://localhost:5000
```

### 2. Frontend

```bash
cd student-collab/frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 GitHub Setup (Required for GitHub Features)

### Step 1 — Create a GitHub OAuth App

1. Go to **https://github.com/settings/developers**
2. Click **"OAuth Apps" → "New OAuth App"**
3. Fill in:
   - **Application name**: CollabU
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/github/callback`
4. Click **Register application**
5. Copy **Client ID** and generate a **Client Secret**
6. Paste both into your `.env` file

### Step 2 — Create a Personal Access Token (PAT)

This allows CollabU to auto-add accepted collaborators to GitHub repos.

1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token (classic)"**
3. Select scopes: ✅ `repo` ✅ `admin:org` (for org repos)
4. Copy the token → paste as `GITHUB_PAT=` in `.env`

> ⚠️ The PAT must belong to an account that **owns or has admin access** to the project repos.

### Step 3 — Set Repo Name on Projects

When creating a project with URL `https://github.com/alice/my-project`,
CollabU auto-extracts `alice/my-project` as the repo name. When a collaborator
is accepted and has a GitHub username saved in their profile, CollabU calls:
```
PUT /repos/alice/my-project/collaborators/their-username
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| POST   | /api/register     | Register (uni email only)|
| POST   | /api/login        | Login → JWT token        |

### Users
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| GET    | /api/profile            | Get current user          |
| PATCH  | /api/profile            | Update name/bio/skills/…  |
| POST   | /api/profile/avatar     | Upload avatar image       |
| POST   | /api/profile/password   | Change password           |
| GET    | /api/users/:id          | Get any user              |

### Projects
| Method | Endpoint                      | Description                      |
|--------|-------------------------------|----------------------------------|
| GET    | /api/projects                 | List all projects                |
| POST   | /api/projects                 | Create project                   |
| GET    | /api/projects/:id             | Project detail + columns         |
| PATCH  | /api/projects/:id             | Update project (owner only)      |
| POST   | /api/projects/:id/cover       | Upload cover image               |
| POST   | /api/projects/:id/join        | Request to join (skill-matched)  |
| POST   | /api/projects/:id/accept      | Accept or reject request         |

### Tasks
| Method | Endpoint                                    | Description                       |
|--------|---------------------------------------------|-----------------------------------|
| GET    | /api/projects/:pid/tasks                    | Get all tasks (members only)      |
| POST   | /api/projects/:pid/tasks                    | Create task                       |
| PATCH  | /api/projects/:pid/tasks/:tid               | Update task / move column         |
| DELETE | /api/projects/:pid/tasks/:tid               | Delete task                       |
| POST   | /api/projects/:pid/tasks/suggest-assignees  | Skill-based assignee suggestions  |
| GET    | /api/projects/:pid/tasks/:tid/comments      | List comments + replies           |
| POST   | /api/projects/:pid/tasks/:tid/comments      | Add comment or reply              |
| DELETE | /api/projects/:pid/tasks/comments/:cid      | Delete comment                    |

### GitHub
| Method | Endpoint                         | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | /api/github/oauth/url            | Get GitHub OAuth authorization URL|
| POST   | /api/github/oauth/callback       | Exchange code → token + username |
| GET    | /api/projects/:pid/github/stats  | Contributors + weekly commits    |
| GET    | /api/projects/:pid/github/progress | Task completion stats           |

---

## 🎯 Feature Summary

### ✅ Authentication
- University-only email signup (`@university.edu` — configurable)
- JWT-based auth stored in localStorage
- bcrypt password hashing

### ✅ Profile
- Avatar upload (resized to 256×256 via Pillow)
- Edit name, bio, skills, experience level
- Change password
- Theme toggle (dark/light, persisted)
- Language preference
- GitHub OAuth connect or manual username entry

### ✅ Projects
- Create with title, description, skills, GitHub URL, methodology
- Cover image upload
- View all projects with search + filter (All / Mine / Joined)
- Project progress bar (based on task completion)
- Skill-match display when browsing (your skills highlighted)

### ✅ Collaboration
- Students request to join → skill overlap is computed and shown to owner
- Owner reviews pending requests with matched skills highlighted
- Accept → GitHub auto-add attempted via PAT
- Reject → request closed
- Accepted collaborators shown with GitHub ✓ badge

### ✅ Task Board (Kanban)
- Columns auto-generated from methodology:
  - **Scrum**: Backlog → Sprint → In Progress → Review → Done
  - **Kanban**: Backlog → To Do → In Progress → Done
  - **Agile**: Backlog → To Do → In Progress → Review → Done
  - **Waterfall**: Requirements → Design → Implementation → Testing → Deployment
  - **XP / Lean / Other**: simplified columns
- Drag & drop tasks between columns
- Task cards: title, priority badge, due date, assignee avatar, comment count
- Create tasks with: title, description, priority, due date, required skill, assignee
- Skill-based assignee suggestions (members with matching skills shown first)
- Quick status move buttons inside task detail
- Delete tasks (owner or creator)

### ✅ Task Comments
- Add comments on any task
- Reply to a specific comment (threaded)
- Delete your own comments
- Author avatar + timestamp shown

### ✅ GitHub Integration
- Contributor leaderboard with commit counts and % bars
- Weekly commit activity chart (last 12 weeks)
- Repo info (stars, forks, issues, language)
- Auto-add collaborator on accept via GitHub REST API

---

## 🚢 Deployment Notes

### Backend (Render / Railway / Fly.io)
1. Replace SQLite with PostgreSQL in `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@host/dbname
   pip install psycopg2-binary
   ```
2. Use gunicorn:
   ```bash
   pip install gunicorn
   gunicorn "app:create_app()"
   ```
3. Set all env vars on your platform dashboard
4. Update `FRONTEND_URL` to your deployed frontend URL
5. Update GitHub OAuth callback URL in your GitHub App settings

### Frontend (Vercel / Netlify)
1. Build: `npm run build` → deploy `dist/`
2. Set env var: `VITE_API_URL=https://your-backend.com`
3. Update `vite.config.js` or use env var in `api.js` for production base URL


### Test it live ⚡✅↗
| Name    |   URL                      |
|---------|----------------------------|
| CollabU | https://collabu.vercel.app/|
