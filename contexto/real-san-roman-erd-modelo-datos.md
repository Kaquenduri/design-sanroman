# Real San Román — ERD, Modelo de Datos, Normalización y Script SQL
### v4 · Agosto 2026 · Complementa el documento de arquitectura v3 + sección de geolocalización

---

## Nota sobre el cambio de stack: Backend en Go (en vez de Kotlin+Ktor)

Se confirma: **móvil del conductor en KMP, backend en Go.** Todo lo demás del stack se mantiene: Next.js + TanStack Query (web), PostgreSQL 16 + PostGIS (particionado + réplica de lectura), Redis (caché de posiciones + Pub/Sub), MapLibre + OSRM self-hosted (geolocalización).

**Una consecuencia técnica que hay que asumir con esta elección, para que no sorprenda más adelante:** el argumento de "compartir el módulo de dominio KMP entre backend y móvil" (máquina de estados del viaje, cálculo de tarifa, validaciones) **deja de aplicar**, porque Go y Kotlin no comparten código. Eso significa que la máquina de estados del `Viaje` y el `CalcularTarifaUseCase` se implementan **una vez en Go (backend, fuente de verdad)** y **una vez en Kotlin (app del conductor, para UI optimista y validación local antes de enviar al servidor)**. Esto es perfectamente viable — así trabajan la gran mayoría de apps de este tipo — pero exige disciplina: **el backend es siempre la autoridad final** (la app nunca decide un estado por sí sola, solo anticipa visualmente); y conviene mantener **un solo documento de reglas de negocio** (o un archivo de configuración/JSON Schema compartido, ej. las reglas del tarifario) del que ambas implementaciones se deriven, para que no diverjan con el tiempo. Nada de esto cambia el ERD ni la base de datos, que es lo que se documenta abajo.

**Para Go, el acceso a datos recomendado:** `sqlc` (genera código Go tipado desde SQL, sin ORM mágico) o `pgx` directo — encajan bien con Hexagonal (el `ConductorRepository` es una interface; `sqlc`/`pgx` implementan el adaptador). Evitar GORM para las consultas geoespaciales (KNN/PostGIS), que conviene escribir en SQL explícito.

---

## 1. Enumeraciones (tipos ENUM de PostgreSQL)

| Enum | Valores |
|---|---|
| `RolUsuario` | ADMIN, OPERADORA, CONDUCTOR, DEV |
| `EstadoUsuario` | ACTIVO, INACTIVO, SUSPENDIDO |
| `EstadoConductor` | DISPONIBLE, OCUPADO, DESCONECTADO, SUSPENDIDO |
| `EstadoViaje` | SOLICITADO, BUSCANDO_UNIDAD, PROPUESTA_ENVIADA, ASIGNADO, EN_CAMINO_RECOJO, INICIADO, EN_CURSO, FINALIZADO, CANCELADO, DISPUTADO |
| `RespuestaPropuesta` | PENDIENTE, ACEPTADA, RECHAZADA, EXPIRADA |
| `CanceladoPor` | CLIENTE, CONDUCTOR, OPERADORA, SISTEMA |
| `EstadoMembresia` | VIGENTE, VENCIDA, SUSPENDIDA |
| `PeriodoMembresia` | SEMANAL, MENSUAL |
| `MetodoPago` | EFECTIVO, TARJETA (reservado), BILLETERA_DIGITAL (reservado) |
| `NombreCategoriaVehiculo` | SEDAN, PROBOX, MINIVAN, SUB |
| `TipoCarga` | NINGUNA, LIVIANA, PESADA |
| `TipoDispositivo` | ANDROID, IOS, WEB |
| `AccionAuditoria` | CREAR, ACTUALIZAR, ELIMINAR, REASIGNAR, SUSPENDER, ACTIVAR, AJUSTAR_TARIFA |
| `TipoDisputa` | TARIFA_INCORRECTA, MAL_SERVICIO, OBJETO_PERDIDO, ABUSO, OTRO |
| `EstadoDisputa` | ABIERTA, EN_REVISION, RESUELTA, DESCARTADA |
| `TipoDocumentoVehicular` | SOAT, CITV, TARJETA_CIRCULACION_TUC, TARJETA_PROPIEDAD, POLIZA, LICENCIA_CONDUCIR |
| `EstadoDocumento` | VIGENTE, POR_VENCER, VENCIDO |
| `TipoIncidencia` | NO_SHOW_CLIENTE, NO_SHOW_CONDUCTOR, DEMORA, QUEJA_CLIENTE, GPS_SOSPECHOSO, AVERIA, OTRO |
| `SeveridadIncidencia` | BAJA, MEDIA, ALTA |
| `EstadoIncidencia` | ABIERTA, EN_REVISION, CERRADA |
| `TipoComprobante` | BOLETO_TRANSPORTE_URBANO, BOLETA_ELECTRONICA, FACTURA_ELECTRONICA |
| `EstadoSunat` | NO_APLICA, PENDIENTE, ACEPTADO, RECHAZADO |
| `ConceptoTarifa` | BASE_ANILLO, AJUSTE_SUBZONA, RECARGO_CARGA, RECARGO_CLIMA, RECARGO_VIA, RECARGO_EVENTO, AJUSTE_MANUAL |
| `EstadoTurno` | ABIERTO, CERRADO |

