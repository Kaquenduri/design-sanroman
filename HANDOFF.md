# HANDOFF — Taxi Real San Román

Documento de contexto para continuar el trabajo en otra sesión o con otro
asistente. Escrito el 2026-08-30, tras el rediseño completo de las tres
superficies.

---

## 1. Qué es esto

Maqueta de front-end (sin backend, sin GPS, sin mapas reales) del sistema de
despacho digital del gremio **Taxi Real San Román**, gremial 32-2020, de
Juliaca, San Román, Puno, Perú.

**Stack:** Next.js 15.5.24 (App Router) · React 19 · TypeScript · CSS Modules ·
`lucide-react` para iconos. Sin librería de UI, sin Tailwind. Node 22+.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # verificación de tipos + build de producción
```

### Tres superficies

| Ruta | Superficie | Dispositivo | Usuario |
|---|---|---|---|
| `/` | Índice de superficies | Escritorio | Quien presenta la maqueta |
| `/conductor` | App del conductor | Móvil (PWA) | Taxista agremiado en turno |
| `/cliente` | App del pasajero | Móvil (PWA) | Pasajero en la calle |
| `/operadora` | Panel de despacho | Escritorio | Operadora de la central |

---

## 2. Estado actual

### Hecho

Se reemplazó por completo el mundo visual anterior (azul institucional
`#2563EB` + amarillo taxi, pilas planas de tarjetas) por uno nuevo:

- **Color:** morado del logo `#8B5CF6`, con escala completa `--brand-50..900`.
- **Estructura móvil:** el mapa es el suelo permanente y las **hojas
  inferiores** (bottom sheets) son lo único que cambia entre estados. Es el
  patrón de Uber/inDriver y sustituye a las pantallas planas anteriores.
- **Motor cartográfico propio** (`src/lib/city.ts` + `src/components/map/`):
  tres niveles viales con *casing*, manzanas generadas con PRNG sembrado, río,
  parques y **anillos tarifarios concéntricos** sobre la Plaza de Armas.
- **Kit de componentes real** (`src/components/ui/`) que reemplazó ~40
  `style={{}}` inline dispersos.
- **App del cliente nueva**: antes no existía.
- **Despliegue** a GitHub Pages configurado (ver §7).

### Verificado

- `npm run build` compila limpio, 5 rutas estáticas.
- Capturas de las 18 pantallas revisadas visualmente en dos rondas.
- Una revisión independiente completa (ver §6, deuda pendiente).

### Rama de trabajo

El trabajo vive en la rama **`joshua`**, no en `main`. `main` sigue en el
commit inicial del proyecto.

```bash
git push -u origin joshua
```

*(quedó pendiente porque el push pide credenciales de GitHub de forma
interactiva)*

---

## 3. Mapa de archivos

```
src/
├── app/
│   ├── globals.css              ← TOKENS del sistema de diseño. Empieza aquí.
│   ├── layout.tsx               ← fuentes (next/font) + contrato de dirección
│   ├── page.tsx / page.module.css        ← índice, campo morado saturado
│   ├── preview.module.css       ← escenario morado de /conductor y /cliente
│   ├── conductor/page.tsx
│   ├── cliente/page.tsx
│   └── operadora/page.tsx
│
├── lib/
│   └── city.ts                  ← geometría determinista de la ciudad
│
├── components/
│   ├── map/
│   │   ├── CityMap.tsx          ← renderiza el mapa base
│   │   └── MapMarkers.tsx       ← RouteLine, PickupPin, DestPin,
│   │                              UnitMarker, RequestPin, SearchPulse
│   ├── ui/
│   │   ├── index.tsx            ← TODO el kit de componentes
│   │   └── ui.module.css
│   ├── shared/
│   │   ├── Shell.tsx            ← armazón móvil + fitCamera + markerScale
│   │   ├── Shell.module.css
│   │   └── PhoneFrame.tsx       ← marco de dispositivo (solo escritorio)
│   ├── conductor/
│   │   ├── ConductorApp.tsx     ← shell + máquina de estados + mapa
│   │   ├── ConductorSheets.tsx  ← contenido de cada hoja
│   │   └── Conductor.module.css
│   ├── cliente/
│   │   ├── ClienteApp.tsx       ← todo en un archivo (shell + hojas)
│   │   └── Cliente.module.css
│   └── operadora/
│       ├── OperadoraApp.tsx     ← shell + enrutado interno
│       ├── TopBar.tsx  SideRail.tsx
│       ├── DispatcherView.tsx   ← cola | mapa | detalle
│       ├── DriversView.tsx  UnitsView.tsx
│       ├── MembershipsView.tsx  ReportsView.tsx
│       └── Operadora.module.css
│
└── data/                        ← datos sintéticos, tipados según el ERD
    ├── types.ts  categories.ts  drivers.ts
    ├── units.ts  requests.ts  trips.ts
    ├── formatters.ts            ← formatPEN, fareBreakdown, membershipBadge…
    └── index.ts                 ← re-exporta todo; importa desde '@/data'
```

