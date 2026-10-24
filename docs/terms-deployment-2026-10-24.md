# Condiciones del servicio: publicación del 24 de octubre de 2026

URL para el campo «URL de Condiciones del servicio» de Meta:

https://watsolution.online/condiciones-del-servicio/

## Implementación

- Documento HTML público en `client/src/condiciones-del-servicio/index.html`, sin JavaScript, autenticación, dependencias externas ni formularios de recogida de datos.
- Entrada adicional de Vite para conservar la página en futuras compilaciones. Enlace nativo en el código fuente del footer para abrir el documento fuera del router de Vue.
- Texto sobre uso del portal, cuentas, facturación, WhatsApp, privacidad, disponibilidad, autoría, actualizaciones y contacto. Identidad del acueducto y teléfonos tomados de la política de privacidad existente; creadores identificados por el usuario como Diego Ocampo y Dylan Rodriguez.
- No cambia el contrato de acueducto, tarifas ni derechos legales. La página no acredita validación jurídica ni verificación independiente de los datos de contacto. Referencia normativa consultada: [Ley 1480 de 2011, texto oficial](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306), en particular la protección frente a cláusulas abusivas. No se impusieron renuncias generales de responsabilidad o de derechos.

## Publicación

Publicada a las 00:16 del 24 de octubre, hora de Colombia (05:16 UTC).

- Servidor existente de AWS Lightsail; imagen `watsolution-client:terms-20261024-v1`.
- Digest: `sha256:a710d1d7343276cda8ec63495defec82adb3a86d856d1d33e8872c221df8003a`.
- Base comprobada: `watsolution-client:domain-online-20261023`, digest `sha256:0ae08fb8483b5a43d63aa2983b3f156d6ae1f1b104a7ae7d285a05cc751c13a8`.
- La nueva imagen añade exclusivamente `/usr/share/nginx/html/condiciones-del-servicio/index.html`. Se verificó que los 89 archivos existentes conservan sus hashes.
- Se añadió una regla exacta de Nginx para resolver también la URL sin barra final, mediante reescritura interna y sin redirecciones a un puerto interno.
- Se recreó únicamente el cliente. API, base de datos y proxy conservan sus contenedores; no se tocaron variables de entorno, datos ni migraciones.
- No se desplegaron los otros cambios locales de administración. El nuevo enlace del footer del código fuente se incluirá en el próximo despliegue completo del cliente; este despliegue conserva el bundle anterior y publica el documento en su URL directa.

## Verificación

- Compilación Vite correcta; advertencias preexistentes de Sass y tamaño de chunks.
- Lectura y navegación por las diez secciones en 1440 × 1000 y 390 × 844, con JavaScript desactivado y sin desbordamiento horizontal.
- Imagen candidata con Nginx aislado de la red: ambas variantes de URL devuelven el HTML esperado.
- HTTPS público: ambas variantes responden 200, `Content-Type: text/html`, sin redirección y con el hash exacto del documento. También pasa con el agente `facebookexternalhit/1.1`; esto comprueba accesibilidad, no aprobación por Meta.
- Portada y política de privacidad mantienen el HTML anterior y responden 200. `/api/account` sin sesión conserva el 401.
- SHA-256 del HTML publicado: `7cab46698a89a7ffe49cbcc9759b82ca2e106b8dca81effce856f8f8f29834ae`.

## Evidencia y reversión

Preparación, manifiesto, capturas y script: `tmp/terms-deploy-20261024/` del checkout. Evidencia de producción: `/opt/watsolution/terms-20261024-v1/result.json` y `baseline.json`.

Los archivos anteriores `compose.yaml` y `nginx-static.conf` se conservan en `/opt/watsolution/terms-20261024-v1/rollback/`. El despliegue restaura ambos y recrea solo `client` si falla la validación. Para una reversión manual posterior, comprobar primero que no haya despliegues más recientes, restaurar ambos archivos y ejecutar `docker compose -f /opt/watsolution/production/compose.yaml up -d --no-deps --wait client`. No borrar volúmenes ni restaurar datos antiguos.

El usuario confirmó que la aplicación de Meta ya está en modo Activo. Esta publicación no cambia ajustes de Meta ni envía mensajes de WhatsApp.
