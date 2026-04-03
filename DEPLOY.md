# CollabU — Complete Deployment Guide
## Backend → Render | Frontend → Vercel

---

## BEFORE YOU START — Generate Your Secret Keys

Run these commands on your local machine and save the output:

```bash
# 1. Flask SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# 2. JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# 3. ENCRYPTION_KEY (for GitHub PATs)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Keep these values — you will paste them into Render's environment variables.

---

## PART 1 — Deploy the Backend on Render

### Step 1 — Push your code to GitHub

```bash
cd student-collab
git init
git add .
git commit -m "Initial commit — CollabU"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/collabu.git
git push -u origin main
```

### Step 2 — Create a PostgreSQL database on Render

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `collabu-db`
   - Database: `collabu`
   - User: `collabu_user`
   - Region: Choose the one closest to your users
   - Plan: **Free** (sufficient to start)
4. Click **"Create Database"**
5. Wait for it to provision (~1 min), then copy the **"Internal Database URL"** — you'll need it in Step 4.

### Step 3 — Create a Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in:
   - Name: `collabu-backend`
   - Region: **Same region as your database**
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: **Python 3**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT --timeout 120 "app:app"`
   - Plan: **Free**

### Step 4 — Set Environment Variables on Render

In your web service → **"Environment"** tab, add these variables one by one:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | *(paste your generated value from above)* |
| `JWT_SECRET_KEY` | *(paste your generated value from above)* |
| `ENCRYPTION_KEY` | *(paste your generated Fernet key from above)* |
| `DATABASE_URL` | *(paste the Internal Database URL from Step 2)* |
| `ALLOWED_DOMAIN` | `university.edu` *(change to your uni domain)* |
| `FLASK_ENV` | `production` |
| `JWT_EXPIRES_DAYS` | `7` |
| `MAX_UPLOAD_MB` | `50` |
| `FRONTEND_URL` | *(leave blank for now — fill in after Step 7)* |

Click **"Save Changes"** → Render will deploy automatically.

### Step 5 — Verify backend is running

Once deployed (2–3 minutes), open:
```
https://collabu-backend.onrender.com/health
```
You should see: `{"status": "ok", "env": "production"}`

Copy your backend URL — you'll need it for the frontend.

---

## PART 2 — Deploy the Frontend on Vercel

### Step 6 — Install Vercel CLI (optional but easier)

```bash
npm install -g vercel
```

Or use the Vercel dashboard at **https://vercel.com**.

### Step 7 — Deploy to Vercel

**Option A — via CLI:**
```bash
cd student-collab/frontend
vercel
```
Follow the prompts:
- Set up and deploy? **Y**
- Which scope? *(your account)*
- Link to existing project? **N**
- Project name: `collabu-frontend`
- Directory: `./` *(already in frontend folder)*
- Override settings? **N**

**Option B — via Vercel Dashboard:**
1. Go to **https://vercel.com/new**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Framework Preset: **Vite**
5. Click **Deploy**

### Step 8 — Set Environment Variables on Vercel

In your Vercel project → **"Settings"** → **"Environment Variables"**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://collabu-backend.onrender.com` |
| `VITE_SOCKET_URL` | `https://collabu-backend.onrender.com` |

Then go to **"Deployments"** → click **"Redeploy"** (environment variables only take effect on redeploy).

Your frontend URL will be something like: `https://collabu-frontend.vercel.app`

### Step 9 — Connect frontend URL back to backend

1. Go back to **Render** → your web service → **"Environment"**
2. Set `FRONTEND_URL` = `https://collabu-frontend.vercel.app` *(your actual Vercel URL)*
3. Click **"Save Changes"** — Render will redeploy

---

## PART 3 — Final Checks

### Test the full flow:

1. Open your Vercel URL
2. Register with your university email (e.g. `you@university.edu`)
3. Create a project
4. Open a second browser / incognito window, register as another user
5. Request to join the project — owner should see the request appear in real-time
6. Accept the request
7. Go to the Task Board — verify only the owner can create tasks
8. Go to the Chat — send a message, verify it appears in real-time

### Verify uploads work:

1. Go to **Profile** → upload an avatar
2. Go to **Create Project** → upload a cover image
3. In **Chat** → attach a file

---

## PART 4 — Custom Domain (Optional)

### For the frontend (Vercel):
1. Vercel Dashboard → your project → **"Domains"**
2. Click **"Add Domain"** → enter `collabu.youruniversity.edu`
3. Add the DNS records Vercel shows you to your domain registrar
4. Update `FRONTEND_URL` on Render to your custom domain

### For the backend (Render):
1. Render Dashboard → your service → **"Custom Domains"**
2. Click **"Add Custom Domain"** → enter `api.collabu.youruniversity.edu`
3. Add the CNAME record to your domain registrar
4. Update `VITE_API_URL` and `VITE_SOCKET_URL` on Vercel to your custom domain

---

## PART 5 — Keeping Files Persistent on Render (Important)

**The free Render plan has an ephemeral filesystem** — uploaded files (avatars, project covers, chat files) are deleted on every deploy or restart.

To make uploads persistent, you have two options:

### Option A — Upgrade to Render's paid plan + Persistent Disk
1. Render → your service → **"Disks"** → **"Add Disk"**
2. Mount path: `/opt/render/project/src/uploads`
3. Update `UPLOAD_FOLDER=/opt/render/project/src/uploads` in your env vars

### Option B — Use Cloudinary for file storage (recommended for free tier)
This requires adding the `cloudinary` Python package and updating `upload_service.py` to upload to Cloudinary instead of local disk. Ask for this upgrade if you need it.

---

## PART 6 — Local Development (Quick Reference)

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Edit .env with your values
python app.py                 # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
cp .env.example .env.local    # Keep VITE_API_URL empty for local dev
npm run dev                   # Runs on http://localhost:5173
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `SECRET_KEY` missing error on startup | Make sure all 3 secret keys are set in Render env vars |
| CORS errors in browser console | Check `FRONTEND_URL` on Render matches your exact Vercel URL (no trailing slash) |
| WebSocket not connecting | Check `VITE_SOCKET_URL` on Vercel matches your Render backend URL |
| Database connection errors | Make sure `DATABASE_URL` uses `postgresql://` not `postgres://` (Render gives `postgres://` — our code fixes this automatically) |
| Uploads not persisting | See Part 5 above — free Render tier has ephemeral storage |
| GitHub auto-add not working | User must have GitHub username + owner must have a verified PAT in Settings → GitHub |
| `ENCRYPTION_KEY` error | Generate with the Fernet command in "Before You Start" and set in Render env vars |
| Free Render tier sleeps after 15 min | Upgrade to Starter ($7/mo) or use a cron job to ping `/health` every 10 min |
