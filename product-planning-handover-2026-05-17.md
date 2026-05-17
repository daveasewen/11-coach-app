# Product Planning Handover — 17 May 2026
## Route to Product: App Stores & Deployment

---

## What this document is for

This is a briefing for a separate planning conversation — not a development session. The goal is to think through how to take the 11+ coaching app from its current form (a self-contained HTML file) to a deployable product, potentially on the App Store and/or Google Play.

Start that conversation by pasting this document in and saying: *"I want to plan the route from our current HTML prototype to a real deployable app. Help me think through the options, tradeoffs, and what decisions I need to make."*

---

## Current technical state

The app is a **single self-contained HTML file** (`11plus-coach.html`), ~2MB, built from:
- JSX source (`11plus-coaching-app.jsx`) compiled via Babel + Terser
- Bundled React 18.3.1 UMD
- Bundled Claude API calls (Anthropic SDK) for AI coaching
- All data (731-word vocab bank, question generators) embedded in the file
- No backend, no server, no database — all state lives in `localStorage`

The build pipeline is: JSX → Babel → Terser → `assemble.js` → single HTML file.

The app is currently used by one student (Alex, age 10) daily. A parent dashboard and student-facing coach are both in the same file.

**Version at time of writing: v1.11.0.** v1.12 (soft progression) is in development.

---

## Key features that affect deployment decisions

1. **AI coaching calls** — the app calls the Anthropic Claude API for per-question coaching feedback. This requires an API key. Currently the key is embedded in the HTML (acceptable for personal use, unacceptable for distribution).

2. **LocalStorage persistence** — all user data (Leitner boxes, session history, profile, progression state) lives in browser localStorage. No server. This means data is tied to the browser/device.

3. **Student + parent modes** — the app has two distinct UIs (student practice and parent dashboard) in one file.

4. **Content** — 731-word vocab bank + 10 VR question types. All embedded. No CDN or external content dependency (except Claude API).

5. **Single user per profile currently** — profiles are device-local. No account system, no sync.

---

## Deployment options to evaluate

### Option A: Progressive Web App (PWA)
Take the existing HTML file and wrap it as an installable PWA. Add a service worker for offline support, a web app manifest for home-screen install. Deployable to any static host (Vercel, Netlify, Cloudflare Pages).

**Pros:** Fastest path from current state; no app store; works on iOS and Android; offline capable; no platform fees; updates instantly.

**Cons:** No App Store presence; iOS PWA has restrictions (limited background sync, no push notifications without workarounds); localStorage still device-bound; API key still needs solving.

**Effort:** Low-medium. Service worker + manifest + static hosting = 1–2 days.

### Option B: React Native / Expo
Rewrite the frontend in React Native (Expo). Gives true native iOS and Android apps, submittable to both App Stores.

**Pros:** Native performance; App Store distribution; push notifications; proper offline storage (AsyncStorage or SQLite); can sync to a backend later.

**Cons:** Significant rewrite — the current JSX is browser React, not React Native. All UI components need rebuilding. Expo makes it easier but it's still a substantial project. App Store review process (especially Apple) can be slow and unpredictable for education apps.

**Effort:** High. 4–8 weeks minimum for a feature-equivalent rewrite.

### Option C: Capacitor (or Cordova) wrapper
Wrap the existing HTML/React app in a native shell using Capacitor (Ionic). This lets you submit the existing web app to the App Store with minimal code changes.

**Pros:** Reuses almost all existing code; gets native app packaging; App Store submittable; access to native APIs (storage, notifications) via plugins.

**Cons:** Not truly native; Apple has rejected "web wrapper" apps that don't add enough native value; requires Mac + Xcode for iOS builds; still need to solve the API key problem.

**Effort:** Medium. Capacitor setup + App Store account setup = 1–2 weeks.

### Option D: Web app with proper backend
Build a lightweight backend (auth, user data, API key proxy). Deploy as a web app. No native apps initially — focus on getting the product right before app store complexity.

**Pros:** Solves the API key problem cleanly (key lives on server, never in client); enables multi-device sync; enables multi-child profiles; enables tutor accounts; sets up for future monetisation. Can still add PWA on top.

**Cons:** More infrastructure. Needs a server (or serverless functions). Adds cost and complexity.

**Effort:** Medium-high for the backend, but the frontend changes are minimal.

---

## Key questions to resolve in the planning chat

### 1. What is the intended audience and distribution model?
- **Personal use only** (Alex + Layla) — no distribution needed, PWA is fine
- **Share with other 11+ families** — App Store or web app needed; need to think about pricing
- **Build a product for wider market** — requires proper backend, accounts, pricing model, app store presence

### 2. API key problem
Any distribution beyond personal use requires a backend API proxy. The current Claude API key embedded in the HTML is a security risk at scale. Options:
- Serverless function (Vercel/Netlify) that proxies Claude API calls
- Full backend with auth
- Use a different AI provider that has a client-safe key model

### 3. Data portability / sync
Currently localStorage = data is trapped on one device. If Alex switches device or clears browser, all Leitner progress is lost. For any real distribution this needs solving. Options:
- Export/import JSON (simple, already partially planned in admin layer)
- Cloud sync (needs backend + auth)
- iCloud sync (iOS only, via Capacitor plugin)

### 4. Monetisation (if distributing)
- Free for personal use, paid for schools/tutors?
- Subscription (monthly/annual)?
- One-time purchase?
- Freemium (core free, advanced features paid)?
- Apple takes 30% on App Store purchases

### 5. App Store considerations
- Apple Education category has specific requirements
- Apps for under-13s must comply with COPPA (US) and UK GDPR/PECR for children
- Apple requires privacy policy, data handling disclosure
- Google Play is generally easier to publish on than Apple

### 6. Fastest path to "shareable with other families"
If the goal is to share with a small group of 11+ families this summer (before September exams), the fastest path is probably: PWA + Vercel deployment + serverless API proxy for the Claude key. No app store, no rewrite, sharable via URL within days.

---

## The product opportunity (context)

The 11+ tutoring market is large — approximately 750,000 children sit 11+ exams in the UK annually. Current digital tools (Atom Learning, CGP, Bond) are generic and not adaptive. This app's differentiators:

- Real adaptive difficulty (soft progression, not just static bands)
- AI coaching per question (not just right/wrong)
- Timed mode integrated with coaching (addresses the biggest systemic failure mode)
- Bexley-specific verbal weighting awareness
- Parent/tutor dashboard with actionable data

A focused, well-designed product for Kent/Bexley families (or 11+ families broadly) has genuine market potential, particularly in the June–August window when preparation intensity peaks.

---

## Suggested planning agenda

1. Clarify the intended audience and timeline (personal → small group → public product)
2. Decide on the API key architecture (this unlocks or blocks everything else)
3. Pick a deployment path (PWA vs native wrapper vs full rewrite)
4. Define what "v1.0 product" looks like (minimum viable for sharing outside the family)
5. Discuss App Store strategy if relevant (timing, category, compliance)
6. Sketch a rough product roadmap from current state to distributable

---

*Handover written: 17 May 2026*
*App version at time of writing: v1.11.0*
*Next development session: v1.12 soft progression (see session-handover-2026-05-17.md)*
