# WhatsApp Cloud API: primera conexión de WatSolution

> **Actualización del 24 de octubre de 2026:** el usuario confirmó la respuesta de prueba y ya se publicó el asistente con vinculación de cuenta, consultas de facturas/consumo y avisos con consentimiento. La guía vigente de uso y operación está en [whatsapp-assistant.md](whatsapp-assistant.md). Las instrucciones siguientes documentan la conexión inicial y el modo de respuesta fija, que solo se conserva cuando `WHATSAPP_ASSISTANT_ENABLED=false`.

Esta integración permite probar un número habilitado en Meta, de prueba o registrado, y responde con un mensaje fijo de confirmación a los destinatarios autorizados. No consulta facturas ni vincula una identidad de WhatsApp con una cuenta del portal.

**Estado del 23 de octubre de 2026:** backend desplegado en AWS Lightsail, variables de WhatsApp activadas y desafío del webhook validado por HTTPS. La aplicación ya está suscrita a la WABA. Falta confirmar la URL y el token de verificación en el panel de Meta, activar el campo `messages`, comprobar el modo Activo de la aplicación para el número registrado y probar un mensaje real. El 24 de octubre el usuario informó del aviso de Meta que limita los webhooks a pruebas del panel cuando la aplicación está en desarrollo. Ver `whatsapp-deployment-2026-10-23.md`.

## 1. Enviar la prueba desde Meta

Ya dentro de tu aplicación, abre **WhatsApp → Configuración de la API** (en algunas cuentas, **Prueba de API**).

1. Selecciona el número de prueba de Meta en **Desde**.
2. En **Para**, agrega tu número personal con código de país y completa la verificación que solicite Meta. Si ya elegiste Colombia (+57), no repitas el prefijo en el campo del número.
3. Genera el token temporal si lo pide la pantalla y pulsa **Enviar mensaje**, usando la plantilla `hello_world`.
4. Confirma que recibiste el mensaje en tu WhatsApp. Esto comprueba Meta → teléfono; todavía no comprueba WatSolution.

Tu número personal es el destinatario. El emisor sigue siendo el número de prueba de Meta: no necesitas migrar tu WhatsApp personal.

## 2. Configurar el backend

Usa `server/.env.whatsapp.example` como referencia. **Añade** sus variables al entorno del servidor; no reemplaces el `.env` existente, que contiene la configuración de base de datos y autenticación. `server/src/main.ts` lee `.env` desde el directorio de ejecución; si ejecutas desde `server`, corresponde a `server/.env`. En un servidor desplegado, configura las variables en ese entorno.

| Variable | Valor |
| --- | --- |
| `WHATSAPP_ENABLED` | `true` al terminar de completar las demás variables |
| `WHATSAPP_GRAPH_VERSION` | Versión `vXX.0` de la URL del ejemplo de Meta; copia la que aparezca en tu aplicación |
| `WHATSAPP_PHONE_NUMBER_ID` | **Identificador del número de teléfono**, no el número visible ni el ID de la aplicación |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **Identificador de la cuenta de WhatsApp Business** (WABA) |
| `WHATSAPP_ACCESS_TOKEN` | Token de usuario del sistema generado en Meta; también admite un token temporal para pruebas. El despliegue actual usa el token de usuario del sistema proporcionado por el usuario |
| `WHATSAPP_APP_SECRET` | **Configuración de la aplicación → Básica → Clave secreta de la aplicación** |
| `WHATSAPP_VERIFY_TOKEN` | Secreto aleatorio que creas tú, mínimo 32 caracteres; luego copias el mismo valor al webhook de Meta |
| `WHATSAPP_TEST_RECIPIENTS` | Tu número personal verificado, solo dígitos con país, sin `+` ni espacios. Para Colombia: `57` seguido de los diez dígitos. Hasta cinco números separados por comas |

Para generar el token de verificación en tu terminal privada:

```powershell
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
```

No compartas tokens o secretos por chat, ni los guardes en el archivo de ejemplo, Git, Vue o Flutter. No confundir el token de acceso de Meta, la clave secreta de la aplicación y el token de verificación: son tres valores diferentes.

## 3. Publicar el webhook

El backend incorpora estos dos métodos en la misma ruta:

```text
GET  /api/whatsapp/webhook
POST /api/whatsapp/webhook
```

Debe ejecutarse esta versión del backend y ser accesible con HTTPS público. Una URL de `localhost` no es accesible desde Meta. Para pruebas locales, necesitas un túnel HTTPS al puerto del backend; en un despliegue, necesitas publicar el cambio y reiniciar el backend con las variables configuradas.

Si lo publicas en el dominio de API del proyecto, la URL resultante será:

```text
https://api.watsolution.online/api/whatsapp/webhook
```

**Esta URL ya está desplegada y verificada.** Guardar cambios futuros en el `.env` local no modifica el servidor; hay que actualizar su entorno y recrear la API. Una visita directa sin los parámetros de verificación devuelve 403 deliberadamente.

