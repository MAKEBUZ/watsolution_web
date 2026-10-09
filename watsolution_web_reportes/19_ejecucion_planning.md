# Ejecución del planning — 5 de octubre de 2026

Se continúa el plan de 77 tareas con correcciones versionadas y evidencia local. Este informe amplía los reportes 00–18; no modifica sus hallazgos ni sustituye la auditoría original.

## Resultado actual

| Tarea / hallazgo | Implementación | Evidencia | Estado |
| --- | --- | --- | --- |
| T-005 / WS-001 | Propietario del portal identificado por ID autenticado; sin alternativas por login/correo y con rechazo de vínculos duplicados. | Commit `13559aa`; 12 regresiones de backend. | Implementada localmente; falta HTTP/PostgreSQL, conciliación de vínculos y staging. |
| T-006 / WS-002 | Persistencia parcial de la clave PDF; conserva pagos y referencias que cambian durante la generación; no recrea facturas eliminadas. | Commit `3b0e1a2`; 9 regresiones de backend. | Implementada localmente; falta concurrencia real PDF/webhook en PostgreSQL. |
| T-007 / WS-006 | Limpieza síncrona de mensajes, borrador y panel al cambiar identidad, autenticación o permisos; cancelación HTTP y descarte de respuestas/errores tardíos. | Commit `737c2c6`; 7 pruebas de componente. | Implementada localmente; falta recorrido HTTPS con cuentas reales de prueba y revisión de QA. |
| T-012 / WS-011 | Interpolación de texto en ajustes y contraseña; títulos españoles sin HTML. | Commit `e854ee9`; 2 regresiones nuevas y 8 pruebas existentes de las vistas. | Contención implementada localmente; falta acordar formato de nuevos logins y validar en staging. |

No se declara cerrada ninguna tarea de extremo a extremo. El registro de las 77 tareas está en [estado-tareas.json](ejecucion/2026-10-05-lote-02/estado-tareas.json); el backlog original conserva sus estimaciones y dependencias como línea base.

## Pruebas y reproducción

Las seis pruebas iniciales del chat fallaron antes de la corrección y pasaron después. Se añadió una séptima que verifica que actualizar los datos de la misma identidad no borra innecesariamente su conversación. Se comprueban el cambio de administrador a usuario, cierre y reapertura de la misma cuenta en el mismo ciclo, cambios de permisos, desmontaje y finalización tardía de solicitudes anteriores sin interferir con una nueva petición.

Las dos pruebas de HTML fallaron con las vistas originales y pasaron con interpolación de texto. Utilizan las traducciones españolas y un nombre sintético con etiquetas; verifican texto literal y ausencia de elementos `img` o atributos `onerror` en el título. No se ejecutaron ataques contra servicios publicados.

En el commit de integración `a2cce0219710203db7c7df070d59660943c4558b`:

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Vitest completo | 191 pruebas / 38 archivos aprobados | [Frontend](ejecucion/2026-10-05-lote-02/integracion-frontend.log) |
| Jest completo | 63 pruebas / 11 suites aprobadas | [Backend](ejecucion/2026-10-05-lote-02/integracion-backend.log) |
| TypeScript servidor | Código de salida 0 | [Resumen verificable](ejecucion/2026-10-05-lote-02/verificacion.json) |
| Build Vite | Aprobado; salida temporal en `tmp/build-remediation-20261005-lote02` | [Compilación](ejecucion/2026-10-05-lote-02/build-frontend.log) |

Evidencia de regresión: [chat antes](ejecucion/2026-10-05-lote-02/chat-antes.log), [chat después, seis casos iniciales](ejecucion/2026-10-05-lote-02/chat-despues.log), [HTML antes](ejecucion/2026-10-05-lote-02/html-antes.log), [HTML después](ejecucion/2026-10-05-lote-02/html-despues.log). La suite final contiene los siete casos de chat y los dos de HTML. [manifest.json](ejecucion/2026-10-05-lote-02/manifest.json) registra hashes de la evidencia del lote.

Persisten advertencias de Vue, Browserslist, compatibilidad/deprecaciones y tamaño de bundles. La compilación no es una certificación de rendimiento. Los ensayos usan datos sintéticos y dobles de servicios; no certifican integración real, cobertura total ni seguridad completa. Las pruebas locales no accedieron a PostgreSQL, S3, pasarelas o cuentas de producción. La validación de CI remoto no se ha confirmado.

