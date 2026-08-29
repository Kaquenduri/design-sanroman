# Design — Taxi Real San Román

<!-- impeccable:design-schema 1 -->

## Direction

**Profesional sobrio, modo Operate.** Restrained palette, una sola intención: la herramienta desaparece, el trabajo se ve. La marca vive en la precisión, no en la ornamentación. El mundo es el mismo en ambas superficies (web operadora y PWA conductor), pero la densidad y la escala cambian según quién mira y desde dónde.

## Why this direction

Two users, both working, both under real conditions. The operadora sits at a console watching a live fleet for 10-hour shifts; the conductor glances at a phone mounted on a dashboard in bright Andean sun with gloved hands. Neither needs the screen to impress — both need it to be fast, legible, and unambiguous. Decoration competes with attention. Confidence lives in operational clarity, not visual flourishes. The brand speaks like an experienced dispatcher: short, direct, never raising its voice.

## Color strategy

**Restrained** (default for Operate). One accent carries action; everything else carries information.

Dark is the primary ground. Justification: the operadora's shifts span dawn and dusk with mixed indoor lighting, and the conductor's screen competes with bright sun glare — a dark ground with high-contrast foreground improves perceived contrast under both conditions, and it pairs better with the institutional-blue accent without the muddy middle tones a light theme forces. A light theme is not implemented in MVP; if added later, it must preserve the same accent relationships, not just invert the ground.

Every state has icon + text. Color is never the sole signal — a membership block needs the word "Bloqueada" alongside the red, and an active unit needs the dot + the word "Activa" alongside the green.

### Tokens

```
--bg:           #0B1220   /* ground, app canvas */
--surface:      #111827   /* cards, panels */
--surface-2:    #1A2233   /* elevated surfaces, hovered rows */
--surface-3:    #243049   /* dividers, strong borders */
--border:       #2C3A55   /* default border */
--fg:           #E5EAF2   /* primary foreground */
--fg-muted:     #9AA5B5   /* secondary text */
--fg-subtle:    #6B7589   /* tertiary, placeholders */

--accent:       #2563EB   /* institucional blue, primary action */
--accent-fg:    #FFFFFF
--accent-soft:  rgba(37, 99, 235, 0.12) /* tinted backgrounds */

--taxi:         #FACC15   /* taxi yellow, only for operational status of "en servicio" */
--taxi-fg:      #0B1220

--success:      #16A34A
--warning:      #F59E0B
--danger:       #DC2626
--info:         #38BDF8
```

Contrast: `--fg` on `--bg` = 14.6:1. `--fg-muted` on `--bg` = 6.4:1. `--accent` on `--bg` = 6.1:1. All AA + AAA for body.

## Typography

**Inter Variable** as the single workhorse. Free, ships variable axes, excellent at 11px and at 48px, has tabular numerals, and respects OpenType features we actually use. No display face — Inter at 600/700 weight serves the role.

**JetBrains Mono Variable** for any numeric/data where alignment matters: ETAs, placas (license plates), km, montos, IDs. Tabular by default.

### Scale

Mobile (conductor app):
```
--text-xs:   12px / 16px   /* meta, timestamps */
--text-sm:   14px / 20px   /* secondary */
--text-base: 16px / 24px   /* body floor (never below) */
--text-lg:   18px / 26px   /* primary actions labels */
--text-xl:   22px / 28px   /* screen titles */
--text-2xl:  28px / 32px   /* hero numbers (ETA, fare) */
--text-3xl:  40px / 44px   /* big status (only one per screen) */
```

Web (operadora):
```
--text-xs:   11px / 16px
--text-sm:   12px / 18px
--text-base: 13px / 20px
--text-md:   14px / 22px
--text-lg:   16px / 24px
--text-xl:   20px / 28px
--text-2xl:  28px / 34px
--text-3xl:  40px / 44px   /* report KPIs */
```

Body measure 65–75ch on web. Headings balance with `text-wrap: balance`. Numerals are tabular by default (`font-variant-numeric: tabular-nums lining-nums`).

## Spacing & rhythm

4px base. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 56, 80. A `space-above-heading > space-below-heading` rule everywhere. Cards group tightly (12–16px padding inside), separated generously (24–32px between cards).

Container widths on web: max 1440, but the map view expands to fill viewport with side panels (320–360px) anchored left.

## Shape & elevation

Corner radius: 8px for inputs/buttons, 12px for cards, 16px for sheets/modals. No fully-rounded pills except status chips and toggles.

Elevation: subtle. Cards lift with a 1px `--border` plus a soft, low-spread shadow on hover only (`0 6px 16px -8px rgba(0,0,0,0.4)`). No zero-offset colored halos. No glass, no blur as decoration — only as functional blur behind modal sheets.

## Iconography

**Lucide Icons** as the icon library. 1.5px stroke, 20px default on mobile, 16px on web. Outline by default, filled variant reserved for active states. Never mix emoji, unicode glyphs, or raster icons. No icon-as-color-signal without a text label beside it.

## Motion

One authored moment per surface:
- **Conductor app**: incoming-request alert slides up from the bottom as a full-bleed sheet with a brief haptic pattern simulation (visible on screen). All other transitions are 180ms eased-out, no entrance choreography.
- **Operadora web**: when a new request enters the queue, it slides in from the right with a 220ms ease-out and the unit pin on the map pulses once. No other entrance animations. New-data is the only thing that animates; static state does not.

All motion respects `prefers-reduced-motion: reduce` with a hard crossfade fallback.

## Layout primitives

- **Mobile frames**: viewport locked to 390×844 in CSS via max-widths; on viewports >430px the canvas centers inside a "phone frame" (rounded 36px, 12px bezel, drop shadow) on a neutral stage. Touch simulation via pointer events.
- **Web shell**: fixed top bar (56px) + left rail nav (240px) + main canvas. The main canvas is a 3-zone composition on the dispatcher view: side queue (320px) + map (flex) + side detail (340px) when something is selected.
- No fixed pixel positions that fight viewport resize. Web breakpoints: ≥1280 full layout, 1024–1279 collapses right detail, <1024 switches to stacked mode (not a target audience but graceful).

## Surfaces

This design system feeds two surfaces. Each has its own brief and its own decisions on top of this foundation:

- `conductor-app.md` — PWA mobile, mode Operate, hand-glance density.
- `operadora-web.md` — desktop web admin, mode Operate, scanner density.

## Anti-patterns (binding bans)

- No glass / blur as decoration.
- No gradient text.
- No hard-offset block shadows (no `4px 4px 0` neo-brutalism).
- No kicker/eyebrow text above headings.
- No "01 / 02 / 03" section numbers.
- No cards-of-icon-plus-heading-plus-text as the page structure.
- No sparkline, progress ring, or soft-shadowed rectangle standing in for real data.
- No emoji or unicode glyph as iconography.
- No `border-left` colored stripe on cards/alerts; status uses full surface tint instead.
- No modal for tasks that don't need protected focus.
- No mock data labeled as real — every fabricated number is marked synthetic.