---

## 4. Sistema de diseño

Todo vive en `src/app/globals.css`. **Nunca escribas colores literales en los
componentes**; usa las variables.

### Color

```css
--brand: #8B5CF6           /* morado del logo */
--brand-600: #7C3AED       /* fondo de botones y estados activos */
--bg: #08070C              /* negro con temperatura violeta */
--surface / --surface-2 / --surface-3 / --surface-4   /* elevación */
--fg / --fg-muted / --fg-subtle / --fg-faint          /* texto */
--success --warning --danger --info                    /* estado */
--map-*                                                /* paleta cartográfica */
```

**Regla de contraste ya aplicada, no la rompas:** el blanco sobre `--brand`
(`#8B5CF6`) da 4.24:1, que **no** llega al mínimo AA de 4.5:1 para texto
pequeño. Por eso los fondos de botón y de fila activa usan `--brand-600`
(5.7:1) y `--brand` queda para elementos grandes. Igual con `--fg-subtle`, que
se aclaró a `#8D86A1` (5.3:1).

### Tipografía

- `--font-display` → Plus Jakarta Sans (títulos, cifras, numerales de unidad)
- `--font-sans` → Inter (cuerpo)
- `--font-mono` → JetBrains Mono (placas, horas, IDs)

Cargadas con `next/font/google` en `layout.tsx`.

### Convenciones que se siguen en todo el código

- CSS Modules siempre; cero estilos inline salvo valores calculados.
- Radios generosos (`--r-md: 14px`, `--r-lg: 18px`, `--r-2xl: 30px`).
- Elevación con `box-shadow: inset 0 0 0 1px …` en vez de `border` (no altera
  el layout).
- Números tabulares en cualquier dato comparable (`font-variant-numeric`).
- Comentarios en español, explicando **por qué**, no qué.

---

## 5. Decisiones de arquitectura que hay que respetar

### 5.1 El mapa es el suelo, las hojas cambian

`AppShell` (en `Shell.tsx`) apila: `MapLayer` (absoluto, `z-index: 0`) →
`TopChrome` → `BottomStack` (hojas + pestañas). Al cambiar de pantalla **no se
remonta el mapa**, solo la hoja. La hoja lleva `key={screen}` para que la
animación de entrada se repita.

### 5.2 `fitCamera` — el encuadre tiene que esquivar la hoja

```ts
fitCamera(puntos, { pad, min, band })
```

La hoja inferior tapa ~la mitad de la pantalla. Centrar la cámara en el punto
medio deja la acción **detrás** de la hoja. `fitCamera` baja el centro de
cámara para que lo importante suba a la franja visible. `band` es la fracción
vertical libre sobre la hoja (0.34 para hojas altas, 0.46 para bajas).

**Este bug ya se cometió y se corrigió. No lo reintroduzcas usando `camera()`
directamente en pantallas con hoja.**

### 5.3 `markerScale` — los trazos SVG están en unidades de mundo

