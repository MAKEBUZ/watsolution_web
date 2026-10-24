# WhatsApp: despliegue en AWS

Desplegado el 23 de octubre de 2026 a las 23:57, America/Bogota. Verificaciones externas completadas a las 23:58 y suscripción de la aplicación confirmada a las 23:59.

## Resultado

- Webhook: `https://api.watsolution.online/api/whatsapp/webhook`.
- Servidor existente: AWS Lightsail, despliegue Docker Compose en `/opt/watsolution/production`.
- Imagen de API: `watsolution-server:whatsapp-20261024T045338Z`.
- Digest: `sha256:d7593f25633374a66077275e04dedcff924f56efea60a49b2a387e2538360a85`.
- API, cliente y PostgreSQL saludables al finalizar.
- La aplicación asociada al token quedó suscrita a la WABA configurada. La consulta posterior confirmó una aplicación suscrita.

## Alcance

La imagen parte de `watsolution-server:security-offline-20261023`, cuyo digest se comprobó antes y después de la preparación. Añade el módulo, controlador y servicio de WhatsApp compilados y registra el módulo en el AppModule que estaba en producción. No se sustituyeron otros módulos ni dependencias. Los demás cambios locales de administración siguen fuera de este despliegue.

Se copiaron únicamente las ocho variables `WHATSAPP_*` del entorno local al entorno privado `/etc/watsolution/api.env`, activando `WHATSAPP_ENABLED=true`. El archivo conserva propietario root y permisos 600. Las variables restantes de producción se conservaron. Las credenciales viajaron por la entrada estándar de SSH con verificación estricta de la clave del host, fuera de argumentos y logs. La copia temporal del entorno de WhatsApp se retiró después de comprobar el servicio.

El contenedor de API fue el único recreado. Los identificadores de los contenedores de cliente, proxy y base de datos permanecieron iguales. No se ejecutaron migraciones de base de datos. El `.env` local también quedó con WhatsApp activado.

## Validación

- TypeScript compiló correctamente y las 25 pruebas unitarias/HTTP pasaron.
- Meta aceptó una consulta con el token y `appsecret_proof`, verificando la correspondencia de la clave de aplicación. Otra consulta confirmó que el número pertenece a la WABA configurada.
- La imagen candidata pasó cinco pruebas del webhook, aislada de la red externa y sin base de datos.
- Comprobaciones públicas: desafío correcto 200 con respuesta exacta; token de verificación incorrecto 403; evento sin firma 403; evento vacío firmado 200; cuerpo alterado 403; cuenta protegida sin sesión 401; web 200.
- Ninguna comprobación envió mensajes de WhatsApp. Falta la prueba real iniciada desde el teléfono del destinatario tras guardar el webhook en Meta.

## Respaldo y reversión

Se ejecutó correctamente el respaldo cifrado existente antes del cambio. La configuración anterior se conserva, con permisos restringidos, en:

```text
/opt/watsolution/whatsapp-20261024T045338Z/rollback/compose.yaml
/opt/watsolution/whatsapp-20261024T045338Z/rollback/api.env
```

La imagen anterior sigue disponible. El procedimiento incluía restauración automática del entorno y Compose si fallaba el arranque o la verificación pública; no fue necesario activarla. Una reversión manual debe restaurar esos dos archivos y recrear únicamente `api`, sin borrar volúmenes ni restaurar datos antiguos sobre la base activa.

Código del despliegue, manifiesto y evidencia sin secretos: `tmp/whatsapp-deploy-20261024T045338Z/` en este checkout. Evidencia y configuración privada en el servidor: `/opt/watsolution/whatsapp-20261024T045338Z/`. La suscripción de la aplicación en Meta es independiente del cambio de imagen y no se elimina al revertir Docker.

## Estado de Meta y prueba pendiente

El 24 de octubre de 2026 el usuario confirmó que la aplicación ya está en modo Activo. Este estado fue comunicado por el usuario; no se cambió desde AWS ni se comprobó mediante la API de Meta.

En WhatsApp → Configuración → Webhooks, confirmar la URL anterior con el valor de `WHATSAPP_VERIFY_TOKEN` del `.env` y la suscripción al campo `messages`. Después, enviar un texto desde el destinatario permitido y confirmar la respuesta fija de WatSolution. El token permanente de acceso no debe pegarse en el campo de verificación.

La página pública de condiciones del servicio se documenta en `terms-deployment-2026-10-24.md`.
