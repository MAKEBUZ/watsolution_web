# Ejecución: sesiones en Chromium sobre HTTPS

Fecha: 2026-10-05. Continúa [sesiones web HTTP](25_ejecucion_sesiones_web.md). Ampliación de T-014.

## Alcance preparado

Rama `test/https-browser-sessions`. El arnés utiliza Chromium mediante Playwright, un servidor Nest HTTPS que escucha exclusivamente en loopback y el fixture PostgreSQL descartable existente. Genera usuarios con contraseña aleatoria y bcrypt, roles y sesiones reales. La autenticación, renovación y logout ejecutan los controladores y servicios de producción.

La página de prueba es mínima: no es la interfaz completa del producto. Sirve el módulo real `client/src/app/shared/config/web-session.ts`, empaquetado con esbuild, para ejercer su almacenamiento en memoria y coordinación con navigator.locks. El endpoint protegido de comprobación es exclusivo del arnés y usa AuthGuard/JwtStrategy reales.

Se añaden cuatro casos:

1. Chromium guarda una cookie host-only, HttpOnly, Secure y SameSite=Strict; JavaScript no puede leerla. El JSON no contiene refresh y el token no se guarda en las claves históricas de localStorage/sessionStorage. El contexto es seguro y el acceso protegido funciona.
2. Recargar borra el token en memoria; el módulo real renueva mediante la cookie administrada por el navegador y recupera acceso.
3. Dos pestañas del mismo contexto renuevan usando navigator.locks; ambas conservan acceso y PostgreSQL registra dos rotaciones sin revocar la familia.
4. Logout del servidor elimina la cookie compartida; la segunda pestaña pierde acceso y no puede renovar.

## Aislamiento y límites

CI genera un certificado autofirmado efímero de un día, con SAN de 127.0.0.1. Playwright admite ese certificado mediante ignoreHTTPSErrors. Hay TLS real, pero no se verifica confianza de una CA pública ni configuración de certificados de producción. Los certificados no se versionan. El servidor usa un puerto efímero; PostgreSQL mantiene las restricciones de host, puerto, base, usuario y esquema descartable.

Se añaden Playwright 1.63.0 y esbuild 0.25.12 como dependencias de desarrollo del servidor. No se modifican servicios de producción ni se almacenan credenciales operativas. CI instala Chromium y sus dependencias, ejecuta los 27 casos PostgreSQL anteriores y luego los cuatro casos de navegador.

La prueba verifica atributos y aplicación de HttpOnly por Chromium. No demuestra todos los escenarios de SameSite entre sitios, CORS, confianza TLS pública, proxy Nginx, navegadores diferentes ni fallback cuando navigator.locks no existe. Tampoco certifica navegación, cierre visual de sesión o sincronización de estado de toda la aplicación: la página usa controles de prueba y el logout se invoca directamente.

## Verificación local y CI

Docker está instalado, pero su motor local no respondió: no existe el pipe dockerDesktopLinuxEngine. No se inició un entorno operativo como sustituto. La suite compila localmente y rechaza ejecución sin certificados explícitos; sus cuatro fallos de prerrequisito no cuentan como validación de navegador: [browser-local.log](ejecucion/2026-10-05-lote-09/browser-local.log).

La ejecución completa se verifica en CI antes de integrar. El resultado final y sus commits se incorporan al concluir los jobs.

## Cierre

T-014 continúa parcial. Este arnés aporta evidencia del módulo de sesión en Chromium HTTPS con persistencia real, pero quedan interfaz completa, proxy, otros navegadores y staging. El planning mantiene 77 tareas. Commits con MAKEBUZ y sin coautoría del asistente; cambios locales anteriores y reportes históricos preservados. No se despliega ni se promueven main/develop.

## Resultado verificado

[GitHub Actions 37410916114](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37410916114), SHA `62fdd4a2001013377dfda29ceda3e6aaf5fefe19`: jobs `postgres-sessions` y `validate` terminados en success. Se aprobaron cuatro casos Chromium HTTPS, los 27 casos PostgreSQL anteriores, auditoría de producción con umbral high, TypeScript, 112 pruebas backend, 203 frontend y build. Evidencia: [ci.json](ejecucion/2026-10-05-lote-09/ci.json). El umbral de auditoría no equivale a ausencia de todos los avisos.

Integración publicada: `971ab6763d02d49f1c2e9803ae09d67677c845ce`. La rama `test/https-browser-sessions` apunta a `b668defe9f2bd4d2b8e9b9da9be91605747e7654`. Frente al SHA probado, solo cambia el README que registra la evidencia. Referencias remotas comprobadas; main/develop conservan `95606e1` / `595a7b6`.

No fue necesaria una modificación funcional de producción en este lote. El módulo de sesión superó la renovación en dos pestañas con navigator.locks disponible. El logout del arnés demuestra revocación en servidor y cookie compartida; no prueba por sí solo el cierre visual y eventos storage de la interfaz completa. La próxima ampliación debe cubrir el flujo real de la aplicación y después la topología de proxy/staging.

Seguimiento: [77 tareas](ejecucion/2026-10-05-lote-09/estado-tareas.json), [verificación](ejecucion/2026-10-05-lote-09/verificacion.json), [manifiesto SHA-256](ejecucion/2026-10-05-lote-09/manifest.json).
