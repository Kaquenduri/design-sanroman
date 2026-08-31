# Instrucciones para agentes

**Antes de tocar cualquier archivo, lee `HANDOFF.md` en la raíz.** Contiene el
estado del proyecto, el mapa de archivos, el sistema de diseño, la deuda
pendiente y las reglas del dominio. Sin eso vas a romper decisiones que ya
costaron trabajo.

## Contexto en una línea

Maqueta de front-end (Next.js 15 + React 19 + TypeScript + CSS Modules) del
sistema de despacho del gremio de taxis **Real San Román**, Juliaca, Perú.
Tres superficies: `/conductor`, `/cliente`, `/operadora`. Sin backend.

## Reglas que no se negocian

1. **Rama de trabajo: `joshua`.** No commitees en `main`.
2. **Nada de colores literales** en componentes. Todo sale de las variables de
   `src/app/globals.css`.
3. **Nada de `style={{}}` inline.** Existe un kit en `src/components/ui/`.
   Si falta un componente, añádelo al kit.
4. **Nada de `new Date()` durante el render** — desincroniza servidor y cliente
   y React descarta el árbol. Relojes en `useEffect`.
5. **Contraste:** blanco sobre `--brand` (#8B5CF6) da 4.24:1 y no llega al
   mínimo AA. Los fondos con texto pequeño usan `--brand-600`.
6. **En pantallas con hoja inferior usa `fitCamera()`, nunca `camera()`.**
   La hoja tapa media pantalla; `camera()` deja la acción escondida detrás.
7. **Los marcadores del mapa llevan `k={markerScale(view)}`.** Sus trazos están
   en unidades de mundo y sin eso se agigantan al acercar.
8. **Los datos inventados van etiquetados** con el componente `<Synthetic>`.
9. Comentarios en español, explicando **por qué**, no qué.
10. Verifica con `npm run build` antes de dar algo por terminado.

## Idioma

Toda la interfaz en español de Perú, registro neutro, sin jerga regional.

## Por dónde seguir

Sección 11 de `HANDOFF.md`. Resumen: primero la deuda de diseño (el sello
gremial no muestra sus letras, el morado no llega a escala de región,
`DESIGN.md` está desactualizado), después login del conductor, registro y
notificaciones del cliente, y el sidebar de la operadora estilo Instagram web.
