# White Nights — Frontend

React + Vite chat UI for the White Nights literary AI backend.

## Setup

```bash
cp .env.example .env
# Fill in Supabase URL/anon key and backend URL
npm install
npm run dev
```

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (Auth) |
| `VITE_API_BASE_URL` | Bun backend (default `http://localhost:3000`) |

## Scripts

- `npm run dev` — Vite dev server (`http://localhost:5173`)
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing (redirects to `/chat` when signed in) |
| `/login` | Magic link or email/password auth |
| `/chat` | Empty chat hero |
| `/chat/:id` | Active conversation |
| `/settings` | Account & preferences |

## Backend integration

- **Auth:** Supabase session; JWT sent as `Authorization: Bearer` on API calls
- **Chat:** `POST /chat` with `{ question }` — responses stored in localStorage until `/chats` API exists
- **CORS:** Backend must allow `http://localhost:5173` (configured in `backend/index.ts`)

## Stack

React, TypeScript, Vite, Tailwind CSS, React Router, Supabase Auth, Zustand, Framer Motion, Axios, react-markdown