---

## 2. ERD — todas las entidades (formato entidad · campo · tipo · notas)

### `Usuario` (Class Table Inheritance — raíz de Conductor/Operadora/Admin)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR(255) único, nullable | |
| telefono | VARCHAR(20) único | |
| password_hash | VARCHAR(255) | Argon2id |
| pin_hash | VARCHAR(255) nullable | solo conductor |
| rol | RolUsuario | |
| estado | EstadoUsuario | |
| mfa_habilitado | BOOLEAN | |
| fecha_creacion | TIMESTAMPTZ | |
| fecha_actualizacion | TIMESTAMPTZ | |
| ultimo_login | TIMESTAMPTZ nullable | |

### `Conductor` (1:1 con Usuario)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| usuario_id | UUID FK → Usuario, único | |
| nombres | VARCHAR(150) | |
| apellidos | VARCHAR(150) | |
| dni | VARCHAR(15) único | |
| licencia_conducir | VARCHAR(30) | también normalizada en `DocumentoVehicular`/documento conductor |
| fecha_vencimiento_licencia | DATE | |
| foto_url | VARCHAR(500) | |
| estado_operativo | EstadoConductor | |
| estado_calidad | VARCHAR(20) | ACTIVO / OBSERVADO / SUSPENDIDO — reemplaza `calificacion_promedio` |
| fecha_ingreso | DATE | |

> `calificacion_promedio` se elimina (ver §5, decisión ya justificada: calificación se maneja fuera del sistema).

### `CategoriaVehiculo`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| nombre | NombreCategoriaVehiculo | |
| capacidad_pasajeros | SMALLINT | 4 o 7 |
| admite_carga | BOOLEAN | |
| tipo_carga | TipoCarga | |
| activo | BOOLEAN | |

### `Unidad` (slot operativo, separado del Conductor — reasignable)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| numero_unidad | VARCHAR(20) único | canónico, normalizado (`Unidad-NN`) |
| alias_legacy | VARCHAR(50) nullable | identificador original de Zello, para trazabilidad |
| categoria_vehiculo_id | UUID FK → CategoriaVehiculo | |
| placa | VARCHAR(10) | |
| marca | VARCHAR(50) | |
| modelo | VARCHAR(50) | |
| anio | SMALLINT | |
| color | VARCHAR(30) | |
| tiene_camara | BOOLEAN | |
| conductor_actual_id | UUID FK → Conductor, nullable | |
| estado | VARCHAR(20) | ACTIVA / MANTENIMIENTO / INACTIVA |
| fecha_registro | TIMESTAMPTZ | |

### `Membresia`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| conductor_id | UUID FK → Conductor | histórico (1:N) |
| periodo | PeriodoMembresia | |
| fecha_inicio | DATE | |
| fecha_vencimiento | DATE | |
| estado | EstadoMembresia | |
| monto | DECIMAL(10,2) | |
| metodo_pago_membresia | VARCHAR(20) | EFECTIVO en V1 |
| fecha_pago | TIMESTAMPTZ nullable | |

### `PuntoDeReferencia`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| nombre | VARCHAR(100) | ej. "Plaza de Armas", "el Mall" |
| ubicacion | GEOGRAPHY(POINT, 4326) | |
| descripcion | TEXT nullable | |

### `Anillo`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| punto_referencia_id | UUID FK → PuntoDeReferencia | |
| nombre | VARCHAR(50) | |
| radio_metros | INTEGER nullable | si es círculo |
| poligono | GEOGRAPHY(POLYGON, 4326) nullable | si es polígono |
| es_referencial | BOOLEAN | |
| version_tarifario_id | UUID FK → VersionTarifario | |

### `TarifaAnilloCategoria` (puente N:M, versionado)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| anillo_id | UUID FK → Anillo | |
| categoria_vehiculo_id | UUID FK → CategoriaVehiculo | |
| version_tarifario_id | UUID FK → VersionTarifario | |
| tarifa_base | DECIMAL(10,2) | |

