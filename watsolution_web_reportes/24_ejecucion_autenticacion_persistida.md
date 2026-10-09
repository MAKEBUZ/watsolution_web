# Ejecución: autenticación HTTP con persistencia real

Fecha: 2026-10-05. Continuación de [datos operativos](23_ejecucion_datos_operativos.md). Ampliación de T-014.

## Alcance implementado

Rama `test/persisted-http-authentication`, desde `integration/remediation-phase-1`. Implementación `b7a4fd0`.

Los cinco recorridos financieros HTTP dejan de sustituir `AuthService.validateUser` por una identidad sintética. Ahora se crean usuarios, contraseñas cifradas con bcrypt, roles y relaciones en PostgreSQL descartable. Los tokens se obtienen mediante `POST /api/authenticate`, usando UserJWTController, AuthService, UserService, SessionService, LoginRateLimitService, JwtStrategy y guards reales. La contraseña de pruebas se genera aleatoriamente durante la ejecución, no se toma de una cuenta operativa.

El fixture agrega tablas explícitas `jhi_user`, `jhi_authority`, relación usuario/rol, `auth_session` y `auth_rate_limit`. Cada conexión del pool usa exclusivamente el esquema aleatorio de prueba en su search_path, necesario porque el limitador utiliza SQL sin esquema explícito. Se conservan el host/puerto/base/usuario permitidos, comprobación de identidad de la base y limpieza limitada a ese esquema. No se ejecutan migraciones históricas, synchronize ni cambios en bases operativas.

## Nuevas regresiones

Se agregan seis casos:

1. Contraseña incorrecta y cuenta desactivada responden 401 sin crear sesiones.
2. El propietario persistido consulta su factura y lectura; otro usuario recibe 403 tanto por ID como en las rutas por persona.
3. Un token ya emitido pierde acceso administrativo tras cambiar el rol persistido; desactivar la cuenta hace que responda 401.
4. Logout HTTP revoca la sesión persistida, invalida acceso y refresh y conserva únicamente el hash del refresh en la base.
5. Renovación HTTP rota el refresh; reutilizar el anterior revoca la familia e invalida también los tokens renovados.
6. Diez intentos fallidos quedan registrados en PostgreSQL; el undécimo recibe 429, sin crear una sesión.

Se mantienen los cinco casos HTTP de contención financiera y emisión/captura, ahora autenticados mediante usuarios persistidos, y los ocho casos anteriores de sesiones, pagos, portal y PDF. Total esperado: 19 casos PostgreSQL.

## Límites y evidencia

La suite crea una aplicación Nest de pruebas con los controladores necesarios. Notificaciones, S3/PDF y estadísticas ajenas a estos recorridos siguen siendo dobles. No se carga AppModule completo ni se certifican correo, pagos externos o la operación de producción.

Se ejercita el transporte de tokens por cuerpo/Authorization; no se presenta como prueba de cookies Secure, navegador HTTPS, multipestaña o proxy. Esos recorridos y staging siguen pendientes en T-014. La cobertura nueva tampoco prueba todas las combinaciones de permisos de la aplicación.

La compilación de la suite se comprobó localmente. Sin declarar una base descartable, se detuvo antes de conectar: [integration-local.log](ejecucion/2026-10-05-lote-07/integration-local.log). Los 19 fallos por prerrequisito de esa ejecución no cuentan como pruebas aprobadas. La verificación real de base se realiza en CI. `git diff --check` pasó.

No fue necesario modificar comportamiento de producción para implementar estas pruebas. Los cambios están limitados al fixture y a la suite HTTP; se mantiene la obligación de corregir cualquier defecto que revele su ejecución real.

## Gitflow y seguimiento

Commits y ramas con MAKEBUZ, sin coautoría del asistente. Se preservan cambios locales anteriores y reportes históricos. No se despliega ni se promueven main/develop. El resultado de CI y el commit de integración se registran al terminar la verificación. T-014 continúa parcial; el planning conserva 77 tareas.

## Resultado verificado

[GitHub Actions 37408447605](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37408447605), SHA `b7a4fd093d9854801f1db6c6adcf57fb8310cf59`: `postgres-sessions` y `validate` finalizaron en success. Se aprobaron los 19 casos PostgreSQL, auditoría de producción con umbral high, TypeScript, 112 pruebas backend, 203 frontend y build. Evidencia: [ci.json](ejecucion/2026-10-05-lote-07/ci.json). No se interpreta el umbral de auditoría como ausencia de todos los avisos.

Integración publicada y verificada: `c898fcbd96a38681217517a4ff221db181966947`. La rama de pruebas apunta a `4004ac96e8c976d365b3281f0f1c37b0b331743b`. Frente al SHA probado, solo cambia el README de integración para registrar la evidencia. Main/develop permanecen en `95606e1` / `595a7b6`. No se atribuye al merge una ejecución CI distinta de la identificada arriba.

No surgió un defecto funcional en estos casos. T-014 avanza de identidad simulada a login, usuarios, roles y sesiones persistidos; conserva pendientes navegador HTTPS, multipestaña, proxy y staging. Siguiente trabajo: preparar el recorrido web con cookies y origen permitido sobre un entorno de prueba, diferenciando pruebas HTTP de una inspección real de navegador.

Seguimiento: [77 tareas](ejecucion/2026-10-05-lote-07/estado-tareas.json), [verificación](ejecucion/2026-10-05-lote-07/verificacion.json), [manifiesto SHA-256](ejecucion/2026-10-05-lote-07/manifest.json).
