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

La suite `financial-http.integration.ts` ejecuta diecinueve casos HTTP con Nest, Supertest, JWT, guards y autenticación persistida. Los tokens se obtienen por `/api/authenticate` con usuarios, roles, contraseñas bcrypt, sesiones y limitador reales en PostgreSQL. Los cinco casos financieros comprueban contención genérica, permisos, captura y emisión idempotente. Seis casos adicionales cubren contraseña incorrecta/cuenta desactivada, propiedad de registros, cambios de rol y activación sobre tokens emitidos, logout, rotación/replay y throttling persistido.

El fixture crea explícitamente las tablas de identidad/sesiones y configura el search_path de cada conexión hacia su esquema aleatorio; no usa synchronize ni tablas operativas. La contraseña de prueba se genera en memoria. S3/PDF, notificaciones y estadísticas no ejercitadas siguen siendo dobles. Este transporte usa cuerpo/Authorization: no acredita cookies Secure ni navegador HTTPS.

Ocho casos web adicionales verifican atributos de cookie y ausencia de refresh en JSON, origen incorrecto/ausente sin efectos persistidos, separación del transporte nativo, logout con acceso vencido e independencia entre familias, refresh falso, renovación concurrente/replay y cuenta desactivada. Supertest envía cookies manualmente: estos casos no acreditan TLS, aplicación de SameSite/Secure por el navegador, CORS ni varias pestañas reales.

Estado: veintisiete casos PostgreSQL aprobados en [GitHub Actions 37410088785](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37410088785), commit `79f0e8d`. Ambos jobs, `postgres-sessions` y `validate`, terminaron correctamente. T-014 permanece parcial: faltan navegador HTTPS, multipestaña, proxy y staging. Las pruebas locales sin destino explícito deben fallar antes de conectar y no cuentan como integración aprobada.

## Navegador HTTPS aislado

`browser/session.browser.ts` sirve una página mínima con el módulo real `web-session.ts`, controladores de autenticación reales y PostgreSQL. Cuatro casos Chromium verifican cookie HttpOnly/Secure y ausencia de refresh en JSON, renovación tras recarga, renovación desde dos pestañas con navigator.locks y revocación tras logout. No es la interfaz completa del producto.

El job PostgreSQL instala Chromium mediante `npx --no-install playwright install --with-deps chromium`, genera un certificado efímero loopback y ejecuta:

`node node_modules/jest/bin/jest.js --config server/integration/browser/jest.config.json --runInBand --coverage=false`

Además de las variables de la base descartable, exige `TEST_TLS_KEY` y `TEST_TLS_CERT` con rutas explícitas. El certificado debe incluir SAN IP:127.0.0.1. No se versionan claves; el servidor escucha solo en loopback y un puerto efímero. Chromium acepta el certificado autofirmado mediante ignoreHTTPSErrors: no se certifica confianza TLS pública, Nginx, otros navegadores, fallback sin navigator.locks ni toda la interfaz de logout.

[GitHub Actions 37410916114](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37410916114), commit `62fdd4a`: ambos jobs aprobados, incluidos 27 casos PostgreSQL y cuatro casos Chromium HTTPS. T-014 conserva pendientes la interfaz completa, proxy y staging.

## Flujo de sesión en el build real de Vue

El arnés también exige `TEST_WEB_DIST`, ruta al directorio que contiene el index.html generado por Vite. CI construye en `tmp/browser-app` y sirve esos assets sobre el mismo HTTPS aislado. AccountController y AdminController usan identidad, estadísticas y actividad persistidas; servicios externos ajenos al recorrido siguen sustituidos.

Dos casos adicionales rellenan el login real, recargan una página protegida y cierran sesión mediante el botón de la interfaz con otra pestaña en Actividad. El primer CI reprodujo que la segunda pestaña permanecía en la vista protegida. App ahora desmonta esa vista al perder autenticación y redirige a login.

[GitHub Actions 37414612969](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37414612969), commit `05df11f`: seis casos Chromium HTTPS y 27 PostgreSQL aprobados, junto con validate. Esto cubre dos recorridos de sesión del frontend completo, no todas sus pantallas ni AppModule completo. Proxy, otros navegadores y staging siguen pendientes.
