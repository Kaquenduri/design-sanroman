# Sistema de diseño — Taxi Real San Román

<!-- impeccable:design-schema 1 -->

Este documento describe la interfaz que existe en el código. La fuente de
verdad de los tokens es `src/app/globals.css`; si un valor cambia allí, no se
debe duplicar en componentes.

## Dirección

La identidad parte del sello del gremio Real San Román, gremial 32-2020, y de
un campo morado saturado sobre un mundo oscuro con temperatura violeta. No es
un panel administrativo genérico: el producto debe sentirse como una central
de taxi local, verificable y presente en la calle de Juliaca.

El color de marca trabaja en dos escalas:

- como campo completo en estados decisivos, identidad y selección;
- como acento puntual en acciones, marcadores, numerales y foco.

Las apps móviles viven sobre el mapa. Las hojas inferiores cambian de estado,
pero la ciudad permanece debajo y sostiene la continuidad espacial. El panel
de operadora aumenta la densidad y permite barrer cola, mapa y detalle al mismo
tiempo.

## Tokens

### Marca y contraste

La escala `--brand-50` a `--brand-900` deriva del morado del sello. Los roles
principales son:

- `--brand`: identidad, objetos grandes y numerales de unidad;
- `--brand-600`: botones con texto pequeño, filas activas y campos saturados;
- `--brand-hover` y `--brand-press`: interacción;
- `--brand-fg`: texto sobre campos de marca;
- `--brand-a08`, `--brand-a12`, `--brand-a16`, `--brand-a24` y
  `--brand-a40`: halos, separadores y tintes translúcidos.

El blanco sobre `--brand` no alcanza AA para texto pequeño. Por eso las
regiones con texto de interfaz usan `--brand-600`; `--brand` queda para objetos
grandes o elementos sin texto pequeño.

### Suelo y elevación

El lienzo parte de `--bg` y `--bg-deep`. Las elevaciones son `--surface`,
`--surface-2`, `--surface-3` y `--surface-4`. Los límites usan `--border`,
`--border-strong` y `--border-hair`.

La elevación se expresa sobre todo con `box-shadow` e inset, para no alterar la
geometría de los componentes. Los presets son `--sh-xs`, `--sh-sm`, `--sh-md`,
`--sh-lg`, `--sh-sheet`, `--sh-brand` y `--sh-brand-lg`.

`--glass`, `--glass-strong` y `--glass-border` están reservados para controles
que flotan sobre el mapa. El vidrio es funcional: mantiene el contexto urbano
visible; no es decoración de tarjetas comunes.

### Texto y estado

- `--fg`: contenido principal;
- `--fg-muted`: explicación y metadatos;
- `--fg-subtle`: etiquetas pequeñas y placeholders con contraste AA;
- `--fg-faint`: información de muy baja jerarquía que no sea esencial.

Los estados usan familias completas: `--success`, `--warning`, `--danger` y
`--info`, con sus respectivos foregrounds y tintes translúcidos. El color nunca
es la única señal: se acompaña de icono, texto o ambas cosas.

La placa peruana es un objeto propio con `--plate-bg` y `--plate-fg`; no se
representa como un chip de marca.

### Mapa

La familia `--map-*` define suelo, manzanas, tres jerarquías de vía, agua,
parques y etiquetas. El asfalto siempre es más claro que la manzana para que
las calles se lean como calles y no como zanjas.

### Escala y movimiento

El espaciado usa una base de 4 px mediante `--s-1` a `--s-20`. Los radios van
de `--r-xs` a `--r-2xl`; `--r-full` se reserva para píldoras, avatares y
controles circulares.

La animación usa `--ease`, `--ease-out`, `--ease-spring` y las duraciones
`--t-fast`, `--t-base`, `--t-slow`. Los movimientos comunican entrada de datos,
cambio de estado o confirmación; no encadenan coreografías ornamentales.

## Tipografía

Las fuentes se cargan con `next/font` en `src/app/layout.tsx`:

- `--font-display`: Plus Jakarta Sans para títulos, cifras protagonistas y
  numerales de unidad;
- `--font-sans`: Inter para cuerpo, controles y texto operativo;
- `--font-mono`: JetBrains Mono para placas, horas, IDs y datos que deben
  alinearse.

La escala única va de `--text-2xs` a `--text-5xl`. En escritorio se concentra
en los tamaños pequeños y medios para permitir escaneo; en móvil sube de escala
para lectura de un vistazo. Títulos y cifras usan `--tracking-tight`; etiquetas
en mayúsculas usan `--tracking-caps`. Montos, tiempos y comparables usan
numerales tabulares.

## Identidad gremial

El sello es la pieza de confianza principal. Debe mostrar “REAL / SAN ROMÁN /
32 2020” cuando aparece como identidad o verificación. El modo `compact` es
solo un distintivo para espacios realmente pequeños, como estados de 13–30 px;
no sustituye al sello protagonista.

