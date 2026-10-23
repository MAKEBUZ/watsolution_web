# Ejecución: login y logout sobre el build real de Vue

Fecha: 2026-10-05. Continúa [Chromium HTTPS](26_ejecucion_navegador_https.md). Ampliación de T-014 y corrección del cierre visual de sesión.

## Cobertura añadida

Rama `test/full-ui-session-flow`. CI construye el frontend completo con Vite en una carpeta de pruebas y el servidor HTTPS aislado sirve esos assets con fallback de rutas SPA. Se conservan los cuatro casos del módulo de sesión y se añaden dos recorridos de interfaz:

1. Rellenar el login real, aceptar el control de privacidad, entrar como administrador y recargar una ruta protegida. La identidad se recupera mediante cookie, renovación y `/api/account` reales, sin almacenar el access token en la clave histórica de localStorage.
2. Abrir Actividad en una segunda pestaña, pulsar el botón real de logout en la primera y exigir que ambas queden en login, se desmonte el contenido protegido, desaparezca la cookie y la recarga no restaure la sesión cerrada.

El backend de pruebas añade AccountController y AdminController. La cuenta, estadísticas y actividad consultan PostgreSQL real mediante los servicios existentes. Facturación usa sus servicios reales, aunque no se ejercita en estos nuevos recorridos. S3/PDF y notificaciones ajenas al alcance siguen siendo dobles; el backend no es AppModule completo. No se certifica toda la aplicación por probar dos recorridos de sesión.

## Defecto reproducido y corrección

La interfaz escuchaba el evento storage de logout y limpiaba la identidad del store, pero mantenía montada la vista actual. Una pantalla administrativa podía conservar datos cargados después de que otra pestaña cerrara sesión.

La nueva regresión de componente falla antes del parche porque router-view sigue presente: [logout-regresion.log](ejecucion/2026-10-05-lote-10/logout-regresion.log). Ahora App desmonta el contenido de rutas que exigen autoridad cuando no hay autenticación; una transición de autenticado a no autenticado en una ruta protegida redirige a `/login`. El control del servidor permanece como barrera de autorización; este cambio elimina contenido residual del navegador.

Pasaron las 204 pruebas frontend en 41 archivos, incluida la regresión nueva: [frontend.log](ejecucion/2026-10-05-lote-10/frontend.log). El archivo logout-antes.log corresponde a los dos casos previos y no constituye la reproducción del defecto. La reproducción válida es logout-regresion.log.

## Verificación y límites

La suite de navegador compila localmente y rechaza la ejecución sin certificados explícitos. Sus seis fallos de prerrequisito no cuentan como pruebas aprobadas: [browser-local.log](ejecucion/2026-10-05-lote-10/browser-local.log). Los recorridos reales se verifican en CI.

Se conserva Chromium con certificado efímero autofirmado aceptado mediante ignoreHTTPSErrors, PostgreSQL descartable y usuarios sintéticos. Quedan fuera confianza TLS pública, Nginx, otros navegadores, fallback sin navigator.locks y staging. Estos dos casos no validan todas las pantallas, funciones, permisos o integraciones externas.

## Gitflow y cierre

Los commits usan MAKEBUZ, sin coautoría del asistente. Se preservan cambios locales previos, reportes históricos, main y develop. No se despliega. La rama se integra solo después de verificar CI; el resultado y los commits finales se registran aquí. T-014 mantiene pendientes proxy y staging y el planning conserva 77 tareas.

## Evidencia de reproducción en Chromium

Primera ejecución [37414407542](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37414407542), SHA `1fd3bdac5470d0063bc83528b509178facc87d71`: validación general aprobada; navegador con cinco casos aprobados y uno fallido. Login real y recarga aprobaron. El caso de logout multipestaña agotó el tiempo esperando que la segunda pestaña navegara a login (línea 196 del test). El log confirma el defecto además de la regresión de componente: [ci-inicial.log](ejecucion/2026-10-05-lote-10/ci-inicial.log). La corrección está en `05df11f` y requiere su propio CI aprobado.

## Resultado final e integración

[GitHub Actions 37414612969](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37414612969), SHA `05df11fd2a2866c251bce3d675709c5b567695cf`: `postgres-sessions` y `validate` finalizaron en success. Aprobaron seis casos Chromium HTTPS (cuatro del módulo y dos de interfaz), 27 PostgreSQL, 112 pruebas backend, 204 frontend, TypeScript, auditoría de producción con umbral high y build. Evidencia: [ci.json](ejecucion/2026-10-05-lote-10/ci.json). Pasar el umbral no implica ausencia de todos los avisos.

Integración publicada: `9cf0b2cfd3c6c90035d0dedb0db8a3f1bf3a1411`. Rama de trabajo: `26967507a12189bb9be0eb17ee87c256a1cdd219`. Frente al SHA probado solo cambia el README con la evidencia. Referencias remotas comprobadas; main/develop siguen en `95606e1` / `595a7b6`.

T-014 incorpora los recorridos reales de login, recarga y logout multipestaña. No se declara cerrada: siguen pendientes proxy, otros navegadores, cobertura funcional adicional y staging. Próxima ampliación: comprobar la topología de proxy de pruebas con HTTPS y endpoints de sesión, manteniendo separados los cambios de infraestructura y cualquier despliegue operativo.

Seguimiento: [77 tareas](ejecucion/2026-10-05-lote-10/estado-tareas.json), [verificación](ejecucion/2026-10-05-lote-10/verificacion.json), [manifiesto SHA-256](ejecucion/2026-10-05-lote-10/manifest.json).
