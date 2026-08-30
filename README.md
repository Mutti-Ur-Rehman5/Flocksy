# Flocksy

Flocksy is a full-stack social platform with separate **Adult**, **Kids**, and **Admin** modes.

## Tech Stack

- **Frontend:** React 18 + Vite 7, Redux Toolkit, Socket.IO client, Tailwind CSS
- **Backend:** Node.js + Express 5, Socket.IO, Mongoose (MongoDB Atlas), JWT auth, Cloudinary, Gemini AI
- **Kids mode:** AI chat (FlockChat + Flocksy Assist), quizzes, games, stories, drawing, leaderboard & rewards

## Project Structure

```
backend/    Express API + Socket.IO server (port 8000)
frontend/   React SPA (Vite, port 5173)
```

## Getting Started

1. Install dependencies:
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Configure env vars (copy `backend/.env.example` to `backend/.env` and fill in values — Mongo URI, JWT secret, Cloudinary, Gemini key, etc.).
3. Start the backend (auto-reloads on changes):
   ```
   cd backend && npm run dev
   ```
4. Start the frontend:
   ```
   cd frontend && npm run dev
   ```
5. Open `http://localhost:5173`.

## Scripts

- `backend` — `npm run dev` (nodemon), `npm run seed:admin` (create admin + default kid badges)
- `frontend` — `npm run dev` (Vite), `npm run build`

## Accounts / Modes

- Adult and kid sign-ups are separate; the app splits into Adults, Kids, and Admin areas by role.
- Default admin seeded via `npm run seed:admin` using `ADMIN_*` values in `backend/.env`.

## Notes

- `backend/.env` is git-ignored (never commit real secrets).
