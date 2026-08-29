# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

> Two surfaces that genuinely adapt their design language per device class:
> - **Conductor app**: PWA mobile-first (Android-first given the market, but platform-agnostic).
> - **Operadora web**: desktop/tablet web admin.
> Same product, two different clients. Not "adaptive" in the OS-flip sense (iOS/Android UI); this is adaptive because the **primary surface** of the experience changes by user role.

## Users

**Primary user 1 — Conductor (taxista agremiado).**
- Situation: full-time driver in Juliaca, Puno. Spends 8–12 hours/day in a vehicle. Altitude ~3,825 m, cold climate, often gloved. Phone is mounted on the dashboard or in a cradle. Hands often on the wheel or occupied. Eyes rarely on the screen — glances only.
- Job: stay online when willing to accept rides, respond to incoming requests quickly, navigate to passenger, complete the trip, get paid in cash.
- Tech literacy: low to medium. Many are 40+, first smartphone was within the last 5 years.

**Primary user 2 — Operadora (dispatcher).**
- Situation: seated at a desk/console, 6–10 hour shifts, multiple browser tabs, often handling both digital requests and incoming phone calls from passengers who haven't migrated to the app yet.
- Job: monitor live fleet, watch incoming requests, accept/reject, assign manually when the auto-assigner fails, handle the phone-bridge channel.
- Tech literacy: medium. Familiar with web dashboards, Zello, WhatsApp Web.

**Secondary — Pasajero (passenger).** Acknowledged but explicitly **out of MVP scope** for this iteration.

## Product Purpose

Replace Juliaca's analog, operator-mediated, radio-frequency dispatch (Zello + manual call-taking) with a digital, app-driven assignment system that pairs passengers to the nearest available driver in seconds — eliminating the operator as a mandatory intermediary while preserving a phone-bridge fallback for gradual digital adoption.

Success means: every agremiado can earn from the app; every Juliaca resident can get a taxi without a phone call; the Municipality's 2-minute boarding regulation is respected; the operator role shifts from gatekeeper to supervisor.

## Positioning

**Algorithmic direct dispatch at gremial scale.** Not a competitor to Uber/Yango/Didi at national scale, but the **only locally-fit solution** that:
- respects the gremial's fixed-tariff model (no inDrive-style auctions),
- preserves the operator role as a transitional bridge instead of erasing it,
- enforces membership validity as a hard operational gate (a stale membership blocks access, not just flags an account),
- runs on modest infrastructure (PostgreSQL + PostGIS, no NewSQL, no graph DB) sized for 20–30 active units.

## Operating Context

- **City:** Juliaca, San Román province, Puno, Peru. ~3,825 m altitude. Cold climate (especially May–August), bright sunlight, occasional altitude-induced visual fatigue.
- **Regulatory clock:** municipal boarding time capped at 2 minutes on saturated arteries. ETAs must be metrically precise.
- **Payment reality:** cash dominates the southern highlands. Phase 1 is 100% cash; digital rails (Yape/Plin/cards) are a Phase 2 — data model is extensible but UI does not expose them yet.
- **Document regime:** "Boleto físico de transporte urbano" (authorized physical ticket) — no electronic invoice obligation in Phase 1.
- **Compliance (binding):**
  - Ley 29733 + DS 016-2024-JUS: real-time GPS is sensitive personal data. Explicit consent required; breach notification to ANPD within 48h; fines up to 100 UIT (~S/ 550,000 in 2026).
  - PL 842/2021-CR ("Ley Uber"): not yet enacted, but the system is designed anticipating traceability and vehicle-document verification.
- **Connectivity:** variable 4G in the urban core, drops in peripheral zones. Driver app must tolerate intermittent loss gracefully.

## Capabilities and Constraints

### Phase 1 (MVP, in scope for this visual build)
- Driver app: login, membership-status display, online/offline toggle, incoming-request alert (sound + vibration simulated), accept/reject, navigation-to-passenger state, wait-for-passenger state, in-trip state, completion, daily earnings summary.
- Operadora web: live map view with active units, request queue, manual assignment, drivers list with membership status, units list, daily reports (trips, estimated revenue, average ETA).
- All data mocked client-side. No real maps integration. No real GPS. No real backend.
- Cash payment only.
- Spanish (neutral, Peru). No i18n in MVP.

### Phase 2 (explicitly out of MVP)
- Real backend, real PostgreSQL/PostGIS, real OSRM/Nominatim routing.
- Passenger app.
- Digital payments (Yape/Plin/cards).
- Real GPS telemetry from drivers.
- Phone-bridge channel for operator-entered requests.

### Undecided product facts (open)
- Operator ↔ supervisor role split: **undecided**. For MVP mock, both responsibilities live on one screen.
- Membership grace period policy after expiry: **undecided**. MVP shows a hard block on expiry; real policy may include a 24–72h grace.
- Phone-bridge channel UI: **undecided**. Acknowledged in the product doc but not mocked in this iteration.

## Brand Commitments

- **Name:** Taxi Real San Román (fixed; "Real" is part of the gremial's identity).
- **Gremial code:** 32-2020 (referenced in legal/operational copy, not user-facing chrome).
- **Voice:** direct, operational, respectful. No marketing fluff inside the apps. The brand speaks like an experienced dispatcher, not an ad campaign.
- **Identity direction (confirmed by client):** **profesional sobrio** — neutral palette + institutional blue + taxi yellow accent, modern grotesque sans. Trust, clarity, no decoration. No pin of specific fonts/colors yet — to be settled in `new-work`.

## Evidence on Hand

- Operational context document: `contexto/contexto_general_proyecto_Amplio.md` (platform, regulatory, technical scope).
- ERD / data model: `contexto/real-san-roman-erd-modelo-datos.md` (does not yet drive UI copy — not yet mined).
- **Real assets to ship:** none yet. No logo, no brand book, no real driver photos, no real vehicle photos. Use neutral placeholders or generic taxi silhouettes. **Do not fabricate** testimonials, customer counts, exact fares, or licensed images.

## Product Principles

1. **Operate over decorate.** Both users are working. Every pixel earns its place by reducing time-to-decision or preventing error. Brand lives in precision, not in flourishes.
2. **The road is the screen's enemy.** For the driver app, assume the screen is glanced at for 1–2 seconds at a time, often in bright sun. Type is large, contrast is high, hit targets are generous, primary actions are unambiguous.
3. **Membership is operational, not cosmetic.** A stale membership is a hard block, not a warning. The system protects the gremial before it protects the individual driver.
4. **Cash is honest.** Do not surface "Pay with card" affordances in Phase 1 even as disabled placeholders — they create false expectations and complicate compliance posture.
5. **Operator as bridge, not gate.** The web admin gives the operator supervision and override, not veto power. Auto-assignment runs by default; manual intervention is reserved for exceptions.

## Accessibility & Inclusion

- **Driver app:** high contrast required (sunlight at altitude). Large type (≥16pt body, ≥20pt primary actions). Color is never the sole signal — every state has icon + text + (where useful) tactile/haptic pattern. Voice prompts are explicitly out of MVP scope but the UI must not preclude them later.
- **Operadora web:** standard keyboard navigation. Color is not the sole signal for unit/request status (icon + label always accompany). No flashing >3 Hz (epilepsy guideline).
- **Language:** Spanish (Peru). Neutral register. Avoid regional slang in chrome.
- **WCAG target:** 2.1 AA on both surfaces. Concrete compliance verified in audit, not assumed.
