# WhatsApp: cuentas, facturas, consumo y avisos

## Uso

1. Abrir https://watsolution.online/whatsapp/ con la sesión de un suscriptor de WatSolution. Si es necesario iniciar sesión, hacerlo en el portal y volver a este enlace.
2. Introducir el número personal con código de país y generar un código. Se permite generar uno por minuto; cada código dura 10 minutos y es de un solo uso.
3. Enviar `VINCULAR <código>` desde ese mismo número al chat del negocio. El botón «Abrir WhatsApp» prepara el mensaje; el usuario confirma su envío.
4. Comprobar la vinculación en la página. Es válida durante 90 días y se puede retirar antes.
5. Escribir `FACTURAS` o `1` para consultar las últimas cinco facturas y el saldo pendiente total. Escribir `CONSUMO` o `2` para consultar el consumo de las últimas cinco facturas no anuladas. También se reconocen preguntas que contienen factura, saldo, deuda, consumo o lectura.

Las respuestas pueden tardar unos segundos: la cola se procesa cada 15 segundos. El consumo procede de `invoice.consumption_m_3`, que representa el consumo facturado del período; no se suman lecturas acumuladas del medidor. Los documentos se consultan y descargan iniciando sesión en el portal; no se publican enlaces anónimos a PDFs.

Cada cuenta debe tener exactamente un perfil de suscriptor. Una cuenta administrativa sin perfil personal no obtiene acceso a facturas ajenas mediante WhatsApp. No se permite buscar datos por cédula, nombre o identificador de factura proporcionados en el chat.

## Avisos solicitados

El usuario eligió factura nueva, vencimiento próximo y pago confirmado. Se activan expresamente en la página de vinculación, después de verificar el número y cuando las tres plantillas estén aprobadas:

| Evento | Plantilla en Meta | Envío |
| --- | --- | --- |
| Factura nueva | `watsolution_factura_disponible_v1` | Facturas nuevas pendientes posteriores al consentimiento |
| Vencimiento | `watsolution_factura_por_vencer_v1` | Tres días antes del vencimiento, si sigue pendiente |
| Pago confirmado | `watsolution_pago_confirmado_v1` | Transición real de la factura a `PAID`, posterior al consentimiento |

Plantillas de utilidad, idioma `es`, con texto genérico y enlace al portal. No contienen importes, documentos de identidad ni datos del suscriptor. Se presentaron a Meta el 24 de octubre de 2026; el último estado consultado durante el despliegue era `PENDING` para las tres. La aplicación consulta el estado cada cinco minutos como máximo y solo permite activar/enviar avisos si todas tienen categoría `UTILITY`, estado `APPROVED` e idioma configurado. Una aprobación posterior no requiere volver a desplegar. Una plantilla rechazada, pausada o reclasificada mantiene los avisos deshabilitados; revisar WhatsApp Manager.

`BAJA` desactiva los avisos y cancela los que estén en cola. Las consultas siguen disponibles. `DESVINCULAR` elimina el vínculo y el acceso a datos desde ese número. También se puede hacer desde el portal. Un aviso que ya se haya entregado al proveedor no puede retirarse. Volver a vincular el número requiere activar de nuevo los avisos.

Los eventos se registran en la misma transacción de PostgreSQL que inserta una factura o cambia su estado a pagada. Esto cubre las escrituras desde web, Flutter y el proceso de confirmación de pagos sin depender de una llamada opcional al servicio de notificaciones web. No se crean eventos retroactivos al instalar la migración. El recordatorio puede incluir una factura existente que todavía esté pendiente y venza dentro de tres días, si el usuario activa los avisos.

## Seguridad y entrega

- Webhook público con desafío GET y firma HMAC-SHA256 de Meta sobre el cuerpo original; se conservan los filtros por WABA, número del negocio y fecha del mensaje.
- Endpoints `/api/whatsapp/account` protegidos por el JWT y la sesión existentes. El servidor obtiene la identidad autenticada; no acepta un `userId` o `personId` enviado por el cliente.
- Código aleatorio de 48 bits guardado como SHA-256, ligado a usuario, suscriptor, número y vencimiento. Hasta cinco intentos de vinculación por hora/número; hasta 60 consultas ordinarias por hora/número. Baja y desvinculación siguen disponibles al alcanzar ese límite.
- Un número no puede vincularse simultáneamente a dos cuentas. Se comprueba el usuario activo y su relación única con el suscriptor al consultar y antes de enviar datos privados.
- Recibos y cola persistentes en PostgreSQL, claves únicas y bloqueos para concurrencia entre procesos. Los duplicados de Meta no repiten una respuesta o notificación.
- Solo respuestas a mensajes recientes se envían como texto libre, con vencimiento conservador de 23 horas desde el mensaje recibido. Los avisos proactivos usan plantillas aprobadas incluso si hay una conversación reciente.
- Se reintenta un 429 con espera creciente y un máximo de cinco intentos. Un timeout, interrupción tras reclamar el trabajo o respuesta ambigua del proveedor queda en `unknown`, sin reenvío automático: evita duplicar un mensaje ya aceptado. Los rechazos conocidos quedan en `failed`. Estos casos requieren revisión operativa; no se promete entrega exactamente una vez.
- Estados de entrega `sent`, `delivered`, `read` y `failed` vinculados al identificador del proveedor y destinatario, sin retroceder de entregado/leído a enviado.
- No se conservan los textos recibidos ni códigos en claro. El cuerpo de una respuesta pendiente se borra al enviarla, cancelarla o vencerla. Recibos, eventos y cola se eliminan a los siete días; los códigos vencidos se limpian diariamente. La política de conservación de respaldos del servidor es independiente.
- No se registran tokens, teléfonos, textos de consultas ni respuestas privadas en logs. El asistente usa consultas parametrizadas y respuestas deterministas; no envía datos de facturación a un proveedor de IA.

