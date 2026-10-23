# Estrategia de pruebas y verificación

**Comandos propuestos para una implementación futura. Ninguno se ejecutó al redactar este plan.** Trabajar en rama/checkout de implementación y staging descartable, nunca contra producción ni dentro de la carpeta de reportes históricos. Guardar evidencia nueva en artifacts del CI, con commit, versión, datos sintéticos, comando, exit code, resultado y revisor. El hash inicial permite distinguir evidencia anterior de evidencia nueva.

## Línea base disponible

42 pruebas Jest / 9 suites y 182 pruebas Vitest / 36 archivos aprobadas en auditoría. Backend tsc y Vite aprobados. Lint: 4.469 errores/15 advertencias backend y 23.122 errores/56 advertencias cliente, principalmente formato. Cobertura porcentual, E2E real, carga, Lighthouse y CVE actuales desconocidos. No usar umbrales de config como resultados medidos ni ejecutar npm test raíz (solo echo). Los pretest de workspaces ejecutan lint; una falla de lint no significa que se hayan ejecutado unitarias.

## Catálogo de verificación

Los códigos Q-* del CSV y fichas se resuelven aquí. Todos los comandos parten de la raíz del checkout de implementación, salvo cambios de directorio explícitos. En PowerShell usar npm.cmd si la política de ejecución impide npm.ps1. Requisitos: usar el runtime de la línea base T-004 en F0/F1; T-031 unificará después contenedores/CI; herramientas fijadas por lock, secretos de prueba inyectados sin imprimir, URL staging validada y destinatarios de correo sandbox.

### Q-UNIT, Q-TYPE, Q-LINT y Q-BUILD — herramientas actuales

```powershell
node node_modules/typescript/bin/tsc -p server/tsconfig.build.json --noEmit
node node_modules/jest/bin/jest.js --config server/package.json --runInBand --coverage
npm.cmd run lint --workspace server -- --no-cache
npm.cmd run lint --workspace client -- --no-cache
Push-Location client
node ../node_modules/vitest/vitest.mjs run --coverage
Pop-Location
npm.cmd run vite-build --workspace client
```

Estos comandos de implementación pueden crear coverage/build/caches; por eso no se ejecutan durante planificación. Alinear destino y retención en CI, sin apuntar a reportes históricos. Build frontend con config real limpia; el build auditado usó wrapper y es una línea base aproximada, no comparación binaria si cambia configuración. Tras T-068: `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p client/tsconfig.json`; vue-tsc no está declarado actualmente y debe incorporarse de forma compatible antes de invocarlo.

### Q-API — integración PostgreSQL con guardas reales

T-014 debe crear config y entorno aislados; este comando **no existe como flujo listo hoy**:

```powershell
node node_modules/jest/bin/jest.js --config server/e2e/jest.postgres.config.cjs --runInBand
```

El runner exige host/base de lista permitida y fixtures sintéticos; cancela si falta la marca de entorno o apunta a producción. No reutilizar sin adaptación AppModule + SQLite ni sustituir AuthGuard/RolesGuard. No ejecutar scripts antiguos de synchronize/teardown -v para preparar pruebas. Dobles admitidos para red de S3/correo/Bold; transacciones, locks, JWT, cookies y permisos deben ser reales. Cada corrección aporta su prueba específica en sus horas estimadas.

### Q-UI y Q-A11Y — navegador real

T-014 incorpora el runner mínimo y T-036 amplía viajes; usar runner de navegador fijado (propuesta: Playwright) y configuración HTTPS; T-051 añade verificación automatizada accesible (propuesta: axe). Herramientas no declaradas hoy: instalación solo durante implementación autorizada. Comandos después de crearlos:

```powershell
node node_modules/playwright/cli.js test --config client/e2e/playwright.config.ts
node node_modules/playwright/cli.js test --config client/e2e/playwright.config.ts --grep accesibilidad
```