### `AjusteSubZona`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| anillo_id | UUID FK → Anillo | |
| version_tarifario_id | UUID FK → VersionTarifario | |
| nombre_subzona | VARCHAR(100) | |
| geometria | GEOGRAPHY(POLYGON, 4326) nullable | |
| monto_ajuste | DECIMAL(10,2) | positivo o negativo |
| activo | BOOLEAN | |

### `VersionTarifario` (versionado del tarifario completo)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| descripcion | VARCHAR(150) | ej. "Ajuste combustible marzo 2026" |
| vigente_desde | TIMESTAMPTZ | |
| vigente_hasta | TIMESTAMPTZ nullable | null = versión activa |
| creado_por_usuario_id | UUID FK → Usuario | admin que la publicó |
| activo | BOOLEAN | |

### `Viaje` (aggregate root del contexto Viajes)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| cliente_nombre | VARCHAR(150) | |
| cliente_telefono | VARCHAR(20) | |
| operadora_id | UUID FK → Usuario | |
| conductor_id | UUID FK → Conductor, nullable | |
| unidad_id | UUID FK → Unidad, nullable | |
| categoria_vehiculo_id | UUID FK → CategoriaVehiculo | |
| punto_recojo | GEOGRAPHY(POINT, 4326) | |
| direccion_recojo_texto | VARCHAR(255) | |
| punto_destino | GEOGRAPHY(POINT, 4326) nullable | |
| direccion_destino_texto | VARCHAR(255) nullable | |
| anillo_asignado_id | UUID FK → Anillo, nullable | |
| version_tarifario_id | UUID FK → VersionTarifario | qué versión se usó — clave para reproducir el cálculo histórico |
| tarifa_tentativa | DECIMAL(10,2) | snapshot histórico |
| tarifa_final | DECIMAL(10,2) nullable | snapshot histórico |
| distancia_estimada_km | DECIMAL(6,2) nullable | de OSRM |
| duracion_estimada_min | INTEGER nullable | de OSRM |
| ruta_recorrida | GEOGRAPHY(LINESTRING, 4326) nullable | se guarda al cerrar el viaje, evita escanear TrackingUbicacion |
| estado | EstadoViaje | |
| metodo_pago | MetodoPago | |
| motivo_cancelacion | TEXT nullable | |
| cancelado_por | CanceladoPor nullable | |
| motivo_liberacion | TEXT nullable | cuando el conductor libera tras aceptar |
| turno_operadora_id | UUID FK → TurnoOperadora, nullable | |
| fecha_solicitud | TIMESTAMPTZ | |
| fecha_asignacion | TIMESTAMPTZ nullable | |
| fecha_inicio | TIMESTAMPTZ nullable | |
| fecha_fin | TIMESTAMPTZ nullable | |

### `PropuestaViaje`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| viaje_id | UUID FK → Viaje | |
| conductor_id | UUID FK → Conductor | |
| orden_intento | SMALLINT | orden del reintento en cascada |
| respuesta | RespuestaPropuesta | |
| timeout_segundos | SMALLINT | 20-25 s (decisión ya tomada) |
| fecha_envio | TIMESTAMPTZ | |
| fecha_expiracion | TIMESTAMPTZ | fecha_envio + timeout_segundos |
| fecha_respuesta | TIMESTAMPTZ nullable | |

### `DesgloseTarifa` (event-sourcing ligero del cálculo)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| viaje_id | UUID FK → Viaje | |
| concepto | ConceptoTarifa | |
| monto | DECIMAL(10,2) | positivo o negativo |
| detalle | VARCHAR(200) nullable | |
| orden | SMALLINT | orden de aplicación |

### `TrackingUbicacion` (alto volumen — PARTICIONADA, ver §4)
| Campo | Tipo | Notas |
|---|---|---|
| id | BIGINT identity | NO usar UUID aquí (ver §4) |
| viaje_id | UUID FK → Viaje, nullable | |
| conductor_id | UUID FK → Conductor | |
| ubicacion | GEOGRAPHY(POINT, 4326) | |
| velocidad_kmh | DECIMAL(5,2) nullable | |
| precision_metros | DECIMAL(6,2) nullable | |
| es_mock | BOOLEAN | resultado del check de spoofing |
| timestamp | TIMESTAMPTZ | clave de partición |

### `Disputa`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| viaje_id | UUID FK → Viaje | |
| reportado_por_usuario_id | UUID FK → Usuario | |
| tipo | TipoDisputa | |
| descripcion | TEXT | |
| estado | EstadoDisputa | |
| resuelto_por_usuario_id | UUID FK → Usuario, nullable | |
| fecha_reporte | TIMESTAMPTZ | |
| fecha_resolucion | TIMESTAMPTZ nullable | |

