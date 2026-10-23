# Triaje de hallazgos

Fuente de verdad: [18_hallazgos.csv](../watsolution_web_reportes/18_hallazgos.csv). **47 corregir, 0 aceptados, 0 falsos positivos, 0 duplicados.** Agrupar en una tarea no convierte hallazgos distintos en duplicados. La tarea resuelve una parte cuando un ID tiene varias; solo se cierra al cumplir el criterio completo. No se ejecutaron correcciones.

## Revalidación de Críticas y Altas

No hay Críticas en el CSV. Los diez Altos fueron comprobados nuevamente con lectura de código/historial, sin invocar servicios ni migraciones.

### WS-001

Vigente: portal.controller.ts:24 pasa login y portal.service.ts:30 lo compara con userId/email. person.controller.ts:127 persiste String(savedUser.id). Contener antes de migrar vínculos.

Fuente original: server/src/service/portal.service.ts:25. Destino: T-005, T-016.

### WS-002

Vigente: invoice.controller.ts:105 y :190 guardan copia completa después de S3; invoice.service.ts:90 persiste esa entidad. Confirmación local estática; carrera probada previamente con dobles.

Fuente original: server/src/web/rest/invoice.controller.ts:101. Destino: T-006.

### WS-003

Vigente en historial local: blobs 95cd0a65… y 0ea385d4… siguen accesibles y contienen credenciales literales. Vigencia en proveedor no verificada; no se intentó autenticación. Rotar antes de sanear.

Fuente original: watsolution_web_reportes/evidencias/secretos-historicos-validacion.json:1. Destino: T-003, T-037.

### WS-004

Vigente: person.controller.ts:99–105 crea clave aleatoria y activated=false; account.controller.ts:54,124,137 sigue lanzando 500. No hay entrega funcional de acceso.

Fuente original: server/src/web/rest/person.controller.ts:96. Destino: T-022, T-023, T-024, T-025.

### WS-005

Vigente: bold.service.ts:30–42 lee y escribe referencia sin bloqueo; :61 retorna si referencia desconocida. Corregir asignación, persistir eventos y conciliar cobros históricos.

Fuente original: server/src/service/bold.service.ts:36. Destino: T-009, T-027, T-028.

### WS-006

Vigente: app.vue:8 monta ChatBot; chatbot.vue:26,28 y 53–54 mantienen mensajes e incorporan respuesta sin comprobar identidad. No se repitió navegador en este encargo.

Fuente original: client/src/app/core/chatbot/chatbot.vue:26. Destino: T-007.

### WS-007

Vigente: account-store.ts:39 descarta error; session.controller.ts:23 exige JWT antes de limpiar cookie. No se probaron cookies reales en este encargo.

Fuente original: client/src/app/shared/config/store/account-store.ts:37. Destino: T-008.

### WS-008

Vigente: invoice.service.ts:58–66 y :84–90 guardan DTO sin invariantes financieras. Alcance ADMIN; no equivale a escalada desde usuario común. Contener y luego unificar comandos.

Fuente original: server/src/service/invoice.service.ts:84. Destino: T-011, T-019, T-020, T-021.

### WS-009

Vigente en semilla: SeedUsersRoles.ts:39,44,72–78 tiene credenciales fijas, activa y asigna ADMIN. Existencia en BD real no verificada; no ejecutar semilla para comprobarlo.

Fuente original: server/src/migrations/1570200490072-SeedUsersRoles.ts:37. Destino: T-010.

### WS-014

Vigente: CreateTables.ts:7,11,15 confirma transacción/synchronize y down vacío. No ejecutar contra BD para validar. Conservar historial ya aplicado; nueva baseline explícita.

Fuente original: server/src/migrations/1570200270081-CreateTables.ts:4. Destino: T-002, T-015.

## Decisión por los 47 hallazgos

