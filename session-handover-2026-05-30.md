# Session Handover — 30 May 2026 (Planning & Infrastructure)

## Project

11+ coaching app for Kent Test and Bexley Selection Test (exam: September 2026).
Single-file React/JSX app. Student-facing practice + parent/coach analytics dashboard.

**Stack:** `11plus-coaching-app.jsx` → `node build.js` → babel → terser → `node assemble.js` → `11plus-coach.html`
**Always use** `./node_modules/.bin/babel`, never `npx babel`.

---

## Current version: v1.18.0 — 759 KB (no code changes this session)

---

## What happened this session

This was a **planning and infrastructure session** — no app features were built. Key outcomes:

### 1. Roadmap updated to v1.18.0
`11plus-roadmap.md` rewritten to reflect current state: full version history (v1.3–v1.18), accurate feature inventory, Supabase promoted from "future" to active workstream. Automated roadmap updater scheduled task created (`update-11plus-roadmap` in sidebar) — run it after each core app session handover.

### 2. Dual-track workflow established
Two parallel development tracks now running:

| Track | Branch | Purpose | Documentation |
|---|---|---|---|
| Core app | `master` | Features, content, UX — what Alex uses | Normal session handovers + roadmap auto-update |
| Backend | `feature/supabase` | Supabase storage migration | `supabase-progress.md` only — no handovers until merge |

**Rule:** After a backend session, update `supabase-progress.md` on master. Don't write a core app handover. Full handover on merge day only.

### 3. Vercel deployment fixed — fully working

Long debugging session. Root causes found and resolved:

- **Old blocked GitHub account:** Dave had an original `davidasewen@gmail.com` GitHub account that was blocked. Created a new account (`daveasewen`) with `prances_west4b@icloud.com` as primary email. Git config was still pointing at the old blocked email.
- **Wrong Vercel account:** Vercel was set up under Apple ID (`prances_west4b@icloud.com`) not GitHub OAuth — GitHub commits weren't recognised as the project owner.
- **Private repo:** Vercel Hobby plan blocks preview branch deployments from private repos.

**Fixes applied:**
- New Vercel account created, logged in via GitHub OAuth (`daveasewen`) — project recreated under this account
- Git config email set to `prances_west4b@icloud.com` (primary email of current GitHub account)
- GitHub repo made **public** (required for Hobby preview deployments)
- Vercel Authentication (Deployment Protection) turned OFF

**Current state:**
- `master` → Ready → production URL → Alex's app ✅
- `feature/supabase` → Ready → preview URL → backend sandbox ✅

**Future:** Go Vercel Pro before making repo private (when commercialising). Hobby + private repo = preview branches blocked.

### 4. Git config — IMPORTANT
Git global email is now `prances_west4b@icloud.com`. This must match the primary email of the `daveasewen` GitHub account. Do not change it back to `davidasewen@gmail.com`.

### 5. Ideas stored for later
- **Vocab knowledge graph** — graph-structured word network (roots, clusters, confusable pairs) for smarter AI coaching. App-level data structure, not a graph DB. Revisit after Supabase migration.

---

## Vercel account details (for reference)

- **Vercel account:** GitHub OAuth, `daveasewen`
- **Production URL:** `11-coach-app.vercel.app`
- **Preview URL (feature/supabase):** `11-coach-jx5ss7823-dave-ewen-s-projects.vercel.app` (or similar)
- **Repo:** `github.com/daveasewen/11-coach-app` (public)

---

## Deferred / next up

### Core app (master branch)
- **Soft progression** — mastery-triggered next-band unlock (deferred since v1.7 — discuss before next sprint)
- **Comprehension/Cloze questions** — highest exam-impact gap not yet built (59% baseline, +26pp needed)
- **JSON export/import** — data safety net, one day's work
- **Aid-usage progression gates** — data captured, logic not enforced
- **NVR questions** — August 2026 review point

### Backend track (feature/supabase branch) — NOT STARTED
See `supabase-progress.md` for full task list and architecture decisions. Summary:
- Supabase (Postgres + Auth + JS client via CDN)
- Dual-mode storage adapter (Supabase first, localStorage fallback)
- Single `(user_id, key, value)` table
- Login/signup screen added to JSX
- Estimate: 3–4 days focused work

---

## Key implementation notes

- VERSION constant at top of JSX — bump for every shipped change
- `buildVRQueue` pulls from Leitner boxes + fills with due/new questions
- `generateVRByType(type, maxDiff)` is the single dispatch for all generated types
- Babel "deoptimised styling" warning on build = normal (file >500 KB), not an error
- Dave commits to GitHub manually — never run git commands; provide a commit summary instead
- Always use `./node_modules/.bin/babel`, never `npx babel`
- Git email must be `prances_west4b@icloud.com` — do not change
- Repo is public — will go private when commercial (after Vercel Pro upgrade)