Un encuadre cerrado agranda los marcadores en pantalla. Todos los marcadores
aceptan `k` y las apps lo calculan con `markerScale(viewBox)`. El panel de
operadora no lo pasa (usa `k = 1`, su encuadre es amplio).

### 5.4 Nada de `new Date()` durante el render

Desincroniza servidor y cliente y React descarta el árbol. Los relojes viven
en `useEffect` y arrancan en `null` (ver `TopBar.tsx`). `PhoneFrame` usa la
hora fija `9:41`. `units.ts` usa una fecha ancla fija.

### 5.5 Datos sintéticos etiquetados

El producto exige no disfrazar mocks. Hay un componente `<Synthetic>` y se usa
en ganancias del conductor, cliente y las vistas de la operadora. **Mantenlo
al añadir pantallas.**

---

## 6. Deuda pendiente (de una revisión independiente)

Veredicto: `fix`. Lo urgente ya se corrigió. Queda:

### Alta prioridad

1. **El sello gremial nunca muestra sus letras.** `src/components/ui/index.tsx`
   línea ~35: `const short = compact || size < 44`. Las letras "REAL / SAN
   ROMÁN / 32 2020" solo se dibujan si `!short`, pero **las 8 llamadas pasan
   `compact`**. Hoy el sello lee como una carita, no como sello. Hay que
   mostrarlo con letras al menos en la tarjeta de verificación del cliente
   (`ClienteApp.tsx`, `size={52}`) y en el índice (`page.tsx`, `size={44}`), y
   llevarlo a escala protagonista. *Esto contradice directamente la decisión
   del cliente de "sello gremial como héroe".*

2. **El morado no llega a escala de región en las apps móviles** (~8% de los
   píxeles; es un acento tímido). El cliente pidió explícitamente **campo
   saturado**. El patrón ya existe y funciona: `.catActive` en
   `Cliente.module.css` tiñe la fila entera, y la solicitud seleccionada del
   panel de operadora es un campo morado completo. Falta aplicarlo al estado
   de membresía, la cabecera de ganancias, la hoja de viaje en curso y la
   tarjeta de unidad asignada.

3. **`DESIGN.md` describe el mundo azul viejo** y contradice todo lo
   construido. Hay que reescribirlo desde el código real: tokens, tipografía,
   patrón de hojas, motor de mapa, identidad gremial.

### Media

4. El índice (`/`) son tres tarjetas idénticas de icono + título + texto, y
   Reportes abre con una fila de cuatro métricas. Ambos son patrones que el
   estándar de calidad del proyecto marca como default perezoso.
5. Etiquetas de referencia urbana todavía se cortan a media palabra en los
   bordes del recorte en algunos encuadres.
6. `PhoneFrame` dibuja cromo de iOS simulado; ya se oculta bajo 560 px, pero
   conviene revisar que no reaparezca en tablets.

---

## 7. Despliegue

Ya está configurado. `next.config.js` activa exportación estática **solo**
cuando `GITHUB_PAGES=true`, así que `npm run dev` no cambia.

`.github/workflows/deploy.yml` construye y publica en cada push a `main` **o a
`joshua`**, que es la rama de trabajo actual.

**Paso manual pendiente (una sola vez):**
GitHub → repo → **Settings → Pages → Source: GitHub Actions**

URL resultante: `https://kaquenduri.github.io/design-sanroman/`

> Si prefieres Vercel: `npx vercel` (login interactivo). Con Vercel hay que
> **quitar** `basePath` y `assetPrefix` de `next.config.js`.

---

## 8. Dominio: reglas reales que la UI ya refleja

Vienen del ERD y del documento de arquitectura del proyecto. **No las
inventes de nuevo ni las contradigas.**

- **Tarifa fija por anillo**, no dinámica, no subasta. El precio sale del
  anillo del punto de recogida + recargo de categoría. Se muestra **exacto
  antes de solicitar**. Ver `fareBreakdown()` en `data/formatters.ts`.
- **Anillos tarifarios** concéntricos sobre la Plaza de Armas: Anillo 1 S/8,
  Anillo 2 S/10, Anillo 3 S/13 (montos sintéticos). En `lib/city.ts`.