## Configuración y migración

Ver `server/.env.whatsapp.example`. Además de las credenciales existentes, se añadieron `WHATSAPP_ASSISTANT_ENABLED`, `WHATSAPP_BUSINESS_PHONE`, `WHATSAPP_NOTIFICATIONS_ENABLED`, `WHATSAPP_TEMPLATE_LANGUAGE` y los tres nombres `WHATSAPP_TEMPLATE_*`.

La migración aditiva `WhatsappAccounts1792819200000` crea cinco tablas y un trigger sobre `invoice`. Se aplica mediante `dist/whatsapp-migration.js` con `MIGRATION_DATABASE_URL` de la cuenta de migraciones y `MIGRATION_BACKUP_REVIEWED=yes`. La cuenta limitada de ejecución no puede crear tablas. Después de migrar se le conceden SELECT/INSERT/UPDATE/DELETE solo sobre las cinco tablas nuevas y USAGE/SELECT sobre `whatsapp_invoice_event_id_seq`. No ejecutar migraciones históricas ni `synchronize` sobre producción.

Prueba reproducible: `server/integration/whatsapp-assistant.cjs` requiere PostgreSQL desechable en el host `wa-assistant-test-db`, base `wa_assistant_test`. Crea exclusivamente datos ficticios, prueba con un rol sin permisos de DDL y sustituye las llamadas a Meta. No ejecutarla contra producción.

## Publicación y comprobaciones

Publicado el 24 de octubre de 2026 en el servidor existente de AWS Lightsail:

- API: `watsolution-server:whatsapp-assistant-20261024-v1`, digest `sha256:5b3c4eff5b98c4b0bf43ede78029755b44254540d36127f82f62ec305b00fa7d`.
- Cliente: `watsolution-client:whatsapp-assistant-20261024-v1`, digest `sha256:6ff79ebdf5ec3e292e7bfd35c102f2cb71a120ba170d20949e63478587438c69`.
- 25 pruebas de webhook, 21 comprobaciones con PostgreSQL real aislado, compilación TypeScript/Vite y pruebas visuales/funcionales en 390 y 1440 píxeles.
- HTTPS público 200 para `/whatsapp/` y `/whatsapp`; los endpoints de cuenta conservan 401 sin sesión. Desafío correcto y evento vacío firmado verificados. Navegación real sin sesión muestra «Primero, inicia sesión» y no presenta errores de JavaScript.
- Permisos del rol de ejecución comprobados en producción. Cola vacía al finalizar las pruebas; no se enviaron mensajes reales ni se vincularon cuentas de clientes desde las herramientas.
- Respaldo cifrado previo. Se actualizaron únicamente el módulo de WhatsApp y sus dependencias nuevas, más la página independiente y cuatro archivos públicos asociados. Los 90 archivos anteriores del cliente se conservaron byte por byte. Los cambios locales anteriores de administración y el enlace nuevo del footer/Soporte en su código fuente no forman parte de este despliegue parcial.
- Primer intento de migración con el rol de ejecución rechazado antes de actualizar servicios. Se corrigió usando la cuenta de migraciones existente y se aplicaron permisos acotados al rol de ejecución.

Evidencia y scripts locales: `tmp/whatsapp-assistant-release/`. Evidencia de servidor: `/opt/watsolution/whatsapp-assistant-20261024-v1/`. El despliegue guarda Compose, Nginx y el entorno anterior en `rollback/`, con permisos privados. Para revertir código, restaurar esos archivos tras comprobar que no haya despliegues posteriores y recrear solo API/cliente. Conservar la migración aditiva y los datos; no borrar las tablas para revertir el código.

## Referencias

- [Política oficial de WhatsApp Business](https://whatsappbusiness.com/policy/): ventana de atención, plantillas y consentimiento.
- [Verificación de webhooks, documentación de Meta](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/): referencia del protocolo; no se usa ese SDK archivado.
