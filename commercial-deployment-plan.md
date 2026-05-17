# Commercial Deployment Plan
## 11+ Coaching App — Route from Prototype to Product

*Written: 17 May 2026 | Based on planning session*

---

## Decisions agreed

- **Target:** Commercial product for the UK 11+ market (Kent/Bexley focus initially)
- **Architecture:** Web-first. App Store deferred until post product-market fit.
- **AI coaching:** Optional feature, off by default. API key prompt triggered by user selecting AI without a key configured. Core practice loop never depends on AI.
- **No deadline constraint:** Deployment is not tied to September 2026 exam cycle.

---

## Phase 0 — Prototype hardening (current app)

Work done in the existing HTML/JSX prototype. These are the changes needed before the prototype is cleanly separable from the commercial build.

1. **Make AI optional.** AI coaching off by default. Key input modal triggered when user selects AI and no key is present. Practice flow must never block on an AI call.
2. **Remove hardcoded API key.** Ensure no key is embedded anywhere in the built file.
3. **Export/import for data portability.** JSON export of all user data (Leitner state, session history, profile). Already partially planned under admin layer — prioritise this so users don't lose data when the backend replaces localStorage.

---

## Phase 1 — Backend foundation

This is the largest architectural step. It replaces localStorage as the persistence layer and adds accounts.

1. **Auth.** User accounts with email/password (and optionally Google OAuth). Supabase Auth or Clerk are the practical choices — both handle the complexity of JWTs, sessions, and password reset out of the box.
2. **Database.** User profiles, Leitner box state, session history, progression data — migrated from localStorage to a server-side store (Postgres via Supabase, or PlanetScale).
3. **API proxy.** A single serverless function (Vercel) that accepts coaching requests from authenticated users and forwards to Anthropic. The Anthropic key lives server-side only. Rate limiting and per-user cost caps go here.
4. **Frontend changes.** Swap localStorage calls for API calls. The component logic doesn't change — just the data layer. This should be relatively contained given the current architecture.

---

## Phase 2 — Payments and compliance

Must be in place before any public distribution.

1. **Stripe integration.** Subscription model (monthly/annual). Web-first payment deliberately avoids Apple's 30% cut. Stripe Checkout handles the payment UI; Stripe webhooks update user entitlements server-side.
2. **Pricing model.** To be decided — options include flat subscription, family plan, or tutor/school tier. Not a technical decision but needs resolving before launch.
3. **Privacy policy.** Required before any public distribution. Must cover data collected, AI usage, and storage.
4. **Under-13 compliance.** The app is used by children under 13. UK GDPR for children and PECR apply. Requirements include: parental consent flow, data minimisation, no advertising, right to erasure. This is non-trivial — factor in time for legal review or using a compliant-by-design auth provider with parental consent support.
5. **Data deletion.** Users (and parents on behalf of children) must be able to delete all their data. Build this into the account settings from the start.

---

## Phase 3 — PWA polish

Converts the web app into something that feels installed on mobile without requiring the App Store.

1. Service worker for offline support (questions and progress work without network).
2. Web app manifest (home screen icon, splash screen, standalone display mode).
3. Install prompt (iOS: "Add to Home Screen" prompt; Android: native install banner).

This phase can run in parallel with Phase 2 — it's frontend-only and doesn't depend on the backend being complete.

---

## Phase 4 — App Store (deferred)

Only after Phase 1–3 are complete and there are paying users.

1. **Capacitor wrapper** — packages the existing web app into a native shell for iOS and Android. Avoids a full React Native rewrite. Gives App Store presence with minimal new code.
2. **Apple Kids category consideration** — if the app targets under-13s it may fall under Apple's Kids category rules (strict content and data handling requirements). The parent-account model (parent holds the account, child uses the app) is the standard approach for navigating this.
3. **React Native rewrite** — only warranted if Capacitor proves limiting (performance, native API access, UX). This is a 6–10 week project and should not be considered until there is clear evidence it's needed.

---

## What this is not a plan for

- The current prototype development (v1.12 soft progression etc.) — that continues on its own track.
- Content expansion (question bank growth, new subjects) — separate from deployment architecture.
- Tutor/school accounts — a future tier, not in scope for v1 commercial launch.

---

*Next step: Phase 0 changes can be incorporated into ongoing prototype development. Phase 1 planning (backend tech stack selection) should happen before any new development that deepens localStorage dependency.*
