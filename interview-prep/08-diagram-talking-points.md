# Diagram Talking Points

> Guía para entrevistas técnicas de system design. Cada sección acompaña un diagrama del archivo `07-experience-cases-diagrams.drawio` y detalla qué mencionar, qué patrones destacar, y cómo responder preguntas de follow-up.

---

## NocNoc — Product Creation Flow (sellers-core)

### Contexto para el entrevistador

"De todos los flujos que maneja sellers-core (creación de productos, órdenes, inventario), voy a enfocarme en la creación de productos porque es el que tiene más complejidad arquitectónica: múltiples canales de entrada, procesamiento asíncrono, integración con un API externo con rate limit, y una máquina de estados para trackear el ciclo de vida."

### Flujo end-to-end

```
Seller
  ├── Public API ──────────┐
  ├── Seller Center (web) ─┤
  ├── SFTP (file uploads) ─┤     ┌──────────┐    ┌─────────────┐    ┌────────────────┐    ┌─────────────┐    ┌─────┐
  └── Shopify ─────────────┼────→│sellers-core├───→│ SQS (product │───→│ product-       │───→│ SQS (amz-   │───→│ amz-│
                           │     │            │    │  creation)   │    │ information    │    │  lookup)    │    │wrap.│
                           │     └────┬───┬───┘    └──────┬───────┘    └───┬────────────┘    └─────────────┘    └──┬──┘
                           │          │   │               │                │                                      │
                           │        [RDS] [DynamoDB]    [DLQ]           [RDS]                               [Redis cache]
                           │    seller-catalog  raw-data             product DB                          [Rate limiter]
                           │          │                                                                       │
                           │     [Timestream]                                                              [Amazon]
                           │      metrics
```

### 1. Adapter Pattern (Ports & Adapters / Hexagonal Architecture)

**Qué decir:** "Cada canal de integración es un adapter que traduce la interfaz específica del canal a las operaciones canónicas de sellers-core. La Public API traduce REST requests, Seller Center traduce acciones de UI, SFTP parsea archivos CSV/Excel, y Shopify traduce webhooks. Sellers-core define los ports (la interfaz del dominio) y los adapters implementan la traducción."

**Por qué importa:**
- Si mañana agregamos un nuevo canal (ej: integración con WooCommerce), implementamos un adapter nuevo sin tocar sellers-core
- La lógica de negocio (validación, máquina de estados, reglas) vive en un solo lugar
- Antes de sellers-core, cada canal tenía su propia validación y lógica — duplicada e inconsistente

**Pregunta de follow-up probable:** "¿Qué diferencias hay entre los adapters?"
- Public API: el seller manda productos uno a uno vía REST, respuesta síncrona con el estado del intento
- Seller Center: la web app llama al seller center api, que actúa como BFF y traduce a sellers-core
- SFTP: el seller sube un archivo, un proceso batch lo parsea y genera N requests a sellers-core
- Shopify: la app de Shopify escucha webhooks de productos y los traduce a sellers-core

### 2. Comunicación asíncrona en dos niveles

**Qué decir:** "Tenemos dos colas SQS en el flujo, y cada una resuelve un problema distinto."

**Primera cola: sellers-core → product-information**
- **Problema:** Desacoplar el canal del seller del procesamiento. El seller necesita respuesta inmediata ("tu producto fue recibido, está en estado PENDING"), no puede quedarse esperando a que Amazon resuelva.
- **Beneficio adicional:** Si product-information se cae, los mensajes persisten en la cola. Sellers-core no se ve afectado.
- **Burst absorption:** Un seller sube 5000 productos por SFTP — sellers-core los encola sin saturar product-information.
- **DLQ:** Los mensajes que fallan después de N reintentos van a la DLQ para análisis posterior. No se pierden.

**Segunda cola: product-information → amz-wrapper**
- **Problema:** Controlar la tasa de requests hacia Amazon. Amazon tiene un rate limit de 10 req/s.
- **Diseño pull-based:** amz-wrapper consume de la cola con concurrencia controlada (max N consumers), garantizando que nunca se exceda el rate limit por diseño.
- **Evolución:** Originalmente product-information llamaba a amz-wrapper síncronamente, con un rate limiter distribuido (Redisson) en amz-wrapper. Pero en picos seguíamos teniendo 429 por thundering herd en los retries. Migramos a un modelo pull-based donde la cola absorbe los picos y el consumer controla la concurrencia.