Matriz propuesta: Chromium escritorio y móvil, Firefox y WebKit; confirmar dispositivos del negocio. Añadir recorrido manual NVDA/teclado: nombre del campo, lectura de error, Tab/Shift-Tab/Escape, retorno de foco, tabla equivalente a gráfico, zoom y contraste medido. Cero errores automáticos no certifica WCAG. Nunca inyectar datos reales de clientes en capturas o reportes.

### Q-AUDIT y Q-SECRET — inventario y secretos

Q-AUDIT requiere resolver el permiso pendiente de envío de metadata al registro público, o entregar un informe equivalente de un servicio aprobado. Una respuesta de red fallida no se cuenta como cero alertas. Comandos futuros:

```powershell
npm.cmd audit --omit=dev --json --audit-level=high > artifacts/audit-runtime.json
npm.cmd audit --json > artifacts/audit-completo.json
```

Registrar exit code y distinguir alertas de vulnerabilidad de fallos del servicio; revisar alcanzabilidad y árbol runtime/dev. No ejecutar audit fix indiscriminado. Versiones nuevas se eligen al ejecutar T-056, con documentación primaria vigente.

Q-SECRET: T-037 selecciona/fija escáner de secretos local. Ejemplo sujeto a la versión elegida: `gitleaks git --redact --report-format json --report-path artifacts/secret-scan.json .`. El reporte debe estar siempre enmascarado. La ausencia de un secreto en Git no demuestra su revocación: T-003 necesita comprobante del proveedor y rechazo de claves/sesiones antiguas. Nunca imprimir blobs históricos ni usar contraseñas de producción en parámetros/logs.

### Q-HEADERS, Q-SOCKET, Q-HEALTH y Q-METRICS — servicios desplegados

STAGING_URL se establece con la URL HTTPS aprobada, sin credenciales. Las rutas de health/metrics son **contratos nuevos propuestos** por T-035/T-069; un 404 previo no es un resultado de cierre.

```powershell
curl.exe --silent --show-error --head "$env:STAGING_URL/"
curl.exe --silent --show-error --head "$env:STAGING_URL/api/public/noticias"
curl.exe --silent --show-error "$env:STAGING_URL/socket.io/?EIO=4&transport=polling"
curl.exe --silent --show-error --fail "$env:STAGING_URL/management/health/live"
curl.exe --silent --show-error --fail "$env:STAGING_URL/management/health/ready"
```

Q-SOCKET añade conexión socket.io-client y reconexión a /tank desde navegador atravesando Nginx; polling por curl no prueba upgrade. Q-HEALTH corta acceso a DB solo en sandbox y comprueba readiness 503/liveness estable. Q-METRICS consulta /management/prometheus desde red interna o cliente autorizado, verifica formato/scrape y dispara alerta sintética al canal acordado; no exponer secretos en línea de comandos. Q-HEADERS incluye respuesta real de HTML, API y archivos privados, cookies y reportes CSP; curl solo no valida ejecución del checkout.

### Q-PERF y Q-SEO — mediciones comparables

T-004 fija dispositivo, red, carga y dataset; T-055 incorpora Lighthouse fijado si no está disponible. Propuesta de comando, después de instalación y con artifacts creado:

```powershell
node node_modules/lighthouse/cli/index.js "$env:STAGING_URL/" --output=json --output-path=artifacts/lighthouse-home.json --chrome-flags="--headless"
curl.exe --silent --show-error --fail "$env:STAGING_URL/robots.txt"
curl.exe --silent --show-error --fail "$env:STAGING_URL/manifest.webapp"
curl.exe --silent --show-error --fail "$env:STAGING_URL/sitemap.xml"
```

Repetir Lighthouse tres veces y usar mediana con misma versión/configuración. No confundir puntuación de laboratorio con Core Web Vitals de campo. Revisar HTML sin JS para metadatos/canonical, status real 404 y que manifest/robots no sean fallback HTML. Carga propuesta: 20 usuarios virtuales durante 5 min, datos sintéticos y cuotas seguras, con herramienta fijada en T-041; validar que ese escenario represente uso real. Registrar p50/p95, error rate, consultas SQL por página, CPU y memoria. Los JMX existentes pueden escribir datos: no ejecutarlos sin adaptación al entorno aislado.

