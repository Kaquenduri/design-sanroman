# Surface Brief — Conductor (PWA mobile)

## Scope

The single primary surface for the driver. A PWA mobile-first delivered at 390×844, framed inside a phone shell when opened on desktop. Phase 1 of the product.

## Mode

**Operate.** The driver is working — every screen is a job, not a destination.

## Audience

Taxista agremiado in Juliaca. 8–12 hour shifts in a vehicle, often gloved, often in bright Andean sun. Phone mounted on dash or in cradle. Eyes glance for 1–2 seconds at a time. Tech literacy low–medium; many 40+, recent smartphone adopters.

## Job

Earn. Stay online when willing. Accept incoming requests in seconds. Navigate to passenger. Complete trip. Get paid in cash. The app exists to remove friction from that loop — nothing else.

## Action / task

The atomic loop is: **request arrives → accept → navigate to passenger → wait (≤2 min) → start trip → finish trip → receive cash → next request**. Every screen serves one of these moments. Idle states (online waiting) and off-duty states (offline, daily summary) bracket the loop.

## Proof / content

Synthetic. Mock data only. Three or four recurring synthetic drivers/passengers/units to make screens feel populated without fabricating real commercial claims. All fares, ETAs, and identifiers are clearly illustrative.

## Constraints

- Spanish (Peru, neutral register). No marketing copy inside the app.
- High contrast (sunlight at altitude). Type floor 16px body, 22px primary action labels.
- One-thumb reachability for primary actions; critical "Aceptar" reachable from the right thumb's natural arc.
- States always carry icon + text. Color is reinforcement, never the signal.
- Connectivity tolerance: every screen has an "offline-tolerant" graceful state — even though the mock never actually loses connection.
- Phase 1 cash only. No card / Yape / Plin affordances anywhere, even as disabled placeholders.
- Membership block is a hard screen, not a banner — a stale membership blocks access to online mode.

## Chosen direction

Profesional sobrio, dark ground, restrained palette. Concrete instantiations:

- **Home (offline)**: tall primary toggle to go online. Earnings of the day visible at the top. Membership status badge always present and tappable.
- **Online (idle)**: large status ("En línea — esperando solicitud"), earnings counter, big ETA placeholder, one CTA "Desconectarme". Bottom: nav to resumen and perfil.
- **Incoming request**: full-bleed sheet from the bottom. Passenger name, pickup distance & ETA, destination preview (first 2 lines of address), tariff preview ("S/ 8.50 estimado"). Two primary buttons: **Aceptar** (large, accent, right thumb) / **Rechazar** (outline, left thumb). Auto-decline timer visible.
- **Heading to passenger**: map (mocked static base with a moving animated pin), passenger card pinned to top with call/message icons, primary action "Ya llegué" at the bottom.
- **Waiting**: countdown timer (2:00 max, ticking). "Llamar al pasajero" + "Cancelar viaje" actions.
- **In trip**: map with route drawn (mocked polyline), destination ETA, fare running counter, primary "Finalizar viaje".
- **Trip finished**: confirmation, fare collected in cash, optional 5-star rating placeholder (passenger app is out of MVP but the UI hook is here as "Calificar pasajero" with rating grid).
- **Resumen del día**: trip count, total earned, average ETA, hours online. List of today's trips with origin/destination/fare.
- **Perfil**: photo placeholder, name, unit (placa + número), membership status with expiry, "Cerrar sesión".

## Memorable moment

The incoming-request screen is the brand's signature: it commits to the product's promise — fast, clear, no negotiation. The sheet rises full-bleed, the action is unmissable, the timer is honest, the fare is upfront.

## Unresolved decisions

- Phone-bridge calls inside the app: out of MVP scope. CTAs to "Llamar" use `tel:` hrefs to the device dialer.
- Voice prompts: not implemented, but the UI does not preclude future voice/TTS layers (status messages use simple, speakable sentences).
- Real GPS background: out of scope; the mocked map shows a "fit to trip" view that animates deterministically.