**Pregunta de follow-up probable:** "¿No alcanzaba con una sola cola?"
- "No, porque son dos bottlenecks distintos. La primera cola absorbe la variabilidad de los sellers (picos de carga impredecibles). La segunda controla la restricción de un servicio externo (Amazon rate limit). Si usáramos una sola cola, tendríamos que elegir entre optimizar para throughput de sellers o para el rate limit de Amazon — y son dos restricciones independientes."

### 3. Rate Limiting y la evolución de la solución

**Qué decir (storytelling de mejora iterativa):**

"Nuestra cuenta de Amazon tiene un rate limit de 10 req/s. La primera solución fue un rate limiter distribuido con Redisson en amz-wrapper, que rechazaba requests excedentes con 429. Product-information hacía retry con exponential backoff. Pero identificamos un problema: en picos de carga, múltiples instancias de product-information hacían retry simultáneamente, generando thundering herd. Los 429 se multiplicaban y el throughput real caía por debajo del rate limit."

"La solución fue invertir el modelo: en vez de push con rate limiting reactivo, pasamos a pull con concurrency control. Product-information encola en SQS, y amz-wrapper consume con un máximo de consumers que respetan el rate limit. El rate limiter con Redisson se mantiene como safety net, pero en operación normal nunca se activa."

**Patrones a mencionar:**
- Rate limiter distribuido (Redisson/Redis) — solución inicial
- Thundering herd problem — por qué la solución inicial no alcanzaba
- Pull-based consumption con concurrency control — solución mejorada
- Cache-aside en Redis para productos recurrentes — reduce las llamadas a Amazon

**Pregunta de follow-up probable:** "¿Cómo responde product-information si amz-wrapper es ahora async?"
- amz-wrapper procesa el mensaje y notifica el resultado (vía SQS de respuesta o callback). Product-information actualiza su DB y sellers-core es notificado del cambio de estado del producto.

### 4. Máquina de estados del producto

**Qué decir:** "Cada intento de creación de producto tiene un ciclo de vida representado como una máquina de estados en la DB relacional de sellers-core."

```
PENDING → SUCCESS
PENDING → NEEDS_INFO (faltan datos requeridos)
PENDING → FAILED (falló la creación en product-information)
PENDING → ERROR (error técnico, se puede reintentar)
```

**Por qué importa:**
- Los Account Managers pueden ver el estado de cada producto en sus dashboards sin escalar a IT
- El seller puede ver el estado en Seller Center
- Las alertas se configuran sobre transiciones de estado (ej: si % de ERROR sube, alerta técnica)

### 5. Correlation ID — Trazabilidad end-to-end

**Qué decir:** "El correlation ID nace en el adapter, no en sellers-core, porque el adapter es el boundary del sistema."

**Cómo se propaga:**
1. **Adapter** genera el correlation ID (UUID) al recibir el request del seller
2. Se envía como **HTTP header** a sellers-core
3. Sellers-core lo guarda en la DB junto al intento de creación
4. Se propaga como **SQS message attribute** a product-information
5. Product-information lo propaga a amz-wrapper (por la segunda SQS)
6. Todos los logs de todos los servicios incluyen el correlation ID

**Por qué arranca en el adapter:**
- Seller Center puede mostrar el correlation ID al seller en la UI
- Si un seller reporta un problema, el Account Manager busca por correlation ID y tiene la traza completa
- La Public API lo devuelve en el response header para que integradores puedan correlacionar con sus sistemas

**Pregunta de follow-up probable:** "¿Y si el seller sube un archivo por SFTP con 5000 productos?"
- "El adapter de SFTP genera un correlation ID por archivo (batch) y un sub-correlation ID por línea/producto. Así podés trazar tanto el batch completo como cada producto individual."

### 6. Observabilidad (Timestream + Dashboards)

**Qué decir:** "Sellers-core envía métricas a Timestream: cantidad de intentos por canal, tasa de éxito/error, latencia de procesamiento. Con eso armamos dashboards diferenciados:"

- **Dashboard de negocio (Account Managers):** % de productos creados exitosamente por seller, productos en NEEDS_INFO, top sellers con errores
- **Dashboard técnico (IT):** Latencia p95 del flujo end-to-end, depth de las colas SQS, tasa de 429 de Amazon, DLQ size

**Por qué importa para la entrevista:** "Pasamos de ser puramente reactivos — enterándonos de problemas cuando el seller se quejaba — a ser proactivos. Las alertas nos notifican antes de que el seller se dé cuenta."

### 7. Storage decisions

