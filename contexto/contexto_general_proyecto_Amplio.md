# Contexto, Objetivos e Identidad Visual de la Plataforma "Taxi Real San Román"

Este documento en formato Markdown consolida la visión estratégica, el diseño de la interfaz de usuario (UI/UX) bajo la identidad corporativa del morado eléctrico (`#6633FF`), y la arquitectura tecnológica definitiva de la plataforma de despacho digital para Juliaca, Puno.

---

## 1. ¿De qué trata el proyecto y qué busca?

El proyecto consiste en migrar el sistema analógico de la empresa **Taxi Real San Román** (que actualmente opera mediante operadoras humanas y radiofrecuencia/Zello) hacia una plataforma digital integrada. La meta estratégica es automatizar el despacho de unidades mediante aplicaciones móviles, reduciendo los tiempos de espera y optimizando la asignación.

El sistema operará bajo un modelo híbrido en su fase inicial:

* **Canal de Reserva Telefónica (Puente Digital):** Debido a que la adopción tecnológica es gradual y el efectivo domina en la sierra sur, las operadoras seguirán recibiendo llamadas y registrando viajes manualmente desde un panel web, el cual alimentará de forma unificada el mismo motor de asignación en tiempo real.
* **Despacho por Broadcast Inicial:** En lugar de una asignación directa fría (estilo Uber), la Fase 1 priorizará un envío masivo (*broadcast*) a los conductores disponibles más cercanos. Esto se alinea mejor con los hábitos del gremio (donde los conductores compiten amistosamente por tomar el viaje que "suena" en la radio) y asegura la aceptación del servicio en zonas de baja densidad de vehículos.
* **Transacciones en Efectivo:** Para mitigar la fricción de pagos digitales en el altiplano, el cobro en la versión piloto será 100% en efectivo, dejando las bases de datos preparadas para habilitar Yape, Plin o tarjetas de crédito/débito en el futuro.
* **Control Operativo por Membresías:** El sistema gestionará las unidades como "slots operativos" independientes de los perfiles de los choferes. Si un conductor no paga su membresía de acceso al gremio, el backend revocará automáticamente su autorización de uso antes de que intente recibir o aceptar viajes.

---

## 2. Escala Real de Operación (El Gran Ajuste v3)

A diferencia de estimaciones preliminares de baja escala, la revisión de arquitectura de agosto de 2026 confirmó que la escala real del proyecto es 10 veces mayor de lo proyectado inicialmente:

* **Flota Activa:** ~100 conductores en sincronía normal, que en picos de eventos de fin de semana puede expandirse hasta ~150 unidades activas.
* **Operación de la Central:** 3 a 5 operadoras concurrentes despachando en vivo y 5 administradores en el panel web.
* **Carga de Tráfico:** Un pico extremo de hasta 2,000 conexiones concurrentes (WebSockets de rastreo, paneles interactivos y notificaciones del sistema).
* **Volumen de Viajes:** Se estiman entre 1,500 y 2,500 viajes diarios en total. Esto representa un volumen de escritura de *tracking* GPS modesto para el backend (~10 a 33 inserciones por segundo en régimen normal, y hasta 100/s con *overhead* de reconexión), lo que permite mantener la persistencia centralizada en base de datos relacionales sin requerir infraestructuras de *big data* costosas.

---

## 3. Identidad de Marca, Paleta de Colores y UI/UX (Diseño Visual)

La interfaz de usuario debe proyectar modernidad, velocidad y control operativo. Para lograrlo, el diseño de interfaces se rige bajo la identidad oficial de la marca:

### El Morado Eléctrico (`#6633FF`) como Eje de Marca
El color primario de la plataforma es el morado eléctrico (`#6633FF`), un tono vibrante y de alta visibilidad que destaca excepcionalmente en pantallas móviles bajo diversas condiciones de luz.

* 🎨 **`#6633FF`** (Morado Eléctrico - Primario de Acción)
  * ├── **`#4411D9`** (Morado Oscuro - Texto, Headers y Enfoque)
  * └── **`#EBE6FF`** (Lavanda Claro - Fondos de Selección y Superficies)

### Color de Acento / Alertas Semánticas:
* **Acción / Espera:** `#FFB300` (Ámbar para llamadas a la acción de contraste, botones secundarios y estado de viaje "Buscando unidad").
* **Éxito / Finalización:** `#2E7D32` (Verde esmeralda para viajes finalizados con éxito o inicios de ruta).
* **Error / Cancelaciones:** `#C62828` (Rojo bermellón para botones de cancelación, descarte de solicitudes y alertas críticas).

### Contraste y Accesibilidad (WCAG AA)
Todo elemento de texto ubicado sobre botones o fondos morados (`#6633FF`) debe ser estrictamente Blanco Puro (`#FFFFFF`), asegurando una legibilidad perfecta para conductores de edad avanzada o bajo luz diurna intensa.

### Color-Coding para el Estado del Viaje
Tanto en la aplicación móvil como en la consola web de administración, el ciclo de vida del viaje se identificará de inmediato mediante etiquetas de estado semánticas:
* 🟢 **Buscando Unidad:** Ámbar (`#FFB300`).
* 🔵 **Conductor en Camino:** Azul (`#1565C0`).
* 🟣 **En Viaje Activo:** Morado Eléctrico (`#6633FF`).
* 🟢 **Viaje Finalizado:** Verde (`#2E7D32`).
* 🔴 **Viaje Cancelado:** Rojo (`#C62828`).

### Diseño UX para la Conducción (Reducción de Estrés)
El diseño en la aplicación del conductor está pensado para mitigar errores físicos en calles con baches o vías no asfaltadas de Juliaca:
* **Componentes Táctiles Agrandados:** Se implementarán *Bottom Sheets* (paneles inferiores deslizantes) y botones interactivos gigantes con radios de curvatura generosos (de 8px a 16px) para que el conductor pueda marcar acciones clave (ej. "Llegué al punto", "Iniciar viaje") con un amplio margen de error táctil.
* **Interpolación y Movimiento Suave:** En lugar de teletransporte o saltos abruptos en el mapa al recibir actualizaciones de coordenadas GPS, los iconos de los taxis transicionarán mediante interpolación suave de movimiento para una experiencia visual fluida.
* **Clustering en el Mapa de la Operadora:** Al escalar la flota a 100 conductores simultáneos, el mapa de despacho web utilizará agrupación visual de marcadores (*clustering*) al alejar el zoom. Esto evita la saturación visual de la pantalla de las operadoras y optimiza el rendimiento del navegador web.

### Sincronización Cross-Platform del Diseño
Para garantizar que las apps móviles y la consola web compartan de forma idéntica las variables visuales, el equipo técnico utilizará una arquitectura basada en *Design Tokens*:

```text
[ Figma (Origen Único de la Verdad del Diseño) ]
                     │
                     ▼ (Exportación)
         [ Archivo JSON de Tokens ]
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ Constantes UI Móvil ]     [ Clases CSS / Tailwind (Web) ]