### `Incidencia` (control de calidad interno)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| viaje_id | UUID FK → Viaje, nullable | |
| conductor_id | UUID FK → Conductor, nullable | |
| reportado_por_usuario_id | UUID FK → Usuario | |
| tipo | TipoIncidencia | |
| severidad | SeveridadIncidencia | |
| descripcion | TEXT | |
| estado | EstadoIncidencia | |
| fecha_reporte | TIMESTAMPTZ | |

### `AuditoriaAccion` (inmutable)
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| usuario_id | UUID FK → Usuario | |
| entidad_afectada | VARCHAR(50) | |
| entidad_id | UUID | |
| accion | AccionAuditoria | |
| valores_anteriores | JSONB | |
| valores_nuevos | JSONB | |
| ip_origen | VARCHAR(45) | |
| fecha_accion | TIMESTAMPTZ | |

### `SesionDispositivo`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| usuario_id | UUID FK → Usuario | |
| tipo_dispositivo | TipoDispositivo | |
| token_push | VARCHAR(500) nullable | FCM/APNs |
| fecha_login | TIMESTAMPTZ | |
| fecha_ultimo_uso | TIMESTAMPTZ | |
| activo | BOOLEAN | |

### `TurnoOperadora`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| operadora_id | UUID FK → Usuario | |
| fecha_inicio | TIMESTAMPTZ | |
| fecha_fin | TIMESTAMPTZ nullable | null = turno abierto |
| estado | EstadoTurno | |
| viajes_atendidos | INTEGER | denormalizado a propósito, ver §5 |

### `Comprobante`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| viaje_id | UUID FK → Viaje, único (1:1) | |
| tipo | TipoComprobante | V1: BOLETO_TRANSPORTE_URBANO |
| serie_numero | VARCHAR(30) nullable | |
| monto | DECIMAL(10,2) | |
| ruc_cliente | VARCHAR(11) nullable | solo si pide factura |
| estado_sunat | EstadoSunat | gancho futuro |
| fecha_emision | TIMESTAMPTZ | |

### `DocumentoVehicular`
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| unidad_id | UUID FK → Unidad, nullable | nullable si es documento del conductor |
| conductor_id | UUID FK → Conductor, nullable | licencia va aquí también |
| tipo | TipoDocumentoVehicular | |
| numero_documento | VARCHAR(50) | |
| fecha_emision | DATE | |
| fecha_vencimiento | DATE | dispara alertas |
| archivo_url | VARCHAR(500) nullable | |
| estado | EstadoDocumento | calculado |

---

## 3. Relaciones (resumen)

- `Usuario` 1:1 `Conductor` (vía `usuario_id`); Operadora/Admin son `Usuario` sin tabla propia (rol basta).
- `Conductor` 1:0..1 `Unidad` (reasignable, vía `conductor_actual_id` en `Unidad`).
- `CategoriaVehiculo` 1:N `Unidad`.
- `Conductor` 1:N `Membresia` (histórico).
- `PuntoDeReferencia` 1:N `Anillo`.
- `Anillo` N:M `CategoriaVehiculo` vía `TarifaAnilloCategoria`.
- `Anillo` 1:N `AjusteSubZona`.
- `VersionTarifario` 1:N `TarifaAnilloCategoria`, `AjusteSubZona`, `Anillo`, `Viaje`.
- `Viaje` N:1 con `Conductor`, `Unidad`, `CategoriaVehiculo`, `Anillo`, `Usuario`(operadora), `TurnoOperadora`.
- `Viaje` 1:N `PropuestaViaje`, `DesgloseTarifa`, `TrackingUbicacion`.
- `Viaje` 1:0..1 `Disputa`, `Comprobante`.
- `Viaje` 1:N `Incidencia` (nullable, también puede ser independiente de un viaje).
- `Usuario` 1:N `AuditoriaAccion`, `SesionDispositivo`, `TurnoOperadora` (si es operadora).
- `Unidad`/`Conductor` 1:N `DocumentoVehicular`.

---

## 4. Normalización — explicación aplicada

- **1NF:** todos los campos son atómicos (ej. `direccion_recojo_texto` es texto libre, pero las coordenadas van en un campo `GEOGRAPHY` separado, no mezcladas).
- **2NF:** no hay dependencias parciales — todas las tablas usan `id` UUID como PK única, así que no hay campos que dependan solo de parte de una clave compuesta.
- **3NF/BCNF:** cada campo no-clave depende únicamente de la PK. Ejemplo: `Unidad.categoria_vehiculo_id` es FK, no se repite `capacidad_pasajeros` dentro de `Unidad` (viviría en `CategoriaVehiculo`, evitando redundancia).