El proxy debe conservar el cuerpo JSON original y `X-Hub-Signature-256`. Evita registrar el query string de la verificación y el contenido de los mensajes en los logs de acceso.

## 4. Suscribir Meta

1. En tu aplicación, abre **WhatsApp → Configuración → Webhooks** (o la configuración de Webhooks del objeto **WhatsApp Business Account**).
2. En **URL de devolución de llamada**, introduce la URL HTTPS completa del paso anterior.
3. En **Token de verificación**, copia exactamente `WHATSAPP_VERIFY_TOKEN`.
4. Pulsa **Verificar y guardar**.
5. En los campos del webhook, activa la suscripción a **`messages`**.
6. La aplicación ya quedó suscrita a la WABA configurada durante este despliegue. Si cambias de aplicación o cuenta, revisa esa suscripción: Meta documenta `GET /{WABA-ID}/subscribed_apps` para consultarla y `POST /{WABA-ID}/subscribed_apps` para suscribirla, usando la versión de Graph y un token con los permisos correspondientes.
7. Para el número registrado, comprueba que la aplicación figure como **Activa / Live / Publicada**. El aviso de Meta indica que, en desarrollo, solo entregará webhooks de prueba del panel. Busca el selector **Modo de la app** o el apartado **Publicar**, según la interfaz. Completa los requisitos que muestre Meta; publicar la aplicación, obtener revisión de permisos y verificar el negocio son pasos diferentes. El aviso por sí solo no confirma qué requisitos de cuenta serán obligatorios. Un token permanente y un webhook validado no cambian el modo de la aplicación.

## 5. Prueba completa

Estado comunicado por el usuario el 24 de octubre de 2026: la aplicación ya está en modo Activo. Falta confirmar la recepción y respuesta a un mensaje real tras la configuración del webhook.

Desde el número personal configurado en `WHATSAPP_TEST_RECIPIENTS`, envía **Hola** al chat del número conectado en Meta. WatSolution debería responder: **“Hola 👋 Soy WatSolution. La conexión de prueba con WhatsApp está funcionando…”**.

El botón de eventos de prueba del panel puede usar IDs ficticios. El backend ignora cuentas, números y remitentes que no coinciden con su configuración, por lo que la prueba concluyente es un mensaje real desde tu destinatario verificado.

## Diagnóstico

| Síntoma | Revisar |
| --- | --- |
| No llega `hello_world` | Destinatario verificado seleccionado en Meta, prefijo de país y token temporal vigente |
| Meta no valida la URL | URL pública HTTPS, código nuevo desplegado, variables completas, `WHATSAPP_ENABLED=true`, token de verificación idéntico |
| HTTP 403 en GET | Token de verificación incorrecto; no uses el token de acceso en ese campo |
| HTTP 403 en POST | Clave secreta de esa aplicación y conservación del cuerpo original por el proxy |
| HTTP 503 | Configuración incompleta/desactivada o error de envío a Meta; el backend registra el código HTTP del rechazo sin el contenido privado |
| Llega el evento pero no responde | IDs de WABA/teléfono, destinatario en `WHATSAPP_TEST_RECIPIENTS`, mensaje de texto reciente, suscripción `messages` |
| Solo llegan pruebas del panel de Meta | Modo de la aplicación y requisitos de publicación. Para el número registrado, activar la app; comprobar también `messages` y la suscripción a la WABA |
| Funcionó y luego dejó de responder | Caducidad o revocación del token, cambios de permisos o activos; actualizarlo y recrear la API. Un token sin vencimiento programado también puede ser revocado |

## Alcance de esta primera prueba

El webhook valida la firma HMAC de Meta, limita las respuestas a los destinatarios de prueba y omite estados de entrega para evitar bucles. Responde solo a textos recientes (menos de 23 horas) con contenido fijo, sin reenviar texto recibido ni datos personales de facturación. Un error al enviar devuelve 503 para permitir reintentos.

La deduplicación es temporal, en memoria y para un proceso. Un reinicio, varias réplicas o un fallo después de que Meta acepte un envío pueden provocar respuestas repetidas. Antes de automatizar facturas o desplegar a escala, hace falta una bandeja duradera/cola, vinculación verificada de cuentas y las plantillas y permisos de producción correspondientes.

## Referencias oficiales

- [Inicio de Cloud API (Meta)](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)
- [Ejemplos de WhatsApp de Meta](https://github.com/fbsamples/whatsapp-api-examples)
- [Suscribir una aplicación a la WABA (colección oficial de Meta)](https://www.postman.com/meta/whatsapp-business-platform/request/26gui66/subscribe-to-a-waba)
- [Verificación GET y firma POST en la documentación del SDK de Meta](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/webhooks/start/) — referencia del protocolo; el SDK está archivado y no se ha incorporado como dependencia.