Comandos reproducibles desde la raíz, salvo donde se indica:

```powershell
node node_modules/jest/bin/jest.js --config server/package.json --runInBand --coverage=false
node node_modules/typescript/bin/tsc -p server/tsconfig.build.json --noEmit
# Desde client:
node ../node_modules/vitest/vitest.mjs run
node ../node_modules/vite/bin/vite.js build --outDir ../tmp/build-remediation-20261005-lote02
```

## Referencia del trabajo de grado

Se consultaron los objetivos, alcances y límites del [documento WatSolution proporcionado por el autor](https://docs.google.com/document/d/1ECi4jCxwN_M09PJgoBY8ykIszTm8i7Nkbf58Wkt4O3k/edit). La consulta fue de lectura: no se editó el documento ni se publicó su copia exportada. No se afirma haber auditado todo el manuscrito.

Los objetivos específicos 3 y 4 contemplan el desarrollo con buenas prácticas y un prototipo funcional. La sección 1.8 incluye consultas personalizadas mediante chatbot, área del usuario, facturación y simulaciones de pagos e IoT. Por ello, las correcciones protegen la separación entre usuarios y la integridad de las demostraciones. Esta relación con los objetivos es una interpretación técnica, no una validación académica del trabajo.

Para T-013 se debe conservar el valor demostrativo del IoT simulado, identificándolo claramente como simulación; no presentar sus mediciones como datos reales. La delimitación excluye integración financiera real en esta fase: no habilitar cobros reales como supuesto del planning. Las pruebas de pago deberán usar entornos de prueba y datos sintéticos. No se infiere que una funcionalidad descrita en el manuscrito esté implementada o validada.

## Gitflow y trazabilidad

- Las ramas `fix/chat-session-isolation` y `fix/account-html-escaping` parten de `develop`, cada una con una corrección independiente.
- `integration/remediation-phase-1` reúne esas ramas y `fix/portal-invoice-isolation` mediante merges explícitos. Es candidata de validación para una futura integración en `develop`.
- `main` y `develop` no se promovieron ni se desplegó una versión; no se creó etiqueta estable.
- Autor y committer: identidad Git configurada `MAKEBUZ`. No se añadieron líneas `Co-authored-by` ni colaboradores.
- Las eliminaciones locales previas de `.editorconfig`, `CLAUDE.md` y `schema.jdl`, así como el estado local previo de `package.json`, se conservaron fuera de estos commits.
- Los reportes y el planning permanecen locales. Se suben las ramas de código; no se incorpora al remoto la exportación del trabajo de grado ni el caché de auditoría.

## Puertas pendientes y siguiente orden

T-001 y T-004 avanzaron parcialmente mediante Gitflow, inventario de cambios y línea base reproducible. Faltan responsables operativos, presupuestos/objetivos y staging. T-002 (respaldo/restauración) y T-003 (rotación) requieren evidencia de los entornos correspondientes; no se dan por realizadas a partir de cambios de código.

T-014 sigue pendiente. En esta sesión no se encontraron ejecutables `docker` ni `psql` en PATH; esto no demuestra que no exista una instalación fuera de PATH. No hay un destino PostgreSQL descartable verificado para ejecutar la integración. Se adelantaron parches aislados y sus pruebas locales por la autorización de ejecución del usuario, manteniendo abiertas las dependencias del plan y la puerta de liberación.

El siguiente bloque es preparar T-014 con destino descartable protegido, fixtures explícitos y guardas reales; después validar T-005/T-006 y los recorridos de sesión. T-008 (logout con acceso vencido) y T-009 (referencia Bold atómica) permanecen pendientes, seguidos de T-010/T-011 y la identificación de simulaciones T-013. No se cierran hallazgos por disponer únicamente de un commit.

Rollback: mantener el despliegue actual mientras se revisa esta candidata. Si se requiere retirar un cambio ya integrado, hacerlo mediante un commit de reversión y repetir pruebas; para chat, deshabilitar temporalmente la función antes que restablecer un historial compartido. El rollback operativo no se ha ensayado y sigue siendo condición de liberación.