### Denormalizaciones intencionales (y por qué son la decisión correcta, no un error)
1. **`Viaje.tarifa_tentativa` / `Viaje.tarifa_final` como snapshot.** No se recalculan si cambia el tarifario después. Se complementa con `DesgloseTarifa` (línea por línea de cómo se compuso) y `VersionTarifario` (qué reglas estaban vigentes). Esto es preferible a "recalcular siempre" (rompería el histórico si el tarifario cambia) y a event sourcing completo (sobre-ingeniería para este dominio) — es el punto medio correcto.
2. **`Viaje.ruta_recorrida`** guarda la polilínea final del viaje en vez de obligar a escanear millones de filas de `TrackingUbicacion` cada vez que se quiere ver el recorrido de un viaje pasado.
3. **`TurnoOperadora.viajes_atendidos`** es un contador denormalizado (se podría calcular con `COUNT` sobre `Viaje`), pero para el dashboard de turno en tiempo real es más barato mantenerlo actualizado que recalcularlo en cada vista.
4. **`Unidad.alias_legacy`** guarda el identificador original de Zello sin normalizar — es intencional, es un campo de trazabilidad histórica, no de operación.

---

## 5. Decisión ya tomada: eliminación de `calificacion_promedio`

Como el cliente confirmó que las calificaciones se manejan fuera del sistema (Facebook/Google), **no existe** un campo de calificación automática en `Conductor`. Se sustituye por `estado_calidad` (ACTIVO/OBSERVADO/SUSPENDIDO), alimentado manualmente a partir de las `Incidencia` registradas por la central.

---

## 6. Script SQL (PostgreSQL 16 + PostGIS 3.4) — listo para migración inicial

