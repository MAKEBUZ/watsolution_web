# Acceso administrativo y pruebas de WhatsApp

## Comportamiento

- `ROLE_ADMIN` hereda el acceso a las rutas de usuario en Vue y Nest. Se mantienen autenticación, permisos de usuarios normales y comprobaciones de propiedad.
- `/forbidden` es una ruta de recuperación: administrador → `/admin/resumen`, usuario → `/portal`, anónimo → `/login`. Un usuario que intenta una sección de otro rol vuelve a su inicio con un aviso, sin bucles.
- El administrador puede seleccionar un suscriptor en `/portal` y consultar su información mediante el endpoint administrativo `/api/portal/subscribers/:id`.
- `/admin/whatsapp`, accesible desde los menús administrativos de escritorio y móvil, permite pruebas manuales de conexión, factura nueva, próximo vencimiento y pago confirmado.

## API de pruebas

- `GET /api/admin/whatsapp`: configuración pública del canal, estado/texto de las plantillas y las últimas 20 pruebas del administrador actual; destinatarios enmascarados.
- `POST /api/admin/whatsapp/tests`: `{phone, type, consent, requestId}`. `type` admite `connection`, `created`, `due`, `paid`; `requestId` es UUID v4.
- Autenticación y rol administrativo obligatorios. Se vuelve a comprobar en base de datos que el administrador está activo y conserva su rol, al registrar y antes de enviar.
- Una prueba cada 30 segundos, máximo 10 por hora por administrador. Bloqueo transaccional y clave persistente evitan duplicados por concurrencia o reintentos.
- La prueba de conexión usa un texto fijo sin datos de facturación. Requiere una respuesta reciente en la cola, cuya caducidad procede del timestamp firmado del mensaje entrante. Mantiene el margen conservador de 23 horas de la integración existente.
- Las pruebas de notificaciones usan exactamente las plantillas `UTILITY` aprobadas para el idioma configurado. Cada una puede probarse de forma independiente cuando Meta la aprueba. La caché de estado dura cinco minutos.
- Los ensayos no generan facturas, pagos ni suscripciones. Se registran en la cola existente con tipos `admin.test.*`, sin `invoice_id` ni `link_id`.
- La interfaz diferencia aceptación por Meta, entrega, lectura, fallo y resultado incierto. Los resultados ambiguos no se reenvían automáticamente. No se registran tokens ni contenido privado en diagnósticos.

## Validación

- 11 pruebas de navegación: restauración de sesión, cierre de sesión, acceso administrativo, recuperación de enlaces antiguos y restricción de otros roles.
- 25 pruebas del webhook: firma y validación de solicitudes existentes.
- 29 comprobaciones de integración PostgreSQL en contenedores y red desechables, con proveedor simulado; incluye autorización, revocación de rol antes del envío, consentimiento, ventana de respuesta, idempotencia, límites, enmascarado y aprobación individual de plantillas, además de las comprobaciones previas del asistente.
- Navegador a 1440 y 390 px: selección de suscriptor, recuperación de `/forbidden`, exclusión de usuarios normales, envío simulado, bloqueo de plantillas pendientes, sin errores JavaScript ni desbordamiento horizontal.

## Publicación

Paquete `admin-access-20261024-v1`. Herramientas reproducibles y registros locales en `tmp/admin-access-release/`. El frontend se construye desde la base versionada con los cambios de acceso, portal y pruebas; otros cambios administrativos anteriores siguen separados de esta publicación. Se conservan los recursos anteriores, `/whatsapp/` y las condiciones del servicio.

El backend superpone únicamente los módulos de WhatsApp necesarios, el guard de roles, el portal y la búsqueda de suscriptores. No requiere migraciones, cambios de variables ni permisos nuevos en la base. La publicación guarda una copia cifrada y permite restaurar las imágenes anteriores si fallan las comprobaciones. Los resultados finales y hashes se guardan en `/opt/watsolution/admin-access-20261024-v1/result.json` cuando el despliegue termina.

Al consultar Meta el 24 de octubre de 2026 a las 01:01, hora de Colombia, las tres plantillas estaban `PENDING`. La prueba de conexión está disponible mediante la ventana de respuesta mientras se revisan.

Publicación completada y comprobada en producción:

- API: `sha256:0c01c0662bc0804b89c14d63b793de65c243be0c2465654fc9e5fa42a3cf1812`.
- Cliente: `sha256:a9dc3c27aa1582b211e99e6a454488fe0f5aad406cb9aa63d7d15cc6d3a400ed`.
- Sitio, portal, condiciones y página de WhatsApp responden. Los endpoints privados devuelven 401 sin sesión; el desafío de verificación del webhook continúa funcionando.
- Navegador real sobre el dominio público: `/forbidden` termina en `/login` para visitantes anónimos, `/admin/whatsapp` exige sesión y no se detectan errores JavaScript.
- Auditoría de solo lectura del servicio publicado: canal configurado, consulta del rol e historial correcta y tres plantillas todavía `PENDING`. No se enviaron mensajes reales de prueba.