- **Categorías** (`NombreCategoriaVehiculo` del ERD): SEDAN, PROBOX, MINIVAN,
  SUV — con capacidad de pasajeros y tipo de carga.
- **Propuesta en cascada**: se propone a **una unidad por vez**, con timeout de
  **22 s** (el ERD dice 20-25 s). Si no responde, pasa a la siguiente.
- **Embarque máximo 2 minutos** por ordenanza municipal en vías saturadas.
  Está el cronómetro en la pantalla `arrived` del conductor.
- **Membresía gremial = llave de acceso.** Al vencer, la unidad sale del pool
  de asignación automáticamente. Es un bloqueo duro, no un aviso.
  **Sin decidir:** el periodo de gracia tras el vencimiento. Está marcado como
  pendiente en la UI; mantenlo marcado.
- **Pago 100% en efectivo** en Fase 1. **No** mostrar afordancias de tarjeta o
  billetera digital, ni siquiera deshabilitadas.
- **Canal teléfono**: la operadora puede registrar solicitudes que entran por
  llamada. Está en el filtro de la cola.
- Idioma: español de Perú, registro neutro, sin jerga regional.

---

## 9. Trabajo pedido y aún no hecho

Del cliente, en sus palabras:

### App del conductor
- **Login / verificación**: no existe. El producto define **PIN + biometría**
  para el conductor (MFA queda para admin).
- Pantalla de **membresía vencida** (el bloqueo duro descrito arriba).

### App del cliente
- **Registro / onboarding**: no existe. Falta alta de cuenta y verificación
  (por SMS según el producto).
- **Centro de notificaciones**: no existe.
- Le parece **"muy soso"**: faltan historial de viajes, métodos de pago,
  ayuda/soporte, perfil, direcciones guardadas editables.

### Ambas
- Estados vacíos, sin conexión y de error. La conectividad en Juliaca es
  intermitente y el producto exige que la app del conductor lo tolere.

### Panel de operadora
- **Cambiar el riel lateral** al estilo del sidebar de **Instagram web**
  (filas de icono + etiqueta, sin fondos de caja, colapsable a solo iconos).
  Pedido por Benjamín, del equipo. *Nota: el mensaje decía "como la de IG en
  iOS", pero el usuario confirmó que se refiere al panel de operadora, y la
  captura que compartió era de Instagram web.*

---

## 10. Trampas conocidas

- **Windows / PowerShell.** `&&` no funciona en PowerShell 5.1; usa `;` o el
  Bash tool. Node se instaló con winget y una terminal nueva ya lo ve.
- **No mates procesos node a ciegas.** `Get-Process node | Stop-Process` mata
  también el `npm run dev` del usuario, y matar un build a medias deja
  `.next` sin `BUILD_ID` (el servidor arranca pero sirve 400 en los chunks).
  Mata por puerto: `Get-NetTCPConnection -LocalPort 3000 -State Listen`.
- **Al reordenar capas SVG**, recuerda que las etiquetas de anillo se dibujan
  **después** de `{children}` a propósito, para que los marcadores no las
  tapen.
- El suelo del mapa desborda el mundo 900 unidades por lado a propósito: sin
  ese margen aparece una banda negra cuando la cámara se asoma fuera del casco.
- Verificación visual: se usó Playwright (ya desinstalado para no ensuciar el
  CI). Para volver a capturar: `npm i -D playwright && npx playwright install
  chromium`, levantar `npx next start -p 3100` y automatizar con
  `page.getByRole('button', { name: /…/ })`.

---

## 11. Orden sugerido para continuar

1. `git push -u origin joshua` y activar Pages (§7) → el avance queda visible.
2. Deuda alta de §6 (sello con letras, morado a escala de región, `DESIGN.md`).
3. Login del conductor + membresía vencida (§9).
4. Registro, notificaciones y pantallas de contenido del cliente (§9).
5. Sidebar de la operadora estilo Instagram web (§9).
6. Estados vacíos / sin conexión / error en ambas apps.
