# Integración aislada (T-014)

Esta suite usa PostgreSQL real y el servicio de sesiones de la aplicación. No carga `AppModule`, variables `.env` ni migraciones históricas. Los destinos permitidos son exclusivamente `127.0.0.1:55432`, base `ws_integration` y usuario `ws_test`, con consentimiento explícito mediante `WATSOLUTION_TEST_DATABASE=local-disposable`.

Desde la raíz del repositorio, con Docker disponible:

```powershell
docker compose -f docker/postgresql-test.yml up -d --wait
$env:BACKEND_ENV = 'test'
$env:WATSOLUTION_TEST_DATABASE = 'local-disposable'
$env:TEST_DATABASE_URL = 'postgresql://ws_test:ws_test_only@127.0.0.1:55432/ws_integration'
node node_modules/jest/bin/jest.js --config server/integration/jest.config.json --runInBand --coverage=false
docker compose -f docker/postgresql-test.yml down
```

La credencial del ejemplo es sintética y exclusiva del contenedor de pruebas. No sustituir la URL por una de producción. El contenedor guarda sus datos en memoria temporal. Cada ejecución crea un esquema aleatorio `ws_test_<uuid>` y la tabla de fixtures con SQL explícito. La limpieza solo elimina ese esquema después de comprobar su nombre y conexión; no ejecuta `synchronize`, `dropSchema`, migraciones históricas ni borrados de la base completa.

La suite falla si no hay configuración explícita o no se puede conectar. Nunca convierte la ausencia de PostgreSQL en un resultado aprobado. Un job independiente de GitHub Actions proporciona la misma base descartable y ejecuta las pruebas de revocación, suplantación de refresh y carrera renovación/logout.

La suite `billing.integration.ts` amplía los fixtures con tablas explícitas de facturas, personas, lecturas, direcciones y actividad. Verifica veinte aperturas de checkout detenidas simultáneamente en un bloqueo PostgreSQL, una única referencia e importe, webhook firmado sintéticamente, duplicados del webhook, pago durante PDF en ambos caminos y colisiones de identidad del portal. El servicio de pagos y los repositorios son reales; S3, PDF, notificaciones y la búsqueda de usuario para avisos son dobles. Los controladores se invocan directamente: esta suite no certifica guards HTTP, cookies del navegador ni llamadas reales a Bold.

La suite `financial-http.integration.ts` añade cinco casos por HTTP con Nest, Supertest, JWT y guards reales, repositorios PostgreSQL y la tabla descartable `mobile_operation`. Comprueba el rechazo de POST/PUT/DELETE genéricos en facturas y lecturas pendientes, con referencia activa y pagadas; exige filas y cantidades sin cambios y permite consultas. Verifica 401/403 y el recorrido de dos capturas, emisión por consumo e idempotencia. Solo la resolución de identidad es sintética: no acredita login persistido, cookies ni navegador HTTPS.

Estado: trece casos PostgreSQL aprobados en [GitHub Actions 37284911440](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37284911440), commit `9959750`. Ambos jobs, `postgres-sessions` y `validate`, terminaron correctamente. T-014 permanece parcial: faltan autenticación persistida en los recorridos HTTP, navegador HTTPS y staging. Las pruebas locales sin destino explícito deben fallar antes de conectar y no cuentan como integración aprobada.
