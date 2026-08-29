# Surface Brief — Operadora (Web Admin)

## Scope

The single primary surface for the dispatcher. Desktop/tablet web admin served from the same Next.js app as the conductor PWA but on a different route. Phase 1 of the product.

## Mode

**Operate.** The operadora is supervising a live fleet; the screen is a working console, not a dashboard demo.

## Audience

Operadora seated at a desk. 6–10 hour shifts, multiple browser tabs, often handling digital requests and phone calls simultaneously. Tech literacy medium; familiar with web dashboards, Zello, WhatsApp Web.

## Job

Watch the fleet. See incoming requests the moment they arrive. Let the auto-assigner run; intervene manually when it fails or when a phone call comes in. Monitor membership compliance at a glance. Pull daily numbers when the shift ends.

## Action / task

The atomic loop: **request enters queue → auto-assigned (or picked up manually) → unit moves to pickup → trip starts → trip ends → request resolved**. The operadora supervises; she does not drive the loop.

Secondary loops: triage drivers with stale memberships, audit today's trips, export the daily report.

## Proof / content

Synthetic. ~25 mocked active units (matches the real gremial scale). 5–8 mocked pending requests at any time. Realistic but clearly synthetic data: Juliaca street names, Peruvian-format placas (e.g., "B7X-482"), Peruvian phone formats (+51 9XX XXX XXX), Soles (S/) currency.

## Constraints

- Spanish (Peru, neutral register). Internal copy short and operational.
- Keyboard-first: every action reachable by keyboard; status of units visible without hover (color + icon + label always together).
- High information density without clutter: data-dense but scannable. The map carries spatial truth; the side panels carry tabular truth.
- "Phone-bridge" requests (operator-entered from a phone call) shown with a distinct visual treatment (a small "teléfono" tag in the queue) so the operadora knows which channel entered them.
- No flashy animations; the only motion is new data appearing.
- No external map tile integration — map is a static mocked base of Juliaca (hand-drawn SVG or styled raster) with pins overlaid.

## Chosen direction

Profesional sobrio, dark ground, restrained palette — but with the **scanner density** of a real operations console, not the marketing warmth of a typical SaaS dashboard.

### Main dispatcher view (default)

Three-zone composition filling the viewport:

1. **Top bar (56px)**: brand wordmark "Taxi Real San Román · Despacho", live fleet count, current shift timer, operadora avatar.
2. **Left rail (240px)**: persistent nav — **Despacho** (active), **Conductores**, **Unidades**, **Membresías**, **Reportes**, **Configuración**. Selected item has a 2px accent left bar and elevated surface.
3. **Main canvas**: three side-by-side regions:
   - **Left queue (320px)**: list of pending requests, oldest on top, each card showing pickup address (2 lines), destination, distance, time waiting. Auto-assigned requests show the assigned unit and a "Reasignar" hover action. Phone-bridge requests carry a "Tel" tag.
   - **Center map (flex)**: dark stylized SVG/raster map of central Juliaca, with unit pins color-coded by status (verde activo, amarillo en viaje, gris offline, rojo bloqueo). Selected unit/request highlights its pin with a pulse. Map has minimal controls (zoom +/-, recenter) and a live timestamp.
   - **Right detail (340px)**: contextual panel — when a request is selected, shows passenger info, pickup/destination, the assigned unit's card with member name, placa, distance to pickup. When a unit is selected, shows driver info, today's trips, current trip status.

### Conductores view

Table of all 23+ drivers with: avatar, name, unit (placa), phone, membership status (Activa / Vence pronto / Vencida / Bloqueada), today's trip count, action menu. Search by name/placa. Filter by membership status. Top-right CTA: "+ Agregar conductor" (modal — but Phase 1 has no real persistence; this CTA explains that to the user).

### Unidades view

Table of all units with: número de unidad, placa, marca/modelo, año, assigned conductor, current status, last seen (mocked timestamp).

### Membresías view

Dedicated view of drivers with stale or about-to-expire memberships. Cards in three columns: Vence esta semana, Vence este mes, Vencidas (bloqueadas). Each card has CTA "Notificar al conductor" (mocked action that copies a pre-formatted WhatsApp message to clipboard).

### Reportes view

Today's dashboard: total trips, total revenue (estimated, S/), average ETA, hours online per driver, top 5 drivers by trips. A simple bar chart with sober colors (no gradient, no glow). Below: today's trips table, filterable by driver, exportable as CSV (mocked, downloads a synthetic CSV blob).

### Configuración view

Minimal: tariff rules preview (read-only for MVP — the heuristic engine is out of scope), geofence polygons preview (read-only), shift hours, operadora profile.

## Memorable moment

The dispatcher view, fully loaded. The map pinned with ~25 unit dots, the queue showing 6–8 pending requests, one request highlighted with its unit's pin pulsing on the map. The whole thing reads like a real operations console — sparse, dense, confident.

## Unresolved decisions

- Real-time backend: out of scope. All data is mocked with `setInterval` to simulate live updates (unit movement, new requests arriving, trips resolving).
- Operator ↔ supervisor role split: both live on this surface in MVP.
- Tariff engine UI: out of scope. Heuristic rules are referenced in copy but not editable.
- Phone-bridge entry form: not implemented in MVP; the tag is visible but there's no input UI to create one. Acknowledged as deferred.
