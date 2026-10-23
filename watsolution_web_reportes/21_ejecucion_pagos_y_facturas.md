# Ejecución: referencia Bold atómica y regresiones PostgreSQL

Fecha: 2026-10-05. Continúa [el lote de sesiones](20_ejecucion_sesiones_postgresql.md). Los reportes de auditoría 00–18 se conservan sin cambios.

## T-009 / WS-005

La rama `fix/bold-order-atomicity` parte de la candidata `integration/remediation-phase-1`. Commit de implementación: `80ab23cfd4a3f617a2e83ef52d70cd665c960943`.

Antes, cada apertura de checkout leía la factura sin bloqueo y podía generar su propia referencia. La última escritura sustituía la anterior; un webhook de una referencia ya entregada podía perder la asociación. Ahora `getHashForInvoice` usa un único EntityManager transaccional y un bloqueo `pessimistic_write` sobre la factura. Lee estado e importe bajo ese bloqueo, asigna referencia solo si falta, conserva las existentes y devuelve el hash después de confirmar la transacción.

Se mantiene la fórmula SHA-256 existente y la moneda COP. Se rechazan facturas no pendientes e importes no finitos, cero o negativos. No se modifica la integración externa ni se habilitan cobros reales. No se introducen migraciones de producción.

Nueve regresiones locales verifican veinte aperturas simultáneas, estabilidad de referencia y firma, reutilización sin reescritura, estado observado dentro de la transacción, importes inválidos, configuración ausente y fallo de commit. Antes del parche fallaron ocho de las nueve; después pasó la suite completa de 93 pruebas. El repositorio simulado de estas pruebas no demuestra por sí mismo el comportamiento de PostgreSQL.

Evidencia: [bold-antes.log](ejecucion/2026-10-05-lote-04/bold-antes.log), [backend.log](ejecucion/2026-10-05-lote-04/backend.log).

## Ampliación de T-014 y validación de T-005/T-006

Se agregó un fixture SQL explícito y descartable de facturas, personas, medidores, direcciones y actividad. Conserva la restricción de host, puerto, base y usuario de pruebas. No usa `synchronize`, migraciones históricas, datos de usuarios reales ni credenciales operativas. Cada suite crea su esquema aleatorio y elimina únicamente ese esquema al terminar.

Los cinco casos nuevos de PostgreSQL comprueban:

1. Veinte solicitudes concurrentes detenidas en un bloqueo de fila. La prueba observa veinte conexiones esperando el bloqueo en `pg_stat_activity` antes de liberarlo; exige una sola referencia persistida, un importe idéntico y firmas coherentes. Después procesa cinco webhooks idénticos, exige un solo registro de pago y rechaza abrir de nuevo el checkout pagado.
2. Una factura ya pagada no recibe una referencia nueva.
3. Un webhook confirma el pago mientras la descarga espera la subida del PDF. La persistencia posterior conserva PAID, referencia, transacción e importe.
4. El mismo escenario para la generación administrativa del PDF.
5. El portal consulta al propietario por ID autenticado aunque su login coincida con el ID o correo de otra persona; una cuenta sin vínculo no obtiene el perfil ajeno.

Se ejecutan los servicios y repositorios reales de la aplicación. Los controladores de portal/PDF se invocan directamente: no se declara cobertura de guards HTTP. Renderizado PDF, S3, notificaciones y búsqueda de usuario para avisos son dobles; no hay tráfico a Bold. La firma del webhook es sintética, pero se verifica mediante el código de producción. La suite anterior de sesiones aporta otros tres casos PostgreSQL.

La ejecución local sin destino explícito se detuvo antes de conectar. Sus ocho fallos por prerrequisito no cuentan como pruebas de integración aprobadas: [integracion-sin-destino.log](ejecucion/2026-10-05-lote-04/integracion-sin-destino.log). La compilación TypeScript del servidor y `git diff --check` pasaron.

## CI y estado de cierre

Ejecución de referencia: [GitHub Actions 37280188484](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37280188484), correspondiente a `80ab23c`. Los jobs `postgres-sessions` y `validate` terminaron con `success`, comprobado mediante la API de GitHub y guardado en [ci.json](ejecucion/2026-10-05-lote-04/ci.json).

La suite PostgreSQL completa aprobó sus ocho casos: cinco de este lote y tres de sesiones. La validación general aprobó instalación, auditoría de dependencias con umbral high, TypeScript, 93 pruebas de backend, 198 de frontend y build. El frontend no cambió en este lote; su regresión se ejecutó en CI. No se interpreta el umbral de auditoría superado como ausencia de toda vulnerabilidad.

T-009 queda implementada y verificada con concurrencia PostgreSQL en CI, pendiente de revisión y validación operativa. T-005 y T-006 añaden evidencia con PostgreSQL real. T-014 sigue parcial: esta ampliación no sustituye los recorridos HTTP con base real, navegador HTTPS ni staging. Se conservan las condiciones operativas de cierre. No se modifica el número total de tareas ni se declara completado el planning.

## Riesgo residual y siguiente bloque

- Las referencias históricas que ya se perdieron necesitan conciliación y persistencia de eventos de pago: T-027/T-028. Este parche evita nuevas sustituciones concurrentes; no recupera registros pasados.
- Las mutaciones administrativas de datos financieros todavía requieren T-011/T-019. El bloqueo protege la lectura y asignación durante checkout, no congela indefinidamente el importe después de entregar el hash.
- Siguen pendientes navegador HTTPS, revisión de responsables, respaldo/restauración, rotación de secretos y ensayo de rollback. Ninguna de esas operaciones se simula como completada mediante un commit.
- Próxima contención: T-011, para cerrar las vías de modificación financiera fuera de las reglas de negocio. La identificación de simulaciones de T-013 debe conservar el alcance del prototipo descrito en el trabajo de grado.

Los commits y las ramas usan la identidad `MAKEBUZ`, sin coautoría del asistente. Se mantienen las modificaciones locales previas fuera de estos commits y los reportes en su carpeta local. No se despliega ni se promueve `main` o `develop`.

Integración publicada: `249625b6402835a34223e6ae1ef5c32bd6d60a27` en `integration/remediation-phase-1`. Frente al commit probado en CI, solo difiere `server/integration/README.md` para documentar el resultado. No se atribuye a este merge un resultado de CI distinto del comprobado para `80ab23c`.

Seguimiento actualizado: [estado-tareas.json](ejecucion/2026-10-05-lote-04/estado-tareas.json), con las 77 tareas; [verificacion.json](ejecucion/2026-10-05-lote-04/verificacion.json), con commits y resultados; [manifest.json](ejecucion/2026-10-05-lote-04/manifest.json), con hashes SHA-256 de las evidencias.

Rollback de contención: ante un problema de checkout, suspender nuevas aperturas y mantener la recepción de webhooks; nunca borrar referencias ya entregadas. Un ensayo operativo de esta medida sigue pendiente.