### Q-DB y Q-RESTORE — datos y cambios de esquema

Antes/después: exportación de esquema, tablas/FK/índices, conteos, importes, registros ambiguos, tiempos de bloqueo, migraciones aplicadas y versión. EXPLAIN sobre consultas de lectura; ANALYZE solo sobre SELECT permitido y sin carga de producción. Migración y rollback se ensayan en clon aislado, con comportamiento de versión de aplicación anterior y nueva. No inventar un comando de migración operativo basado en scripts legacy. T-015 debe publicar su runner y comando exacto validado.

Q-RESTORE usa mecanismo del proveedor validado y, si la copia es pg_dump, cliente PostgreSQL compatible. Ejemplo solo en destino aislado identificado por un servicio local seguro:

```powershell
pg_restore --list "copia-cifrada-previamente-descifrada-en-destino-seguro.dump"
pg_restore --dbname="service=watsolution_restore_aislado" --no-owner "copia-cifrada-previamente-descifrada-en-destino-seguro.dump"
```

El servicio debe apuntar exclusivamente al clon autorizado; las credenciales vienen del gestor, no del documento. Listar un archivo no es probar restore: comprobar arranque, conteos, integridad y saldos, acceso a PDF/bucket y objetivos RPO/RTO. No destruir volúmenes de producción ni restaurar toda una BD con pagos nuevos sin conciliación.

### Q-CONFIG, Q-IMAGE, Q-CI, Q-DOC y Q-CIERRE

Q-CONFIG: `docker compose -f docker/app.yml config --quiet` tras T-032 y smoke positivo/negativo; no imprimir config expandida con secretos. Q-IMAGE: `docker build -f Dockerfile -t watsolution:revision .` para la topología elegida después de T-031; ejecutar smoke de imagen sin root y comparar versiones con lock. Build por sí solo no demuestra funcionamiento.

Q-CI: ejecutar pipeline completo en PR de implementación, guardar enlace/run-id, artefactos y demostrar que una regresión sintética bloquea merge; no enviar mensajes a terceros desde esta planificación. Q-DOC: revisión por persona distinta, con lista de evidencias y decisiones firmadas. Q-CIERRE: matriz ID→commit→prueba→resultado→revisor→fecha, con fallo que reabre el hallazgo y sin aceptación implícita.

## Matriz de regresión por fase

| Fase | Regresión y pruebas nuevas | Evidencia / puerta |
|---|---|---|
| F0 | Unitarias existentes, compilación, restore, rotación y mediciones iniciales | T-001–004, actas y baseline; no código nuevo |
| F1 | Dos cuentas, PDF/pago intercalado, referencia concurrente, logout expirado, chat entre cuentas, semilla y HTML | Prueba negativa/positiva por T-005–013; sin fuga ni cambio financiero indebido |
| F2 | Migración, FK, unicidad, alta transaccional, invitación/reset, ledger/conciliación, permisos, proxy/cabeceras/health | PostgreSQL y navegador reales; T-036 más evidencias operativas de secretos |
| F3 | DTO/PUT, paginación completa, métricas/fechas, outbox/cron, UI migrada, consentimiento/purga, a11y/carga | CI T-070; métricas acordadas y evidencia por Medio |
| F4 | Recursos SEO/404, licencias, onboarding independiente, imports/rutas y restore de incidentes | T-076/T-077; 47 IDs revisados y riesgos residuales asignados |

## Prueba específica de cada tarea

La siguiente tabla complementa los comandos; el CSV conserva el criterio completo.

