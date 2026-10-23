# Ejecución del planning: sesiones e integración PostgreSQL

Fecha: 2026-10-05. Continúa [el lote anterior](19_ejecucion_planning.md). Se conservan la auditoría original y sus evidencias.

## T-008 / WS-007 — Cierre de sesión

Commit `9b3f8b6`, rama `fix/logout-refresh-revocation`, basada en `integration/remediation-phase-1`.

- El logout web exige `X-Session-Transport: web` y un `Origin` incluido en `WEB_ORIGINS`. Revoca usando el secreto de la cookie HttpOnly, incluso si el JWT ha expirado. Las solicitudes móviles siguen pasando por el guard JWT real.
- La revocación compara hashes y bloquea la fila dentro de una transacción. Acepta el refresh actual o uno ya usado por esa familia, para resolver la carrera con una renovación simultánea. Conocer el ID de la sesión sin el secreto no permite revocarla.
- El servidor elimina la cookie con los mismos atributos Secure, HttpOnly, SameSite=Strict y Path=/, y evita cachear la respuesta. No emite confirmación si falla la persistencia.
- El cliente solicita logout aunque no conserve token de acceso. Limpia inmediatamente sus datos, muestra el estado pendiente y confirma solo una respuesta con `revoked: true`. Si falla la red o la respuesta no confirma, muestra un aviso con reintento.
- Un marcador local sin credenciales bloquea la restauración automática tras la salida, incluso después de recargar. Los eventos de almacenamiento limpian las otras pestañas. Solo un nuevo login explícito que establece un token elimina el marcador.
- Se fortaleció el entorno de pruebas frontend para que las instancias nuevas de Axios tampoco hagan solicitudes reales. La primera colocación del adaptador interfería con una prueba existente; se corrigió su orden de instalación y se repitió la suite completa.

Estado: implementado y verificado con pruebas de servicio, componente y HTTP. Pendientes navegador real HTTPS, sesiones simultáneas en distintas pestañas, staging y ensayo de rollback. Una prueba HTTP con Supertest verifica los atributos de cookie; no demuestra que un navegador la almacene y elimine sobre HTTPS.

## T-014 — Primera suite PostgreSQL descartable

Commit `6a40e9b`, rama `test/postgres-session-integration`, basada en la corrección de T-008.

Se añadieron `docker/postgresql-test.yml`, la suite `server/integration/` y el job independiente `postgres-sessions` de GitHub Actions. La base local escucha solamente en `127.0.0.1:55432`, se llama `ws_integration` y usa el usuario `ws_test`. La credencial incluida es sintética y exclusiva de pruebas. Los datos del contenedor local residen en memoria temporal.

El runner exige `BACKEND_ENV=test`, `WATSOLUTION_TEST_DATABASE=local-disposable` y una `TEST_DATABASE_URL` explícita. Rechaza destinos remotos, otro puerto, base o usuario y parámetros adicionales. No hereda `DATABASE_URL`, no carga `.env`, no activa `synchronize` y no ejecuta migraciones históricas. Crea un esquema aleatorio por ejecución y la tabla de fixtures mediante SQL explícito; solo limpia ese esquema tras comprobar su nombre y destino.

Once pruebas locales comprueban la restricción de destino. La suite real contiene tres casos: revocación idempotente, resistencia a un secreto adivinado y diez carreras concurrentes renovación/logout usando el servicio de producción. No reemplaza las pruebas de portal/PDF ni el recorrido HTTPS del navegador; T-014 permanece parcial.

La ejecución local sin configuración descartable falló antes de abrir conexión, como se esperaba. Sus tres casos no se contabilizan como aprobados. Docker y psql no estaban disponibles en PATH durante la inspección previa; no se instaló software ni se usó una base de producción.

## Validación local

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Backend completo | 84 pruebas, 13 suites aprobadas | [backend-final.log](ejecucion/2026-10-05-lote-03/backend-final.log) |
| Frontend completo | 198 pruebas, 40 archivos aprobados | [frontend-final.log](ejecucion/2026-10-05-lote-03/frontend-final.log) |
| TypeScript servidor | Aprobado, salida 0 | [verificacion.json](ejecucion/2026-10-05-lote-03/verificacion.json) |
| Build Vite | Aprobado; salida temporal `tmp/build-remediation-20261005-lote03` | [build.log](ejecucion/2026-10-05-lote-03/build.log) |
| Runner PostgreSQL sin destino | Rechazo esperado, salida 1 | [postgres-sin-destino.log](ejecucion/2026-10-05-lote-03/postgres-sin-destino.log) |

Persisten advertencias previas de Vue, Browserslist y tamaño de bundles. Las pruebas se ejecutaron con datos sintéticos. No se hizo despliegue ni se rotaron credenciales operativas. El build no certifica rendimiento, seguridad integral o cumplimiento académico.

## CI remoto

Ejecución correspondiente al commit `6a40e9b1c25624ac12e9efbf13410c898d6f21eb`: [GitHub Actions 37278338167](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37278338167). Ambos jobs terminaron con `success`, según la API de GitHub. La evidencia de cada paso está en [ci.json](ejecucion/2026-10-05-lote-03/ci.json).

- `postgres-sessions`: PostgreSQL inicializado y suite real aprobada, incluidos los diez enfrentamientos de renovación y logout dentro del caso de concurrencia.
- `validate`: instalación, `npm audit --omit=dev --audit-level=high`, TypeScript, Jest, Vitest y build aprobados. La auditoría superó ese umbral configurado; esto no implica cero hallazgos de toda severidad ni sustituye una revisión de seguridad.

La confirmación de PostgreSQL corresponde al entorno descartable de CI, no a una base local ni de producción. T-014 continúa parcial por faltar portal/PDF, HTTP integrado con base y navegador HTTPS.

## Seguimiento y continuidad

[estado-tareas.json](ejecucion/2026-10-05-lote-03/estado-tareas.json) conserva las 77 tareas: T-008 pasa a implementación local y T-014 a preparación parcial. Ninguna se declara cerrada de extremo a extremo. T-001/T-004 siguen parcialmente avanzadas; respaldo, restauración y rotación operativa continúan pendientes.

Las dos ramas se publicaron con autor y committer `MAKEBUZ`, sin coautoría del asistente. Se reunieron en `integration/remediation-phase-1`, commit `867fe3ef7b441a03d376a89e55f0ef4a800f7106`. Frente al commit aprobado por CI, el árbol de esta integración solo cambia la documentación `server/integration/README.md` para registrar ese resultado; no se atribuye a este merge una ejecución de CI que aún no se haya consultado. `main` y `develop` permanecen sin promover. Se preservaron las eliminaciones locales previas y el estado de `package.json`. Los informes siguen locales, separados de los commits de código.

Siguientes pasos: validar navegador HTTPS y las carreras reales de T-005/T-006, ampliar los fixtures de T-014 y abordar T-009 (referencia Bold atómica) con la base de integración disponible. El contexto del trabajo de grado sigue siendo un prototipo: no habilitar cobros reales como consecuencia de estas pruebas.

Rollback: no promover estas ramas antes de cumplir las puertas de integración. Si hay un fallo operativo de sesiones, revocar las familias afectadas y contener la renovación web; no restituir cookies válidas ni retirar el control de Origin. El ensayo operativo de rollback está pendiente.