```sql
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==================== ENUMS ====================
CREATE TYPE rol_usuario AS ENUM ('ADMIN','OPERADORA','CONDUCTOR','DEV');
CREATE TYPE estado_usuario AS ENUM ('ACTIVO','INACTIVO','SUSPENDIDO');
CREATE TYPE estado_conductor AS ENUM ('DISPONIBLE','OCUPADO','DESCONECTADO','SUSPENDIDO');
CREATE TYPE estado_viaje AS ENUM ('SOLICITADO','BUSCANDO_UNIDAD','PROPUESTA_ENVIADA','ASIGNADO',
    'EN_CAMINO_RECOJO','INICIADO','EN_CURSO','FINALIZADO','CANCELADO','DISPUTADO');
CREATE TYPE respuesta_propuesta AS ENUM ('PENDIENTE','ACEPTADA','RECHAZADA','EXPIRADA');
CREATE TYPE cancelado_por AS ENUM ('CLIENTE','CONDUCTOR','OPERADORA','SISTEMA');
CREATE TYPE estado_membresia AS ENUM ('VIGENTE','VENCIDA','SUSPENDIDA');
CREATE TYPE periodo_membresia AS ENUM ('SEMANAL','MENSUAL');
CREATE TYPE metodo_pago AS ENUM ('EFECTIVO','TARJETA','BILLETERA_DIGITAL');
CREATE TYPE nombre_categoria_vehiculo AS ENUM ('SEDAN','PROBOX','MINIVAN','SUB');
CREATE TYPE tipo_carga AS ENUM ('NINGUNA','LIVIANA','PESADA');
CREATE TYPE tipo_dispositivo AS ENUM ('ANDROID','IOS','WEB');
CREATE TYPE accion_auditoria AS ENUM ('CREAR','ACTUALIZAR','ELIMINAR','REASIGNAR','SUSPENDER','ACTIVAR','AJUSTAR_TARIFA');
CREATE TYPE tipo_disputa AS ENUM ('TARIFA_INCORRECTA','MAL_SERVICIO','OBJETO_PERDIDO','ABUSO','OTRO');
CREATE TYPE estado_disputa AS ENUM ('ABIERTA','EN_REVISION','RESUELTA','DESCARTADA');
CREATE TYPE tipo_documento_vehicular AS ENUM ('SOAT','CITV','TARJETA_CIRCULACION_TUC','TARJETA_PROPIEDAD','POLIZA','LICENCIA_CONDUCIR');
CREATE TYPE estado_documento AS ENUM ('VIGENTE','POR_VENCER','VENCIDO');
CREATE TYPE tipo_incidencia AS ENUM ('NO_SHOW_CLIENTE','NO_SHOW_CONDUCTOR','DEMORA','QUEJA_CLIENTE','GPS_SOSPECHOSO','AVERIA','OTRO');
CREATE TYPE severidad_incidencia AS ENUM ('BAJA','MEDIA','ALTA');
CREATE TYPE estado_incidencia AS ENUM ('ABIERTA','EN_REVISION','CERRADA');
CREATE TYPE tipo_comprobante AS ENUM ('BOLETO_TRANSPORTE_URBANO','BOLETA_ELECTRONICA','FACTURA_ELECTRONICA');
CREATE TYPE estado_sunat AS ENUM ('NO_APLICA','PENDIENTE','ACEPTADO','RECHAZADO');
CREATE TYPE concepto_tarifa AS ENUM ('BASE_ANILLO','AJUSTE_SUBZONA','RECARGO_CARGA','RECARGO_CLIMA','RECARGO_VIA','RECARGO_EVENTO','AJUSTE_MANUAL');
CREATE TYPE estado_turno AS ENUM ('ABIERTO','CERRADO');

-- ==================== TABLAS BASE ====================
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255),
    rol rol_usuario NOT NULL,
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    mfa_habilitado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultimo_login TIMESTAMPTZ
);

CREATE TABLE categoria_vehiculo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre nombre_categoria_vehiculo NOT NULL UNIQUE,
    capacidad_pasajeros SMALLINT NOT NULL,
    admite_carga BOOLEAN NOT NULL,
    tipo_carga tipo_carga NOT NULL DEFAULT 'NINGUNA',
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE conductor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuario(id),
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL,
    licencia_conducir VARCHAR(30) NOT NULL,
    fecha_vencimiento_licencia DATE NOT NULL,
    foto_url VARCHAR(500),
    estado_operativo estado_conductor NOT NULL DEFAULT 'DESCONECTADO',
    estado_calidad VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE unidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_unidad VARCHAR(20) UNIQUE NOT NULL,
    alias_legacy VARCHAR(50),
    categoria_vehiculo_id UUID NOT NULL REFERENCES categoria_vehiculo(id),
    placa VARCHAR(10) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    anio SMALLINT,
    color VARCHAR(30),
    tiene_camara BOOLEAN NOT NULL DEFAULT FALSE,
    conductor_actual_id UUID REFERENCES conductor(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE membresia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id UUID NOT NULL REFERENCES conductor(id),
    periodo periodo_membresia NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado estado_membresia NOT NULL DEFAULT 'VIGENTE',
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago_membresia VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
    fecha_pago TIMESTAMPTZ
);

CREATE TABLE punto_de_referencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    ubicacion GEOGRAPHY(POINT, 4326) NOT NULL,
    descripcion TEXT
);

CREATE TABLE version_tarifario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descripcion VARCHAR(150) NOT NULL,
    vigente_desde TIMESTAMPTZ NOT NULL DEFAULT now(),
    vigente_hasta TIMESTAMPTZ,
    creado_por_usuario_id UUID NOT NULL REFERENCES usuario(id),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE anillo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    punto_referencia_id UUID NOT NULL REFERENCES punto_de_referencia(id),
    version_tarifario_id UUID NOT NULL REFERENCES version_tarifario(id),
    nombre VARCHAR(50) NOT NULL,
    radio_metros INTEGER,
    poligono GEOGRAPHY(POLYGON, 4326),
    es_referencial BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (radio_metros IS NOT NULL OR poligono IS NOT NULL)
);

CREATE TABLE tarifa_anillo_categoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anillo_id UUID NOT NULL REFERENCES anillo(id),
    categoria_vehiculo_id UUID NOT NULL REFERENCES categoria_vehiculo(id),
    version_tarifario_id UUID NOT NULL REFERENCES version_tarifario(id),
    tarifa_base DECIMAL(10,2) NOT NULL,
    UNIQUE (anillo_id, categoria_vehiculo_id, version_tarifario_id)
);

CREATE TABLE ajuste_subzona (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anillo_id UUID NOT NULL REFERENCES anillo(id),
    version_tarifario_id UUID NOT NULL REFERENCES version_tarifario(id),
    nombre_subzona VARCHAR(100) NOT NULL,
    geometria GEOGRAPHY(POLYGON, 4326),
    monto_ajuste DECIMAL(10,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE turno_operadora (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operadora_id UUID NOT NULL REFERENCES usuario(id),
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    estado estado_turno NOT NULL DEFAULT 'ABIERTO',
    viajes_atendidos INTEGER NOT NULL DEFAULT 0
);

-- ==================== VIAJE Y RELACIONADAS ====================
CREATE TABLE viaje (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    operadora_id UUID NOT NULL REFERENCES usuario(id),
    conductor_id UUID REFERENCES conductor(id),
    unidad_id UUID REFERENCES unidad(id),
    categoria_vehiculo_id UUID NOT NULL REFERENCES categoria_vehiculo(id),
    punto_recojo GEOGRAPHY(POINT, 4326) NOT NULL,
    direccion_recojo_texto VARCHAR(255) NOT NULL,
    punto_destino GEOGRAPHY(POINT, 4326),
    direccion_destino_texto VARCHAR(255),
    anillo_asignado_id UUID REFERENCES anillo(id),
    version_tarifario_id UUID NOT NULL REFERENCES version_tarifario(id),
    tarifa_tentativa DECIMAL(10,2) NOT NULL,
    tarifa_final DECIMAL(10,2),
    distancia_estimada_km DECIMAL(6,2),
    duracion_estimada_min INTEGER,
    ruta_recorrida GEOGRAPHY(LINESTRING, 4326),
    estado estado_viaje NOT NULL DEFAULT 'SOLICITADO',
    metodo_pago metodo_pago NOT NULL DEFAULT 'EFECTIVO',
    motivo_cancelacion TEXT,
    cancelado_por cancelado_por,
    motivo_liberacion TEXT,
    turno_operadora_id UUID REFERENCES turno_operadora(id),
    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_asignacion TIMESTAMPTZ,
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ
);

CREATE TABLE propuesta_viaje (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL REFERENCES viaje(id),
    conductor_id UUID NOT NULL REFERENCES conductor(id),
    orden_intento SMALLINT NOT NULL,
    respuesta respuesta_propuesta NOT NULL DEFAULT 'PENDIENTE',
    timeout_segundos SMALLINT NOT NULL DEFAULT 25,
    fecha_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    fecha_respuesta TIMESTAMPTZ,
    UNIQUE (viaje_id, orden_intento)
);

CREATE TABLE desglose_tarifa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL REFERENCES viaje(id),
    concepto concepto_tarifa NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    detalle VARCHAR(200),
    orden SMALLINT NOT NULL
);

CREATE TABLE disputa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL REFERENCES viaje(id),
    reportado_por_usuario_id UUID NOT NULL REFERENCES usuario(id),
    tipo tipo_disputa NOT NULL,
    descripcion TEXT NOT NULL,
    estado estado_disputa NOT NULL DEFAULT 'ABIERTA',
    resuelto_por_usuario_id UUID REFERENCES usuario(id),
    fecha_reporte TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_resolucion TIMESTAMPTZ
);

CREATE TABLE incidencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID REFERENCES viaje(id),
    conductor_id UUID REFERENCES conductor(id),
    reportado_por_usuario_id UUID NOT NULL REFERENCES usuario(id),
    tipo tipo_incidencia NOT NULL,
    severidad severidad_incidencia NOT NULL DEFAULT 'BAJA',
    descripcion TEXT NOT NULL,
    estado estado_incidencia NOT NULL DEFAULT 'ABIERTA',
    fecha_reporte TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comprobante (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL UNIQUE REFERENCES viaje(id),
    tipo tipo_comprobante NOT NULL DEFAULT 'BOLETO_TRANSPORTE_URBANO',
    serie_numero VARCHAR(30),
    monto DECIMAL(10,2) NOT NULL,
    ruc_cliente VARCHAR(11),
    estado_sunat estado_sunat NOT NULL DEFAULT 'NO_APLICA',
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documento_vehicular (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidad_id UUID REFERENCES unidad(id),
    conductor_id UUID REFERENCES conductor(id),
    tipo tipo_documento_vehicular NOT NULL,
    numero_documento VARCHAR(50) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    archivo_url VARCHAR(500),
    estado estado_documento NOT NULL DEFAULT 'VIGENTE',
    CHECK (unidad_id IS NOT NULL OR conductor_id IS NOT NULL)
);

CREATE TABLE auditoria_accion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(id),
    entidad_afectada VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    accion accion_auditoria NOT NULL,
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    ip_origen VARCHAR(45),
    fecha_accion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sesion_dispositivo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuario(id),
    tipo_dispositivo tipo_dispositivo NOT NULL,
    token_push VARCHAR(500),
    fecha_login TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_ultimo_uso TIMESTAMPTZ NOT NULL DEFAULT now(),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Outbox transaccional (patrón ya decidido en el documento de arquitectura)
CREATE TABLE outbox_events (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

-- ==================== TRACKING_UBICACION — PARTICIONADA POR MES ====================
CREATE TABLE tracking_ubicacion (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    viaje_id UUID REFERENCES viaje(id),
    conductor_id UUID NOT NULL REFERENCES conductor(id),
    ubicacion GEOGRAPHY(POINT, 4326) NOT NULL,
    velocidad_kmh DECIMAL(5,2),
    precision_metros DECIMAL(6,2),
    es_mock BOOLEAN NOT NULL DEFAULT FALSE,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, "timestamp")
) PARTITION BY RANGE ("timestamp");

-- Ejemplo de partición mensual (crear con un job programado o pg_partman)
CREATE TABLE tracking_ubicacion_2026_09 PARTITION OF tracking_ubicacion
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE tracking_ubicacion_2026_10 PARTITION OF tracking_ubicacion
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
-- (agregar particiones futuras con pg_partman o un cron mensual)

-- ==================== ÍNDICES ====================
-- Geoespaciales (GiST — habilita KNN nativo: ORDER BY ubicacion <-> punto LIMIT N)
CREATE INDEX idx_punto_referencia_ubicacion ON punto_de_referencia USING GIST (ubicacion);
CREATE INDEX idx_anillo_poligono ON anillo USING GIST (poligono);
CREATE INDEX idx_ajuste_subzona_geom ON ajuste_subzona USING GIST (geometria);
CREATE INDEX idx_viaje_punto_recojo ON viaje USING GIST (punto_recojo);
CREATE INDEX idx_viaje_punto_destino ON viaje USING GIST (punto_destino);
CREATE INDEX idx_viaje_ruta ON viaje USING GIST (ruta_recorrida);
CREATE INDEX idx_tracking_ubicacion_geo ON tracking_ubicacion USING GIST (ubicacion);

-- FKs y consultas frecuentes
CREATE INDEX idx_conductor_usuario ON conductor(usuario_id);
CREATE INDEX idx_conductor_estado_operativo ON conductor(estado_operativo) WHERE estado_operativo = 'DISPONIBLE';
CREATE INDEX idx_unidad_conductor_actual ON unidad(conductor_actual_id);
CREATE INDEX idx_membresia_conductor ON membresia(conductor_id, estado);
CREATE INDEX idx_viaje_estado ON viaje(estado);
CREATE INDEX idx_viaje_operadora ON viaje(operadora_id);
CREATE INDEX idx_viaje_conductor ON viaje(conductor_id);
CREATE INDEX idx_viaje_turno ON viaje(turno_operadora_id);
CREATE INDEX idx_propuesta_viaje ON propuesta_viaje(viaje_id, orden_intento);
CREATE INDEX idx_desglose_viaje ON desglose_tarifa(viaje_id);
CREATE INDEX idx_tracking_conductor_ts ON tracking_ubicacion(conductor_id, "timestamp" DESC);
CREATE INDEX idx_documento_vencimiento ON documento_vehicular(fecha_vencimiento) WHERE estado != 'VENCIDO';
CREATE INDEX idx_auditoria_entidad ON auditoria_accion(entidad_afectada, entidad_id);
CREATE INDEX idx_outbox_no_publicados ON outbox_events(created_at) WHERE published_at IS NULL;
```

