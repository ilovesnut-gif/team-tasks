# 아키텍처 — team-tasks

```
           ┌──────────────────────────────────────────────┐
Browser ──▶│  Vercel  ·  Next.js  (Front + API Routes)   │──▶ Google OAuth
           └───────────────────────┬──────────────────────┘
                                   │
                        Supabase  (Postgres + Auth)
```
