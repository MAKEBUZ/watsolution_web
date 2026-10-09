# Ejecución: contención del CRUD financiero

Fecha: 2026-10-05. Continúa [el lote de pagos](21_ejecucion_pagos_y_facturas.md). Los reportes anteriores se conservan como evidencia histórica.

## T-011 / WS-008

Rama: `fix/financial-crud-containment`, desde `integration/remediation-phase-1`. Commit de implementación: `99597509c3a30695aaae28576b46aad1df2d8256`.

Los servicios genéricos de facturas y lecturas rechazan creación, actualización y eliminación con HTTP 409, incluso para ADMIN. La suspensión es temporal y comprende también registros pendientes sin orden de pago: evita que ese CRUD eluda la captura validada y el cálculo de facturación. No es una implementación de ajustes contables ni de corrección auditada de lecturas. Esas capacidades siguen pendientes en T-019/T-020/T-021.

Los listados y detalles ya no ofrecen los controles de creación, edición o eliminación. Los listados explican la suspensión; Facturas enlaza con Facturación. Las rutas antiguas de creación/edición redirigen al listado correspondiente, salvo crear factura, que lleva a `/admin/facturacion`. El rechazo se impone en el servidor aunque se invoquen directamente los endpoints. Los controladores solo emiten cabeceras de éxito después de una operación exitosa.

La consulta, los PDF, la captura mediante `MobileService`, la emisión mediante `BillingService` y el procesamiento verificado de pagos conservan sus caminos existentes. No hay migraciones ni cambios de datos históricos, despliegue o habilitación de cobros reales.

## Verificación local

- Regresión antes del parche: 18 casos fallidos, conservados en [crud-antes.log](ejecucion/2026-10-05-lote-05/crud-antes.log). Después: 111 pruebas de backend aprobadas en 15 suites.
- Frontend: 200 pruebas aprobadas en 40 archivos. Dos casos nuevos montan los listados con una fila y comprueban que existe consulta y aviso de suspensión, pero no controles de escritura.
- TypeScript del servidor aprobado. Build del frontend aprobado; permanece la advertencia de tamaño de chunks superior a 500 kB.
- La suite de integración compila, pero la ejecución local sin destino explícito se detiene antes de conectar. Sus 13 fallos de prerrequisito no se cuentan como pruebas aprobadas. PostgreSQL se verifica por separado en CI.

Logs: [backend](ejecucion/2026-10-05-lote-05/backend.log), [frontend](ejecucion/2026-10-05-lote-05/frontend.log), [TypeScript](ejecucion/2026-10-05-lote-05/typescript.log), [build](ejecucion/2026-10-05-lote-05/build.log), [integración local](ejecucion/2026-10-05-lote-05/integration-local.log).

## HTTP y PostgreSQL / T-014

Cinco casos nuevos usan Nest HTTP, Supertest, JWT firmado, guards reales y repositorios PostgreSQL sobre un esquema descartable. Los tres estados de prueba son pendiente, pendiente con referencia y pagado. En cada estado se intentan POST, PUT, PUT con ID y DELETE en facturas y lecturas; se exige 409, identidad de filas y ausencia de nuevas escrituras o registros de actividad. La consulta administrativa debe seguir respondiendo 200.

Otro caso exige 401 sin autenticación y 403 para USER en los dos CRUD y los dos flujos canónicos. El último realiza dos capturas móviles, emite una factura por diferencia de lecturas y comprueba importe, consumo, estado e idempotencia al repetir la emisión.

La resolución de identidad del usuario es sintética; la verificación del JWT y las autorizaciones se ejecutan con el código real. No se prueba aquí el login con persistencia de usuarios, cookies de navegador, HTTPS o el conjunto completo de AppModule. Se mantienen los ocho casos PostgreSQL anteriores de sesiones, pagos, PDF y portal. La tabla adicional `mobile_operation` se crea con SQL explícito dentro del esquema descartable, sin `synchronize`.

## CI, integración y cierre

Ejecución verificada: [GitHub Actions 37284911440](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37284911440), SHA `9959750`. Los jobs `postgres-sessions` y `validate` finalizaron con `success`, según la API de GitHub, guardada en [ci.json](ejecucion/2026-10-05-lote-05/ci.json). Se aprobaron los 13 casos PostgreSQL y los controles generales de instalación, auditoría con umbral high, TypeScript, backend, frontend y build. El umbral de auditoría aprobado no equivale a ausencia de vulnerabilidades.

T-011 queda implementada y verificada por HTTP con PostgreSQL real en CI, pendiente de revisión y validación operativa. T-014 continúa parcial hasta completar autenticación persistida, navegador HTTPS y staging. Se conserva el total de 77 tareas y no se declara cerrado el planning.

Los commits usan `MAKEBUZ <diego.ocampomad@campusucc.edu.co>`, sin coautoría del asistente. Se preservan las modificaciones locales previas. Los reportes quedan en la carpeta habitual y no se incluyen en el commit de código. No se promueven `main` ni `develop`.

## Riesgo residual y siguiente bloque

La suspensión impide corregir manualmente registros desde el CRUD; los ajustes requieren el flujo auditado futuro. No revertir esta protección para resolver una incidencia de captura: investigar el flujo canónico y evitar reabrir escrituras que permitan alterar pagos. El ensayo operativo de rollback sigue pendiente.

Siguiente contención del planning: T-013, identificación visible de simulaciones y conservación del alcance de prototipo del trabajo de grado. Continúan pendientes conciliación de referencias históricas, revisión de responsables, respaldo/restauración, rotación de secretos y verificación operativa.

Integración publicada y verificada en remoto: `838db1db8dc1ca1b959d2b0b5d88a1dc11a28433`. La rama de corrección apunta a `b1a1d49ceedb475545453a95d1706223f1f7b5a5`. Frente al SHA probado `9959750`, solo cambia `server/integration/README.md`. No se atribuye un resultado nuevo de CI al merge. Las referencias remotas de main y develop permanecen en `95606e1` y `595a7b6`.

Seguimiento: [77 tareas](ejecucion/2026-10-05-lote-05/estado-tareas.json), [verificación](ejecucion/2026-10-05-lote-05/verificacion.json) y [manifiesto SHA-256](ejecucion/2026-10-05-lote-05/manifest.json).