### Ejemplo de la consulta KNN que reemplaza a Haversine en memoria (ya decidida en el documento de arquitectura)
```sql
SELECT c.id, c.nombres, u.numero_unidad,
       t.ubicacion <-> ST_MakePoint(:lng_recojo, :lat_recojo)::geography AS distancia_metros
FROM conductor c
JOIN unidad u ON u.conductor_actual_id = c.id
JOIN LATERAL (
    SELECT ubicacion FROM tracking_ubicacion
    WHERE conductor_id = c.id
    ORDER BY "timestamp" DESC LIMIT 1
) t ON TRUE
WHERE c.estado_operativo = 'DISPONIBLE'
  AND u.categoria_vehiculo_id = :categoria_id
ORDER BY t.ubicacion <-> ST_MakePoint(:lng_recojo, :lat_recojo)::geography
LIMIT 5;
```
En producción, la posición más reciente se lee de **Redis** (caché caliente), no de esta tabla — esta consulta es el fallback/consolidación batch.

---

## Recomendaciones para tus próximos avances
1. Usar este script como base de la primera migración (Fase 0/1) — recomendado con una herramienta de migraciones versionadas (`golang-migrate` o `atlas`, ambas nativas del ecosistema Go).
2. Generar el código de acceso a datos en Go con `sqlc` a partir de este esquema (mantiene el tipado fuerte que se pierde al no compartir dominio con Kotlin).
3. Documentar las reglas de tarifa (la lógica de `CalcularTarifaUseCase`) en un solo lugar de referencia (pseudocódigo o JSON Schema) para que la implementación en Go (backend) y en Kotlin (app conductor, validación local) no diverjan.
4. Automatizar la creación de particiones mensuales de `tracking_ubicacion` con `pg_partman` desde la Fase 1, para no depender de crearlas a mano cada mes.
