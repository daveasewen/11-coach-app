# Supabase Backend — Progress Tracker

*This file lives on `main` and tracks work happening on the `feature/supabase` branch.*
*Updated at the end of every backend session. Never replaced by the automated roadmap updater.*
*When the branch merges to main, write a full session handover capturing both tracks, then archive this file.*

---

## Current status: NOT STARTED

Branch `feature/supabase` has not been created yet.

---

## Agreed approach

### Architecture
- **Supabase** (Postgres + Auth + JS client via CDN) as the backend
- **Dual-mode storage adapter**: app tries Supabase first, silently falls back to localStorage if unavailable or not logged in — app always works offline
- **Single table pattern**: `(user_id, key, value)` — mirrors the existing namespaced key/value structure so the storage adapter swap is minimal
- **Auth**: email + password. Simple login screen added to JSX. Parent holds the account; child uses the app under the parent's account.
- **API key**: stays in localStorage only — intentionally never goes to the server

### What changes in the codebase
| File | Change |
|------|--------|
| `assemble.js` | Replace `window.storage` localStorage polyfill with Supabase client adapter |
| `11plus-coaching-app.jsx` | Add login screen UI; wire auth state into app init |
| `index.html` | Add Supabase JS CDN script tag |
| Nothing else | All component logic, Leitner, VR, vocab — untouched |

### Data migration
On first Supabase login, the app detects existing localStorage data and migrates it up automatically. localStorage then becomes a local cache/offline fallback.

### Vercel setup
- `main` branch → production URL (Alex's app — never broken)
- `feature/supabase` branch → Vercel preview URL (development + testing)
- Only merge to `main` when fully tested on preview

---

## Work log

*(Add an entry at the end of each backend session)*

---

## Remaining tasks

- [ ] Create `feature/supabase` branch
- [ ] Confirm Vercel preview URL spins up for the branch
- [ ] Set up Supabase project (free tier) — create project, configure auth, create `user_data` table
- [ ] Add Supabase JS client to `index.html` via CDN
- [ ] Write dual-mode `window.storage` adapter in `assemble.js`
- [ ] Add login/signup screen to JSX
- [ ] Wire auth state into app initialisation
- [ ] Implement localStorage → Supabase migration on first login
- [ ] Test: new user signup, data writes, logout, login, data reads
- [ ] Test: offline fallback (Supabase unreachable → app continues on localStorage)
- [ ] Test: Alex's existing localStorage data migrates cleanly
- [ ] Merge to `main` + write full session handover

---

## Key decisions log

| Decision | Rationale | Date |
|---|---|---|
| Dual-mode adapter (Supabase + localStorage fallback) | Zero risk to Alex's daily practice during migration; graceful offline degradation | May 2026 |
| Single `(user_id, key, value)` table | Mirrors existing namespaced key structure — minimal adapter rewrite | May 2026 |
| API key stays in localStorage only | Personal, device-scoped, should never hit a server | May 2026 |
| Docs stay on `main` during feature branch work | Prevents documentation drift; roadmap auto-updater only reads core app handovers | May 2026 |
