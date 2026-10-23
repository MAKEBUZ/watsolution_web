# Ejecución: contrato HTTP de sesiones web con PostgreSQL

Fecha: 2026-10-05. Continúa [autenticación persistida](24_ejecucion_autenticacion_persistida.md). Ampliación de T-014 y evidencia complementaria de T-008.

## Alcance

Rama `test/web-cookie-sessions`, desde `integration/remediation-phase-1`. Se amplía la suite HTTP existente con ocho casos web, manteniendo usuarios, roles, bcrypt, AuthService, SessionService, JWT, guards y PostgreSQL reales. Solo se modifica código de pruebas; no se cambia la política de sesiones de producción.

Los nuevos casos verifican:

1. Login y renovación emiten la cookie `__Host-watsolution-refresh` con Path=/, HttpOnly, Secure, SameSite=Strict y sin Domain; las respuestas incluyen no-store y no exponen refresh_token en JSON. La rotación cambia el refresh y persiste el historial de hashes.
2. Origen no permitido: login, renovación y logout responden 403 sin modificar sesiones ni emitir cookies.
3. Origen ausente: el mismo rechazo y ausencia de efectos persistidos.
4. El modo web rechaza refresh recibido solo por cuerpo; el transporte nativo no acepta una cookie como sustituto de su refresh por cuerpo o del JWT requerido por logout.
5. Logout web con JWT vencido revoca la familia identificada por el refresh, borra la cookie y es repetible. Otra sesión del mismo usuario sigue válida.
6. Un refresh falso que conoce el ID de familia no revoca la sesión legítima.
7. Dos renovaciones simultáneas con la misma cookie producen una rotación y un rechazo de replay. La familia queda revocada; el token recién emitido tampoco conserva acceso.
8. Renovar tras desactivar la cuenta responde 401 y deja la revocación persistida.

La suite fija un origen sintético permitido y restaura WEB_ORIGINS al terminar. Se mantienen las restricciones del fixture descartable y no se usan cuentas ni credenciales operativas.

## Límites de la evidencia

Las cookies se envían manualmente con Supertest. Comprobar Set-Cookie no demuestra que un navegador aplique Secure, SameSite o el prefijo __Host bajo TLS. Tampoco certifica CORS, proxy, varias pestañas reales ni el manejo del frontend ante dos renovaciones concurrentes. El caso de concurrencia documenta la política actual del servidor; el recorrido multipestaña sigue pendiente.

No se presenta una prueba HTTP local como despliegue HTTPS. No se carga AppModule completo. Los servicios externos y componentes fuera de estos recorridos conservan sus dobles de prueba.

La suite compiló localmente y se detuvo antes de conectar por ausencia de destino explícito: [integration-local.log](ejecucion/2026-10-05-lote-08/integration-local.log). Sus 27 fallos de prerrequisito no son pruebas de integración aprobadas. La suite completa tiene 27 casos PostgreSQL previstos: 19 HTTP y ocho previos de sesiones, pagos, PDF y portal.

## Gitflow y cierre

Commits con MAKEBUZ, sin coautoría del asistente. Se preservan los cambios locales previos y los reportes históricos. No se despliega ni se promueven main/develop. El resultado de CI se incorpora antes de integrar la rama.

T-014 continúa parcial hasta navegador HTTPS, multipestaña, proxy y staging. El planning mantiene sus 77 tareas; no se convierte la ampliación de pruebas en cierre operativo.

## Resultado verificado e integración

[GitHub Actions 37410088785](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37410088785), SHA `79f0e8d2720aa69c894117a1dde294bf296454d5`: `postgres-sessions` y `validate` finalizaron en success. Se aprobaron 27 casos PostgreSQL, auditoría de producción con umbral high, TypeScript, 112 pruebas backend, 203 frontend y build. Evidencia: [ci.json](ejecucion/2026-10-05-lote-08/ci.json). Pasar el umbral de auditoría no implica ausencia de todos los avisos.

Integración publicada: `bc0189d08dcee3539dfb86057f185dd8a335ba93`. Rama de pruebas: `48b34b1a9595164769ee0642a299d3bc537d6d92`. Frente al SHA probado, solo cambia el README que registra el resultado. Las referencias remotas fueron comprobadas; main/develop siguen en `95606e1` / `595a7b6`. No se atribuye una ejecución nueva al merge.

No fue necesaria una corrección funcional en este lote. La prueba de concurrencia confirma revocación por replay, no una experiencia multipestaña satisfactoria: el frontend coordina renovaciones con navigator.locks cuando está disponible, lo que requiere ensayo real. Siguiente paso: preparar y ejecutar el recorrido del navegador en un entorno HTTPS aislado, conservando como pendientes proxy y staging hasta disponer de evidencia propia.

Seguimiento: [77 tareas](ejecucion/2026-10-05-lote-08/estado-tareas.json), [verificación](ejecucion/2026-10-05-lote-08/verificacion.json), [manifiesto SHA-256](ejecucion/2026-10-05-lote-08/manifest.json).