| ID | Severidad | Acción | Justificación / condición | Tareas |
|---|---|---|---|---|
| WS-001 | Alta | Corregir | Vigente: portal.controller.ts:24 pasa login y portal.service.ts:30 lo compara con userId/email. person.controller.ts:127 persiste String(savedUser.id). Contener antes de migrar vínculos. | T-005, T-016 |
| WS-002 | Alta | Corregir | Vigente: invoice.controller.ts:105 y :190 guardan copia completa después de S3; invoice.service.ts:90 persiste esa entidad. Confirmación local estática; carrera probada previamente con dobles. | T-006 |
| WS-003 | Alta | Corregir | Vigente en historial local: blobs 95cd0a65… y 0ea385d4… siguen accesibles y contienen credenciales literales. Vigencia en proveedor no verificada; no se intentó autenticación. Rotar antes de sanear. | T-003, T-037 |
| WS-004 | Alta | Corregir | Vigente: person.controller.ts:99–105 crea clave aleatoria y activated=false; account.controller.ts:54,124,137 sigue lanzando 500. No hay entrega funcional de acceso. | T-022, T-023, T-024, T-025 |
| WS-005 | Alta | Corregir | Vigente: bold.service.ts:30–42 lee y escribe referencia sin bloqueo; :61 retorna si referencia desconocida. Corregir asignación, persistir eventos y conciliar cobros históricos. | T-009, T-027, T-028 |
| WS-006 | Alta | Corregir | Vigente: app.vue:8 monta ChatBot; chatbot.vue:26,28 y 53–54 mantienen mensajes e incorporan respuesta sin comprobar identidad. No se repitió navegador en este encargo. | T-007 |
| WS-007 | Alta | Corregir | Vigente: account-store.ts:39 descarta error; session.controller.ts:23 exige JWT antes de limpiar cookie. No se probaron cookies reales en este encargo. | T-008 |
| WS-008 | Alta | Corregir | Vigente: invoice.service.ts:58–66 y :84–90 guardan DTO sin invariantes financieras. Alcance ADMIN; no equivale a escalada desde usuario común. Contener y luego unificar comandos. | T-011, T-019, T-020, T-021 |
| WS-009 | Alta | Corregir | Vigente en semilla: SeedUsersRoles.ts:39,44,72–78 tiene credenciales fijas, activa y asigna ADMIN. Existencia en BD real no verificada; no ejecutar semilla para comprobarlo. | T-010 |
| WS-010 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-019, T-038, T-039 |
| WS-011 | Media | Corregir | Corregir sink inseguro; alcance demostrado de propia cuenta. No afirmar ataque entre víctimas. | T-012 |
| WS-012 | Media | Corregir | Inspección del borde desplegado previa a aplicar cabeceras; ausencia local no prueba ausencia en proveedor. | T-033 |
| WS-013 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-029 |
| WS-014 | Alta | Corregir | Vigente: CreateTables.ts:7,11,15 confirma transacción/synchronize y down vacío. No ejecutar contra BD para validar. Conservar historial ya aplicado; nueva baseline explícita. | T-002, T-015 |
| WS-015 | Media | Corregir | Relaciones del repositorio sin FK; cotejar esquema vivo antes de crear migración. | T-016, T-017 |
| WS-016 | Media | Corregir | Acordar reglas de unicidad y verificar índices externos; no borrar duplicados automáticamente. | T-018 |
| WS-017 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-026 |
| WS-018 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-043, T-045, T-046 |
| WS-019 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-047, T-048 |
| WS-020 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-047, T-049 |
| WS-021 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-038, T-039 |
| WS-022 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-040, T-041 |
| WS-023 | Baja | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-040 |
| WS-024 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-042 |
| WS-025 | Media | Corregir | Cerrar presentación engañosa con datos reales de actividad y telemetría deshabilitada/sin fuente. La integración física de sensores es otro alcance, no requisito para dejar de mostrar datos ficticios. | T-013, T-050 |
| WS-026 | Baja | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-054 |
| WS-027 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-030 |
| WS-028 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-051 |
| WS-029 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-052 |
| WS-030 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-053 |
| WS-031 | Baja | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-071 |
| WS-032 | Baja | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-072 |
| WS-033 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-055, T-061 |
| WS-034 | Media | Corregir | Deprecated no equivale a CVE. Escaneo vigente es una condición de cierre, no un cero supuesto. | T-056, T-057, T-058, T-059, T-060, T-061 |
| WS-035 | Baja | Corregir | Licencias inconsistentes requieren decisión del titular; no se presume incompatibilidad comercial. | T-073 |
| WS-036 | Media | Corregir | Primero escoger topología. Corregir las admitidas y retirar/documentar las descartadas, no mantener tres despliegues sin propietario. | T-031 |
| WS-037 | Media | Corregir | Aplica a Nginx separado. Si se retira esa topología, demostrar ausencia de uso y documentar retiro como corrección de configuración obsoleta. | T-034 |
| WS-038 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-032 |
| WS-039 | Media | Corregir | Confirmar operación y responsable legal antes de publicar; código por sí solo no confirma contratos ni regiones. | T-062, T-063 |
| WS-040 | Media | Corregir | Revisar autorizaciones físicas y base por finalidad; no imponer consentimiento opcional como condición de login. | T-062, T-064, T-065 |
| WS-041 | Media | Corregir | Comprobar purgas externas y preservar anti-replay/idempotencia. No asumir que toda expiración exige eliminación instantánea. | T-062, T-066 |
| WS-042 | Media | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-004, T-035, T-069, T-077 |
| WS-043 | Media | Corregir | 224 pruebas previas son evidencia histórica de unitarias, no resultado nuevo ni cobertura porcentual. | T-001, T-004, T-014, T-036, T-070, T-076 |
| WS-044 | Media | Corregir | 27.591 errores de lint no son 27.591 vulnerabilidades; separar formato de cambios funcionales. | T-067, T-068 |
| WS-045 | Baja | Corregir | Evidencia de auditoría conservada; defecto concreto con corrección y prueba definida. Revalidación profunda y cierre durante implementación. | T-074 |
| WS-046 | Baja | Corregir | Solo retirar alternativas no montadas; no presentar el archivo de pago simulado como checkout activo. | T-075 |
| WS-047 | Media | Corregir | Error de visualización verificado; hora de inicio de mora debe acordarse con negocio. | T-043, T-044 |

