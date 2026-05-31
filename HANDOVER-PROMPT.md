# Handover Prompt — paste this at the start of every new session

---

Read `session-handover-2026-05-30.md` in the 11+ coach app folder before responding.

We're working on an 11+ coaching app (Kent Test / Bexley Selection Test, September 2026). The app is v1.18.0, a single-file React/JSX build hosted on Vercel at `11-coach-app.vercel.app`. GitHub repo: `daveasewen/11-coach-app` (public).

**Stack:** `11plus-coaching-app.jsx` → `node build.js` → babel → terser → `node assemble.js` → `11plus-coach.html`. Always use `./node_modules/.bin/babel`, never `npx babel`. Git email must be `prances_west4b@icloud.com` — do not change.

**Two active tracks:**
- `master` → production (Alex's live app)
- `feature/supabase` → backend work (not started — see `supabase-progress.md`)

This session we need to decide what to work on next. The candidates are:

1. **Soft progression** — mastery-triggered difficulty band unlock (deferred since v1.7, needs design discussion first)
2. **Comprehension/Cloze questions** — biggest exam gap not yet built (59% baseline, +26pp needed)
3. **JSON export/import** — quick data safety net before wider sharing (~1 day)
4. **Supabase backend** — cloud storage + auth (3–4 days, enables multi-device and family sharing)

We have ~3.5 months to the September 2026 exam. Help me think through priorities and then let's get started.

---

*Update this file at the end of every session to point to the latest handover.*