| Tarea | Método específico | Aceptación principal |
|---|---|---|
| T-001 | Q-DOC: cotejar hashes y destinos; revisión de accesos con dueño del servicio. No copiar PII a staging. | Inventario firmado y cada acceso de staging separado de producción; Responsable y sustituto asignados por área; exclusiones y topología documentadas |
| T-002 | Q-RESTORE: acta de restauración con destino, hashes, conteos e importes conciliados; no usar scripts down -v del repo. | Restauración independiente demostrada y accesos comprobados; Inventario de datos, última copia, RPO/RTO objetivo y tiempos medidos aprobados |
| T-003 | Q-SECRET: comprobar versiones del proveedor y sesión de prueba; no imprimir claves ni contraseñas. | Cada credencial histórica tiene evidencia de revocación o de que nunca se desplegó; Token firmado con clave anterior y refresh revocado son rechazados; aplicación usa credencial nueva |
| T-004 | Q-UNIT, Q-TYPE, Q-BUILD, Q-LINT y Q-PERF; no ejecutar E2E heredado que migra BD. | 224 pruebas previas reproducidas o diferencias explicadas; Cobertura, latencia, errores y bundle tienen medición o bloqueo identificado; ningún dato desconocido se registra como cero |
| T-005 | Q-UNIT y Q-API: prueba real con guardas; fijar caso del probe WS-001 en suite de integración. | Cuenta 99 con login 42 nunca recibe datos del propietario 42; Cuenta válida sigue accediendo; vínculo ambiguo produce respuesta controlada sin PII |
| T-006 | Q-UNIT y Q-API: carrera reproducible con barreras; PostgreSQL requerido para cierre final. | PAID y boldTransactionId sobreviven a PDF concurrente en ambos endpoints; Error S3 no cambia estado financiero y se distingue de factura inexistente |
| T-007 | Q-UI: componente montado desde router y navegador con dos cuentas sintéticas. | Tras logout/login no hay mensajes ni PII de la sesión anterior; Respuesta tardía de otra sesión no se representa |
| T-008 | Q-API y Q-UI: cookie Secure/HttpOnly real sobre HTTPS, vencimiento de JWT, múltiples pestañas y red caída. | JWT vencido más refresh válido permite salir y el refresh queda inutilizable; Recarga y otra pestaña no restauran sesión revocada; origen ajeno no revoca ni renueva |
| T-009 | Q-API: barrera de concurrencia con PostgreSQL y aserción de unicidad; mantener firma existente. | 20 solicitudes concurrentes obtienen una única referencia estable e importe consistente; Factura no pagable no genera orden |
| T-010 | Q-API y Q-SECRET: matriz de cuentas por entorno sin contraseñas; ensayo de bootstrap en base vacía. | No existen cuentas de ejemplo activas o se aporta evidencia de ausencia; Bootstrap real no crea contraseñas fijas y conserva un administrador verificado |
| T-011 | Q-API: matriz POST/PUT/DELETE en pendientes, con orden y pagadas; comprobar frontend administrativo. | ADMIN no puede alterar una factura pagada ni cambiar una referencia activa por CRUD; Emisión canónica permanece disponible; denegaciones tienen mensaje claro |
| T-012 | Q-UI: payload sintético inerte y aserción de DOM; comprobar ambos componentes. | Cadena HTML se muestra literalmente y no crea elementos activos; Ajustes y cambio de contraseña siguen funcionando en español |
| T-013 | Q-UI: inspección de pantalla y mensajes Socket.IO en perfiles demo y producción. | Ningún dato aleatorio o fijo se presenta como actividad o telemetría real; Ausencia de sensor produce estado explícito, no porcentaje inventado |
| T-014 | Q-API: implementar config server/e2e/jest.postgres.config.cjs y guard de destino; ejecutar smoke de login/propiedad. | Suite no puede apuntar a producción; guardas no se sustituyen; Limpieza afecta solo base descartable y fallo de destino cancela ejecución |
| T-015 | Q-DB: diff de esquema antes/después y repetición idempotente; restore T-002 disponible. | Nueva base y clon existente llegan al mismo esquema esperado sin synchronize; No se reescribe a ciegas historial aplicado; rollback compatible ensayado y documentado |
| T-016 | Q-DB y Q-API: conciliación por conteos y revisión humana; no inferir dueño solo por correo/login. | Cada vínculo ambiguo tiene resolución aprobada o cuenta restringida sin fuga; Cero asignaciones cruzadas en muestra y prueba exhaustiva de restricciones |
| T-017 | Q-DB: catálogo FK, datos previos, borrado y rollback con versión anterior compatible. | Insertar referencia inexistente falla sin dejar huérfanos; No se eliminan facturas ni datos sujetos a retención al borrar cuenta |
| T-018 | Q-DB: duplicados preflight, catálogo, EXPLAIN y carga concurrente de escrituras. | Duplicado de lectura/referencia se rechaza con conflicto controlado; Historial y sesiones usan índices previstos; no hay bloqueo superior al presupuesto acordado |
| T-019 | Q-API y Q-UNIT: matriz de todos los endpoints de factura y propiedades del cálculo en centavos. | Ninguna ruta acepta importe calculado por cliente como autoridad; Dos canales generan el mismo saldo; pagadas y con orden no admiten edición incompatible |
| T-020 | Q-API: dos capturas concurrentes, edición retroactiva y corrección autorizada. | Lectura menor o fuera de secuencia no corrompe consumo; ADMIN y móvil aplican la misma regla y una lectura facturada no se borra |
| T-021 | Q-API y Q-UI: pago manual duplicado, rol no permitido y ajuste/reverso conciliados. | Repetir una operación no duplica abono; Toda modificación de saldo tiene evento, actor y motivo; no permite ocultar una referencia de pasarela |
| T-022 | Q-API: token válido, inválido, replay y carrera; Q-DB para migración de tabla nueva. | Token vencido/reutilizado/otro propósito no activa cuenta; Dos consumos simultáneos solo permiten una activación; secreto nunca se guarda en claro |
| T-023 | Q-API: adaptador de correo y buzón sandbox; comprobar rebote, retry y enlace de host permitido. | Cuenta nueva recibe enlace funcional en buzón de pruebas; Fallo de proveedor muestra estado pendiente recuperable sin duplicar usuario ni enviar claves |
| T-024 | Q-API: correo existente/no existente, límites, replay, reset concurrente y revocación. | Usuario sin sesión recupera acceso y sus sesiones previas quedan revocadas; Respuesta no revela existencia de cuenta; token de activación no sirve para reset |
| T-025 | Q-UI: viaje de alta a reset en navegador y pruebas de componentes usados por router. | Nuevo suscriptor establece clave, entra, sale y recupera sin asistencia técnica; Textos y errores reflejan límites reales; no hay pantallas de éxito ficticias |
| T-026 | Q-API: fault injection en cada escritura y documento/correo duplicados. | Fallo tras cualquiera de las tres escrituras deja cero objetos parciales; Reintento legítimo no encuentra cuenta huérfana; correo no sale antes de commit |
| T-027 | Q-DB y Q-API: upgrade del esquema, duplicados y trazabilidad hasta factura. | Cada referencia emitida tiene registro durable y no se pierde al reintentar; ID de transacción duplicado no abona otra factura |
| T-028 | Q-API: repetición/desorden/evento desconocido; Q-DOC: conciliación de importes con evidencia del comercio. | Evento desconocido no se pierde silenciosamente y genera revisión; Importe/moneda/firma inválidos no modifican saldo; conciliación histórica tiene responsable y diferencias resueltas |
| T-029 | Q-API y Q-PERF: ráfagas sintéticas acotadas en staging, múltiples cuentas/IP simuladas. | Rotar nombres no elude cuota de origen/capacidad; 429 controlado, contraseñas siguen validando y tráfico permitido cumple presupuesto acordado |
| T-030 | Q-API y Q-UI: tabla de positivos y negativos por rol; 401/403/404 definidos. | Permisos aprobados coinciden en UI/API para todas las rutas afectadas; Ocultar menú nunca es la única autorización y no se amplía ADMIN por accidente |
| T-031 | Q-IMAGE: build de topología elegida y test en contenedor final; cotejar lock y UID. | Dos builds del mismo lock resuelven las mismas versiones; imagen ejecuta el runtime acordado; Proceso sin root y smoke de API/cliente supera regresión |
| T-032 | Q-CONFIG y Q-IMAGE: smoke positivo/negativo y prueba de reinicio en staging. | Falta de variable cancela arranque con nombre y sin secreto; Reinicio conserva datos en entorno persistente y credenciales no quedan en imagen |
| T-033 | Q-HEADERS y Q-UI: checkout sandbox, login/refresh, PDF y reporte CSP. | HTML/API devuelven políticas acordadas y pago funciona sin violaciones inesperadas; Ningún recurso privado queda cacheado públicamente; prueba HTTPS completa precede HSTS |
| T-034 | Q-SOCKET y Q-UI sobre Nginx de staging; no basta prueba directa contra Nest. | Handshake recibe respuesta Engine.IO y upgrade funciona; Reiniciar backend reconecta con estado de desconexión visible |
| T-035 | Q-HEALTH: fallo de conexión simulado y healthcheck real del contenedor. | DB caída retira readiness sin reinicios en bucle por liveness; Endpoints públicos no revelan secretos y versión coincide con imagen |
| T-036 | Q-API y Q-UI completos; repetir casos concurrentes con barreras para evitar éxitos accidentales. | Todos los casos de alto riesgo pasan con guardas reales y PostgreSQL; No hay diferencias financieras no conciliadas; fallo de caso bloquea hito |
| T-037 | Q-SECRET: escaneo local de referencias y revisión de protección CI; no ejecutar comandos que impriman blobs. | Ramas/tags distribuidos acordados no contienen secretos detectados; Revocación fue previa; forks/clones fuera de control quedan identificados con seguimiento |
| T-038 | Q-API: matriz de entradas inválidas y contratos actuales válidos para web/móvil. | Negativos, fechas/estados inválidos y campos extra reciben 400 sin escritura; PUT /1 con id 2 no altera ninguno; inexistente devuelve 404 |
| T-039 | Q-API: contrato parametrizado por cada controlador del inventario, sin depender solo de Swagger. | Todos los PUT con ID respetan URL y no insertan accidentalmente; Contratos IA/móvil/refresh siguen funcionando y se rechazan extras peligrosos |
| T-040 | Q-UNIT y Q-API: tabla 0/1/20/21 registros, límites, desbordamiento y entradas no numéricas. | size negativo/excesivo y sort desconocido se rechazan o normalizan según contrato; Para 21 registros y size 20, last=1; cero registros y última página no generan next inválido |
| T-041 | Q-PERF y Q-API: conteo de SQL y EXPLAIN con filtro; presupuesto propuesto <=5 consultas por página, validar en T-004. | Número de consultas no crece linealmente con 20/100 filas; Suscriptor fuera de primera página aparece por búsqueda; resultados no filtran datos de otro rol |
| T-042 | Q-UI: fixture >200 usuarios y >20 suscriptores/noticias, respuestas fuera de orden. | Cuenta 201 y suscriptor 21 son accesibles mediante UI; Respuesta vieja no sobrescribe filtro nuevo y errores no parecen lista vacía |
| T-043 | Q-DOC: tabla de ejemplos firmada por responsable de facturación. | Ejemplos aprobados: 100 a 110 equivale a 10 y pago en mes distinto se asigna al cobro; Regla de vencimiento y tratamiento desconocido documentados sin inventar fechas |
| T-044 | Q-UNIT y Q-UI: medianoche, fin de mes, año bisiesto y zonas distintas. | 2026-10-05 se muestra como 5 de octubre en Bogotá; Mora cambia en instante de negocio acordado, de igual forma en UI/API |
| T-045 | Q-UNIT y Q-API: fixtures multi-mes y cambio de medidor; comparar resultado tabular y gráfico. | Series de lecturas conocidas cuadran con facturas y suma del periodo; No se suman acumulados ni se inventa consumo faltante |
| T-046 | Q-DB y Q-API: duplicados, reversos, cobro parcial si negocio lo admite y periodos. | Factura emitida en un mes y pagada al siguiente cuenta en el segundo; Total de caja concilia con eventos; histórico sin fecha no se atribuye a emisión por defecto |
| T-047 | Q-DB y Q-API: caída antes/después de commit y posterior recuperación. | Commit financiero siempre deja evento durable correspondiente; Rollback de factura no deja aviso y entrega caída no pierde evento |
| T-048 | Q-API: dos consumidores, reintento y red caída; verificar actividad/aviso persistidos. | Cada factura canónica genera aviso y actividad una sola vez; Caída de entrega se recupera sin deshacer pago ni perder aviso |
| T-049 | Q-API con reloj controlado, dos workers y marca de progreso durable. | Dos réplicas generan una sola entrega lógica; Reinicio procesa atrasos sin repetir avisos ni omitir vencimientos |
| T-050 | Q-UI y Q-API: evento real sintético, desconexión y cuenta sin permiso. | Pago/lectura de prueba aparecen desde API sin nombres fijos; Telemetría no integrada se muestra Sin fuente; no se entrega integración física inexistente |
| T-051 | Q-A11Y: análisis automático más NVDA/teclado en flujos activos. | Cada control tiene nombre accesible inequívoco; Error es anunciado y referencia a su campo sin IDs duplicados |
| T-052 | Q-A11Y y Q-UI: tab/shift-tab/Escape, apertura anidada y móvil. | Usuario completa y cierra cada modal solo con teclado; Al cerrar vuelve al activador y lector anuncia título sin acceder al fondo |
| T-053 | Q-A11Y: lector y tabla con fixtures; Q-UI de vacío y error. | Todos los puntos de la serie se consultan sin canvas; Tabla, resumen y gráfico coinciden y funcionan al ocultar colores |
| T-054 | Q-UI: espías add/removeEventListener y destroy; perfil de memoria sin crecimiento sostenido. | Tras 20 entradas/salidas listeners y gráficos vuelven al conteo inicial; No se actualiza una vista desmontada |
| T-055 | Q-BUILD y Q-PERF con mismo escenario; Q-HEADERS para compresión/caché. | Bundle inicial gzip disminuye al menos 20% respecto a 301616 bytes o se justifica nuevo presupuesto medido; Navegación crítica funciona y no se cachean respuestas con datos personales |
| T-056 | Q-AUDIT; cotejar lock y SBOM con artefacto final. No usar audit fix automático. | Inventario completo tiene fecha de escaneo y decisión por alerta; Resultado bloqueado no se interpreta como cero; críticas/altas nuevas escalan a F1 sin esperar F3 |
| T-057 | Q-UI y Q-A11Y del prototipo; revisión del lock y licencia candidata. | Matriz de reemplazo cubre los 11 archivos con b-* detectados y usos indirectos; Prototipo conserva teclado, estilo y pruebas sin agregar otra capa permanente |
| T-058 | Q-UI y Q-A11Y: navbar, menú entidades y adaptadores. | Componentes comunes no requieren BootstrapVue; Menús, foco y rutas conservan matriz de permisos |
| T-059 | Q-UI: viaje por entidad con rol autorizado y negativos; snapshot visual de tabla y modal. | Los nueve archivos administrativos/entidades inventariados dejan de requerir b-*; Crear/editar/listar conserva reglas financieras, paginación y accesibilidad |
| T-060 | Q-UI y Q-A11Y: login/alta/reset en móvil y escritorio. | Login y páginas públicas no dependen del runtime Vue 2; Flujos de acceso corregidos y estilos esenciales pasan regresión |
| T-061 | Q-BUILD, Q-UI, Q-AUDIT y árbol de dependencias antes/después. | Runtime distribuido no incluye Vue 2/Bootstrap 4/BootstrapVue retirados; Dependencia deprecated restante tiene eliminación o sustitución aprobada y prueba; escaneo vigente sin altas alcanzables sin resolver |
| T-062 | Q-DOC: revisión de contratos y operaciones por responsable; fuentes oficiales actualizadas al ejecutar. | Matriz de tratamientos/proveedores tiene responsable y evidencia; Decisiones legales pendientes quedan identificadas, no se sustituye validación por una casilla |
| T-063 | Q-DOC y Q-UI: comparación de texto y matriz de tratamientos. | Cada afirmación de control/proveedor corresponde a evidencia operativa; Texto aprobado, versión/fecha visible y canales de derechos probados |
| T-064 | Q-API y Q-DB: permisos, repetición, versión nueva y revocación. | Autorización aplicable puede consultarse y vincularse a texto/version exactos; Otra cuenta no lee ni modifica evidencia; revocación conserva trazabilidad mínima aprobada |
| T-065 | Q-UI y Q-DOC: auditoría de evidencia de una solicitud sintética de principio a fin. | Decisión persiste y vuelve a mostrarse al recargar; Usuario puede ejercer derechos por flujo documentado con número de seguimiento |
| T-066 | Q-API y Q-DB: límites temporales, sesión activa, legal hold y corrida repetida. | Dry-run concilia conteos y purga solo registros elegibles; Refresh replay y sincronización offline siguen protegidos; política pública refleja retención real |
| T-067 | Q-LINT y Q-UNIT; cotejo de cambios semánticos separado de formato. | Errores prettier/CRLF desaparecen en áreas de entrega; Revisión del diff confirma ausencia de cambios de lógica |
| T-068 | Q-LINT, Q-TYPE y Q-CI; no usar npm test raíz como evidencia. | Lint cliente/servidor tiene cero errores y advertencias justificadas con propietario; CI falla ante error de tipos Vue sembrado en rama de prueba |
| T-069 | Q-METRICS: scrape, simulación controlada de alerta y revisión de logs. | Scrape válido y métricas de requests/job/pagos se actualizan; Alerta sintética llega a canal acordado y operador ejecuta runbook |
| T-070 | Q-CI, Q-API, Q-UI, Q-A11Y, Q-PERF y Q-AUDIT vigentes. | CI bloquea regresiones críticas con servicios descartables y cero secretos reales; Criterios de F3 y métricas acordadas pasan o hay no-go documentado |
| T-071 | Q-BUILD y Q-SEO: petición HTTP y comparación con artefacto. | robots.txt y manifest.webapp existen en build y responden sin fallback HTML; Referencias a iconos resuelven y robots no sustituye permisos |
| T-072 | Q-SEO: HTML recibido por crawler, enlaces y códigos de respuesta en staging. | Inicio/noticias/política muestran metadatos aprobados y sitemap coherente; Rutas inexistentes no simulan páginas válidas; contenido privado permanece protegido |
| T-073 | Q-DOC y revisión de SBOM/avisos por responsable legal. | Manifestos del producto son coherentes y avisos corresponden a dependencias entregadas; Entradas LGPL/CC-BY y sin metadata tienen revisión documentada, no declaración genérica de incompatibilidad |
| T-074 | Q-DOC: acta de onboarding independiente y validación OpenAPI contra rutas. | Operador nuevo completa checklist desde documentación sin instrucciones verbales; No hay secretos por defecto, comandos inexistentes ni promesas de migración automática |
| T-075 | Q-BUILD, Q-TYPE, Q-UI y grafo de imports antes/después. | Ningún import o ruta queda roto y tests ejercitan componentes montados; Se elimina simulación obsoleta sin alterar pagos reales |
| T-076 | Q-CIERRE: matriz firmada y evidencia por release; muestreo adversarial de identidad, pagos y sesiones. | 47/47 IDs tienen corrección verificada o decisión formal posterior con caducidad; Ninguna tarea se cierra solo por merge ni quedan críticas/altas técnicas sin resolver |
| T-077 | Q-RESTORE y Q-METRICS: acta con tiempos y conciliación; no ejecutar fallos en producción. | Primer simulacro completa objetivos RPO/RTO acordados o genera acción correctiva; Calendario y responsable quedan definidos; recurrencias no están contratadas ni automatizadas en este encargo |
