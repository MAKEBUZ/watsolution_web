# Lote 11: sesiones a través de Nginx HTTPS

Fecha: 2026-10-06. Rama: test/nginx-https-sessions. T-014 continúa parcial.

## Cambio y alcance

Se reutiliza la plantilla client/nginx.conf en un proceso Nginx temporal, con prefijo propio, puerto de loopback, TLS autofirmado y upstream Nest HTTPS. Nginx sirve el build real de Vue. El fixture añade únicamente TLS, rutas de prueba y sustituciones de puerto, raíz y backend; no modifica la plantilla operativa ni recarga la instancia predeterminada del sistema.

Los ocho casos se ejecutan directamente contra Nest y nuevamente mediante Nginx: cookie Secure/HttpOnly, recarga, renovación entre pestañas, revocación en logout, API inexistente frente a fallback SPA, origen no autorizado sin revocación, login/recarga de Vue y retirada del contenido protegido en ambas pestañas al salir. La prueba de origen usa el cliente HTTP de Playwright; no acredita un ataque entre orígenes desde una página externa.

## Verificación local

La primera compilación encontró replaceAll incompatible con el target TypeScript. Se corrigió con split/join sin ampliar el target. Evidencia: compilacion-inicial.log. Después, la suite compiló y sus ocho casos se detuvieron por ausencia explícita de certificado TLS: browser-local.log. Esos fallos de prerrequisito no son pruebas aprobadas. La ejecución con base de datos y navegador se valida en CI.

## Límites

Nginx procede del paquete Ubuntu de CI; no se ha probado la imagen Docker operativa ni su entrypoint. Se acepta el certificado autofirmado mediante ignoreHTTPSErrors. El backend de pruebas utiliza módulos seleccionados, no AppModule completo. No se validan certificados públicos, Socket.IO, otros navegadores, fallback sin navigator.locks, despliegue ni staging. T-014 no se cierra integralmente y se conservan las 77 tareas.

## Gitflow

Commits con MAKEBUZ, sin coautoría del asistente. Cambios locales del módulo móvil, package.json y eliminaciones previamente preparadas se conservan fuera del lote. Main y develop no reciben esta integración. Resultados definitivos y referencias se registran tras terminar CI.

## Resultado final

[CI 37562456515](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37562456515) aprobó el commit cb632deb8efc3d2400128ef68c6425c1081736d7: 8 casos Chromium HTTPS directos, los mismos 8 por Nginx 1.24.0 (Ubuntu), 27 PostgreSQL, 112 backend y 204 frontend en 41 archivos, TypeScript, auditoría de producción con umbral high y build. Pasar ese umbral no significa ausencia de todos los avisos. La primera ejecución quedó registrada en ci-inicial.json; la corrección de compilación se documenta arriba.

Integración publicada: 059e891a680ebfebda2e8e19bdbd23549d3eef73. Rama de pruebas publicada: cb632deb8efc3d2400128ef68c6425c1081736d7. Los archivos integrados coinciden con el commit probado. Referencias remotas comprobadas: main/develop continúan en 95606e1 / 595a7b6. La integración no modifica la lógica de producción: este lote añade pruebas, fixture, CI y documentación.

Evidencia: [CI](ejecucion/2026-10-06-lote-11/ci.json), [log de proxy](ejecucion/2026-10-06-lote-11/ci-proxy.log), [validación general](ejecucion/2026-10-06-lote-11/ci-validate.log), [77 tareas](ejecucion/2026-10-06-lote-11/estado-tareas.json), [verificación](ejecucion/2026-10-06-lote-11/verificacion.json), [referencias](ejecucion/2026-10-06-lote-11/referencias-remotas.txt) y [manifiesto SHA-256](ejecucion/2026-10-06-lote-11/manifest.json).

Próximo alcance pendiente: validar la imagen Docker y la topología operativa del proxy, incluido Socket.IO, antes de acreditar staging. T-014 permanece parcial.