**Qué decir:**
- **RDS (seller-catalog):** Datos estructurados del intento de creación — seller ID, estado, timestamps, correlation ID. Necesitamos ACID para las transiciones de estado.
- **DynamoDB (seller-catalog-raw-data):** Metadata variable del producto (cada canal manda datos distintos, esquema flexible). Schema-on-read, no podemos forzar un schema relacional porque la estructura depende del canal y la categoría.
- **Redis:** Cache de productos de Amazon (evita llamadas repetidas) + rate limiter distribuido (safety net).

**Pregunta de follow-up probable:** "¿Por qué no todo en DynamoDB o todo en RDS?"
- "Los intentos de creación son transaccionales (máquina de estados con ACID) — RDS. La metadata del producto es variable y schema-less — DynamoDB. Cada store para lo que hace mejor."

---

### 8. Colas dedicadas por dirección de comunicación

**Qué decir:** "Las colas entre product-information y amz-wrapper son distintas para ida y vuelta. No reutilizamos la misma cola."

**Por qué colas separadas:**
- **Semántica distinta:** El mensaje de ida es "resolvé este producto en Amazon" (contiene el identificador universal). El de vuelta es "acá está el resultado" (contiene la info del producto o el error). Son contratos diferentes.
- **Consumers distintos con necesidades distintas:** La cola de ida la consume amz-wrapper con concurrencia controlada (respetando el rate limit de Amazon). La cola de vuelta la consume product-information sin restricción de rate — queremos procesar respuestas lo más rápido posible para actualizar el estado del producto.
- **Monitoreo independiente:** Si la cola de ida crece, el problema es que Amazon está lento o caído. Si la cola de vuelta crece, el problema es que product-information está saturado. Son señales operacionales distintas que necesitamos alertar por separado.
- **Sin routing logic:** Si usáramos la misma cola, necesitaríamos lógica para distinguir "¿este mensaje es un request o un response?" — complejidad innecesaria.

**Pregunta de follow-up probable:** "¿Por qué no usar un request-reply pattern síncrono con correlation?"
→ "Porque el procesamiento en Amazon puede tardar segundos, y con concurrencia controlada los mensajes pueden quedar encolados. Un request-reply síncrono bloquearía threads de product-information esperando respuesta, reduciendo su capacidad de seguir procesando mensajes de sellers-core. Con colas separadas, product-information encola y sigue trabajando — el resultado llega cuando está listo."

---

### Resumen de patrones para mencionar

| Patrón | Dónde | Por qué |
|--------|-------|---------|
| Ports & Adapters | Canales → sellers-core | Desacoplar canales de la lógica de negocio |
| Async messaging (SQS) | sellers-core → product-info | Desacoplar seller del procesamiento |
| Pull-based rate control | product-info → amz-wrapper | Respetar rate limit por diseño |
| DLQ | Ambas colas | No perder mensajes fallidos |
| Exponential backoff | amz-wrapper → Amazon | Retry en errores transitorios de Amazon |
| Distributed rate limiter | amz-wrapper (Redis) | Safety net para el rate limit |
| Cache-aside | amz-wrapper (Redis) | Evitar llamadas repetidas a Amazon |
| Correlation ID | Desde el adapter | Trazabilidad end-to-end |
| State machine | sellers-core (RDS) | Ciclo de vida del intento de creación |
| Polyglot persistence | RDS + DynamoDB + Redis | Cada store para su caso de uso |
| Dedicated queues per direction | product-info ↔ amz-wrapper | Monitoreo independiente, sin routing logic |

### Preguntas difíciles y cómo responder

**"¿Qué pasa si Amazon está caído por horas?"**
→ "Los mensajes se acumulan en la cola de amz-lookup. Tenemos alarmas sobre el queue depth. Los sellers ven sus productos en estado PENDING. Cuando Amazon vuelve, la cola se drena naturalmente respetando el rate limit. Si la caída es prolongada, la DLQ captura mensajes que exceden el max retries y los reprocesamos manualmente."

**"¿Cómo garantizás idempotencia?"**
→ "Cada intento de creación tiene un ID único (correlation ID + seller ID + product identifier). Product-information checkea si ya existe antes de procesar. Amz-wrapper usa el cache de Redis como lookup antes de ir a Amazon. Si un mensaje se procesa dos veces por un retry, el resultado es el mismo."

**"¿Cómo escala esto?"**
→ "Horizontalmente en cada capa. Los adapters y sellers-core son stateless detrás de load balancers. Las colas SQS escalan automáticamente. Product-information y amz-wrapper escalan en instancias pero con concurrencia controlada en el consumer de la cola de Amazon."

**"¿Qué cambiarías si empezaras de cero?"**
→ Preparar una respuesta personal sobre esto — quizás event sourcing en sellers-core, o un API Gateway unificado para los adapters.
