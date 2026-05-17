# Handover Prompt — paste this at the start of every new session

---

Read `session-handover-2026-05-17f.md` in the 11+ coach app folder before doing anything else. That is the current state of the project.

**Project**: 11+ coaching app (Kent/Bexley). Single-file React/JSX app assembled into `11plus-coach.html`. Current version: v1.15.0.

**Stack**: `11plus-coaching-app.jsx` → `node build.js` → babel → terser → `node assemble.js` → `11plus-coach.html`. Always use `./node_modules/.bin/babel`, never `npx babel`.

**Modes**: Student-facing practice (vocab + VR sessions) + parent/coach analytics dashboard. AI coaching is optional and off by default.

---

*This file is updated at the end of every session to point to the latest handover.*
