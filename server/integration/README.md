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

Estado: primera suite de sesiones aprobada con PostgreSQL real en [GitHub Actions 37278338167](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37278338167), commit `6a40e9b`. T-014 todavía exige ampliar fixtures y pruebas HTTP con guardas reales y el navegador HTTPS. Las pruebas HTTP locales de `session.controller.spec.ts` ejercen el guard y la estrategia JWT reales con servicios simulados; no se presentan como integración de base de datos. Portal/PDF y navegador multipestaña se añadirán antes de cerrar la tarea.