El sello completo aparece a escala grande en el índice y en la tarjeta de
unidad asignada del cliente. Se combina con otros dos objetos del dominio:

- el numeral grande pintado en la unidad (`UnitBadge`);
- la placa peruana (`Plate`).

La combinación sello + numeral + placa permite verificar el auto antes de
subir. No se reemplaza por un icono abstracto ni por una fotografía genérica.

## Composición móvil: mapa + hoja inferior

`AppShell` mantiene este orden de capas:

1. `MapLayer` como suelo permanente;
2. `TopChrome` y controles flotantes;
3. `BottomStack` con la hoja y, cuando corresponde, las pestañas.

Al cambiar de estado se reemplaza el contenido de la hoja, no el mapa. Las
hojas usan radios superiores grandes, sombra ascendente y una acción primaria
clara. Los estados persistentes o decisivos pueden tomar toda la hoja con
`--brand-600`: el viaje en curso es el ejemplo vinculante.

Toda pantalla con hoja inferior encuadra puntos con `fitCamera()`. `camera()`
centra geométricamente, pero deja la acción detrás de la hoja. `fitCamera()`
desplaza la cámara hacia la banda visible mediante `band` y añade el padding
necesario.

Los marcadores reciben `k={markerScale(view)}` porque sus trazos están en
unidades del mundo SVG. Sin esa compensación se agrandan en encuadres cerrados.

## Motor cartográfico

En `/operadora`, Leaflet y OpenStreetMap sustituyen el plano ilustrativo por
un mapa navegable de Juliaca. La operadora busca una referencia, el mapa vuela
al resultado y un pin fijo permite ajustar el punto exacto antes de confirmarlo.
El buscador se limita a Juliaca y mantiene atribución visible. Las posiciones
de flota, distancias y tiempos siguen siendo sintéticos hasta conectar GPS y
ruteo reales.

`src/lib/city.ts` define un mundo compartido y determinista de 1600 × 1200
unidades, centrado tarifariamente en la Plaza de Armas. Con semilla fija genera
manzanas y conserva el mismo árbol en servidor y cliente.

`CityMap` compone:

- calles locales, secundarias y arteriales;
- casing oscuro debajo del asfalto para leer cruces y jerarquía vial;
- manzanas, parques, río y referencias urbanas;
- anillos tarifarios concéntricos sobre la Plaza de Armas;
- rutas, puntos y unidades aportados como `children`.

El mundo desborda el casco a propósito para evitar bandas vacías al mover la
cámara. Las etiquetas se reducen en encuadres cerrados y los rótulos de anillo
se dibujan después de los marcadores para conservar legibilidad.

## Panel de operadora

La vista de despacho es una composición de cola + mapa + detalle. La navegación
vive en una franja inferior reservada que no cubre el mapa. Dentro de ella, un
dock de vidrio oscuro reúne iconos, etiquetas y contadores con una presencia
inspirada en la interfaz de Apple. La ruta activa toma una cápsula elevada y
los nombres permanecen disponibles para tecnologías de asistencia.

La solicitud elegida toma una superficie morada completa. Es el patrón de
selección a escala de región y no debe degradarse a un borde lateral.

## Componentes y reglas

El kit vive en `src/components/ui`. Si falta una variante reutilizable, se
añade allí o en el módulo CSS de la superficie; no se resuelve con estilos
inline.

Reglas vinculantes:

- no escribir colores literales en componentes; usar tokens de `globals.css`;
- no usar `style={{...}}` para maquetación o apariencia;
- usar CSS Modules;
- mantener targets táctiles de al menos 44 px en móvil;
- usar Lucide para iconografía, sin mezclar emoji como iconos;
- etiquetar todo dato inventado con `Synthetic`;
- en la primera versión de despacho telefónico, la operadora registra Yape o
  efectivo y puede editar el precio acordado;
- no usar `new Date()` durante render; los relojes arrancan en `null` y se
  actualizan en un efecto.

## Patrones que se conservan

- Campo saturado para selección y estado importante, con contraste comprobado.
- Una acción primaria por hoja móvil.
- Datos comparables alineados y con números tabulares.
- Píldoras de estado con texto explícito.
- Mapas sintéticos claramente identificados como tales.
- Membresía gremial como habilitación, no como recordatorio opcional.

## Antipatrones

- Azul institucional o amarillo taxi como mundo visual paralelo.
- Sello compacto usado como marca protagonista.
- Bordes de color como único indicador de selección.
- Pilas de tarjetas desconectadas del mapa en las apps móviles.
- Gradientes de texto, emoji decorativos y sombras duras de bloque.
- Vidrio en tarjetas que no flotan sobre el mapa.
- Métricas sintéticas presentadas como datos reales.
- `camera()` directo en una pantalla cubierta por hoja inferior.