## Agrupación y divisiones

- WS-010/021 comparten contrato por entidad: T-038 financieros y T-039 resto; no activar validación global antes de adaptar consumidores.
- WS-022/023 comparten paginación T-040; optimización N+1 queda separada T-041 y UI T-042.
- WS-018/047 comparten definiciones T-043; calendario y agregados se implementan en tareas distintas.
- WS-019/020 comparten outbox T-047; entrega y cron separados.
- WS-033/034 comparten retiro final de compat T-061; migración dividida por familias con contrato y regresión.
- Altas, migraciones, pagos y acceso se dividen en contención, cambios aditivos y validación para no disfrazar una épica como tarea de tres días.

## Puntuación de las tareas

L y B son estimaciones visibles, no hechos medidos. D cuenta dependencias directas, E premia menor esfuerzo. Regla exacta en supuestos.

| Tarea | S | L | B | D | E | Puntos | Prioridad | Regla |
|---|---:|---:|---:|---:|---:|---:|---|---|
| T-001 | 3 | 2 | 4 | 3 | 2.40 | 58.8 | P0 | Regla de preparación/contención |
| T-002 | 4 | 3 | 5 | 3 | 1.50 | 73 | P0 | Regla de preparación/contención |
| T-003 | 4 | 4 | 5 | 3 | 2.00 | 78 | P0 | Regla de preparación/contención |
| T-004 | 3 | 3 | 4 | 3 | 2.00 | 62 | P0 | Regla de preparación/contención |
| T-005 | 4 | 4 | 5 | 3 | 2.00 | 78 | P0 | Regla de preparación/contención |
| T-006 | 4 | 4 | 5 | 1 | 2.40 | 74.8 | P0 | Regla de preparación/contención |
| T-007 | 4 | 4 | 5 | 1 | 3.00 | 76 | P0 | Regla de preparación/contención |
| T-008 | 4 | 4 | 5 | 3 | 1.50 | 77 | P0 | Regla de preparación/contención |
| T-009 | 4 | 4 | 5 | 2 | 1.50 | 75 | P0 | Regla de preparación/contención |
| T-010 | 4 | 3 | 5 | 3 | 2.40 | 74.8 | P0 | Regla de preparación/contención |
| T-011 | 4 | 4 | 5 | 1 | 2.40 | 74.8 | P0 | Regla de preparación/contención |
| T-012 | 3 | 2 | 3 | 1 | 3.00 | 52 | P2 | Umbral de puntuación |
| T-013 | 3 | 5 | 4 | 2 | 3.00 | 70 | P1 | Umbral de puntuación |
| T-014 | 3 | 3 | 5 | 3 | 1.20 | 64.4 | P0 | Regla de preparación/contención |
| T-015 | 4 | 3 | 5 | 3 | 1.20 | 72.4 | P1 | Piso Alta = P1 |
| T-016 | 4 | 3 | 5 | 2 | 1.20 | 70.4 | P1 | Piso Alta = P1 |
| T-017 | 3 | 3 | 4 | 3 | 1.50 | 61 | P2 | Umbral de puntuación |
| T-018 | 3 | 3 | 5 | 3 | 1.50 | 65 | P1 | Umbral de puntuación |
| T-019 | 4 | 4 | 5 | 3 | 1.20 | 76.4 | P1 | Piso Alta = P1 |
| T-020 | 4 | 3 | 5 | 3 | 1.50 | 73 | P1 | Piso Alta = P1 |
| T-021 | 4 | 3 | 5 | 3 | 1.20 | 72.4 | P1 | Piso Alta = P1 |
| T-022 | 4 | 3 | 5 | 2 | 1.20 | 70.4 | P1 | Piso Alta = P1 |
| T-023 | 4 | 3 | 4 | 2 | 1.20 | 66.4 | P1 | Piso Alta = P1 |
| T-024 | 4 | 3 | 5 | 1 | 1.20 | 68.4 | P1 | Piso Alta = P1 |
| T-025 | 4 | 3 | 4 | 3 | 1.50 | 69 | P1 | Piso Alta = P1 |
| T-026 | 3 | 3 | 4 | 2 | 1.50 | 59 | P2 | Umbral de puntuación |
| T-027 | 4 | 4 | 5 | 1 | 1.20 | 72.4 | P1 | Piso Alta = P1 |
| T-028 | 4 | 4 | 5 | 3 | 1.20 | 76.4 | P1 | Piso Alta = P1 |
| T-029 | 3 | 4 | 4 | 2 | 1.50 | 63 | P2 | Umbral de puntuación |
| T-030 | 3 | 3 | 4 | 2 | 2.00 | 60 | P2 | Umbral de puntuación |
| T-031 | 3 | 3 | 4 | 3 | 1.20 | 60.4 | P2 | Umbral de puntuación |
| T-032 | 3 | 3 | 4 | 3 | 2.00 | 62 | P2 | Umbral de puntuación |
| T-033 | 3 | 3 | 4 | 1 | 2.00 | 58 | P2 | Umbral de puntuación |
| T-034 | 3 | 3 | 3 | 1 | 3.00 | 56 | P2 | Umbral de puntuación |
| T-035 | 3 | 3 | 4 | 3 | 1.50 | 61 | P2 | Umbral de puntuación |
| T-036 | 3 | 4 | 5 | 2 | 1.20 | 66.4 | P1 | Umbral de puntuación |
| T-037 | 4 | 3 | 5 | 1 | 2.00 | 70 | P1 | Piso Alta = P1 |
| T-038 | 3 | 3 | 4 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-039 | 3 | 3 | 4 | 2 | 1.20 | 58.4 | P2 | Umbral de puntuación |
| T-040 | 3 | 4 | 3 | 2 | 2.00 | 60 | P2 | Umbral de puntuación |
| T-041 | 3 | 4 | 3 | 2 | 1.50 | 59 | P2 | Umbral de puntuación |
| T-042 | 3 | 4 | 3 | 2 | 1.50 | 59 | P2 | Umbral de puntuación |
| T-043 | 3 | 4 | 4 | 3 | 2.40 | 66.8 | P1 | Umbral de puntuación |
| T-044 | 3 | 4 | 4 | 2 | 2.00 | 64 | P2 | Umbral de puntuación |
| T-045 | 3 | 4 | 4 | 2 | 1.50 | 63 | P2 | Umbral de puntuación |
| T-046 | 3 | 4 | 4 | 1 | 1.50 | 61 | P2 | Umbral de puntuación |
| T-047 | 3 | 3 | 4 | 1 | 1.20 | 56.4 | P2 | Umbral de puntuación |
| T-048 | 3 | 3 | 4 | 2 | 1.50 | 59 | P2 | Umbral de puntuación |
| T-049 | 3 | 4 | 4 | 1 | 1.50 | 61 | P2 | Umbral de puntuación |
| T-050 | 3 | 4 | 3 | 1 | 2.00 | 58 | P2 | Umbral de puntuación |
| T-051 | 3 | 4 | 3 | 1 | 2.40 | 58.8 | P2 | Umbral de puntuación |
| T-052 | 3 | 4 | 3 | 2 | 1.50 | 59 | P2 | Umbral de puntuación |
| T-053 | 3 | 4 | 3 | 1 | 2.40 | 58.8 | P2 | Umbral de puntuación |
| T-054 | 2 | 3 | 2 | 2 | 3.00 | 46 | P2 | Umbral de puntuación |
| T-055 | 3 | 3 | 3 | 1 | 1.50 | 53 | P2 | Umbral de puntuación |
| T-056 | 3 | 3 | 4 | 3 | 2.00 | 62 | P2 | Umbral de puntuación |
| T-057 | 3 | 3 | 3 | 1 | 1.20 | 52.4 | P2 | Umbral de puntuación |
| T-058 | 3 | 3 | 3 | 2 | 1.20 | 54.4 | P2 | Umbral de puntuación |
| T-059 | 3 | 3 | 4 | 1 | 1.20 | 56.4 | P2 | Umbral de puntuación |
| T-060 | 3 | 3 | 4 | 1 | 1.20 | 56.4 | P2 | Umbral de puntuación |
| T-061 | 3 | 3 | 4 | 3 | 1.50 | 61 | P2 | Umbral de puntuación |
| T-062 | 3 | 3 | 4 | 3 | 2.00 | 62 | P2 | Umbral de puntuación |
| T-063 | 3 | 3 | 4 | 2 | 2.40 | 60.8 | P2 | Umbral de puntuación |
| T-064 | 3 | 3 | 4 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-065 | 3 | 3 | 4 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-066 | 3 | 3 | 4 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-067 | 3 | 5 | 2 | 1 | 2.00 | 58 | P2 | Umbral de puntuación |
| T-068 | 3 | 4 | 3 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-069 | 3 | 3 | 4 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-070 | 3 | 3 | 4 | 3 | 1.50 | 61 | P2 | Umbral de puntuación |
| T-071 | 2 | 4 | 2 | 2 | 3.00 | 50 | P2 | Umbral de puntuación |
| T-072 | 2 | 3 | 2 | 1 | 1.50 | 41 | P3 | Umbral de puntuación |
| T-073 | 2 | 3 | 3 | 1 | 2.00 | 46 | P2 | Umbral de puntuación |
| T-074 | 2 | 4 | 3 | 1 | 1.50 | 49 | P2 | Umbral de puntuación |
| T-075 | 2 | 3 | 2 | 1 | 2.00 | 42 | P3 | Umbral de puntuación |
| T-076 | 3 | 3 | 4 | 1 | 1.50 | 57 | P2 | Umbral de puntuación |
| T-077 | 3 | 3 | 4 | 0 | 1.50 | 55 | P2 | Umbral de puntuación |
