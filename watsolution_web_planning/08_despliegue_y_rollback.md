# Despliegue y rollback

Plan futuro: **no se desplegó ni modificó configuración en este encargo**. La topología real debe acordarse en T-001/T-031. Se presupone staging aislado, imágenes por digest, secretos gestionados y operador con acceso autorizado. Ventanas sugeridas, no confirmadas: contención fuera de pico con 30–60 min de observación atendida; cambios de datos con 60–120 min reservados después de ensayo. El tamaño real de BD y SLA pueden invalidar esas ventanas.

## Protocolo común paso a paso

1. Asociar release a commit, lock, digest, esquema esperado y tareas. Revisar precondiciones, pruebas, alertas y operador/sustituto. Congelar cambios ajenos.
2. Crear respaldo previo verificable; confirmar restauración reciente y capacidad de recuperación. Separar copia de datos y versiones de secretos sin imprimirlos. Registrar saldos y últimas transacciones para conciliación.
3. En staging, ejecutar mismo artefacto, migraciones aditivas y pruebas de cliente anterior/nuevo. Repetir caso que fallaba antes de la corrección.
4. Expandir esquema primero solo cuando lo requiere la tarea: nuevas tablas/columnas compatibles, backfill por lotes, validación, índices. No eliminar columnas aún usadas. Migraciones aplicadas quedan inmutables; nunca arrancar synchronize histórico.
5. Desplegar backend compatible, luego frontend; activar consumidor/flags solo tras smoke. Para cambios puramente UI se puede desplegar por separado. Mantener webhooks recibidos de forma durable aunque el checkout esté suspendido.
6. Hacer canario si plataforma lo soporta; si no, ventana atendida y cambio controlado con digest anterior listo. No se presume soporte de canario en Railway sin comprobarlo.
7. Verificar identidad, sesiones, alta, pagos/PDF, health y alertas. Comparar p95/error rate y saldos; observar 24–48 h antes de retirar compatibilidad.
8. Contraer esquema solo en release posterior, tras demostrar que no quedan consumidores viejos y con política de retención. La contracción tiene su propia revisión/ventana; no se combina con primera corrección.

## Condiciones de parada y reversión

Parar inmediatamente ante acceso entre cuentas, referencia/pago perdido, PAID→PENDING, pérdida de registros o secreto expuesto. Umbrales propuestos a validar: >1% de 5xx durante 5 min, p95 >2 veces baseline durante 10 min, readiness no recuperado en 2 min o diferencia financiera no explicada de cualquier importe. Poca muestra exige revisar eventos concretos, no ignorar alarma por porcentaje.

1. Suspender función/flag afectado y tráfico nuevo si procede; conservar recepción durable de webhooks.
2. Capturar evidencia mínima sin PII/secretos y preservar eventos posteriores al despliegue.
3. Revertir al digest anterior **solo si sigue siendo seguro y compatible** con esquema y secretos rotados. Si reabre un defecto Alto, mantener función deshabilitada y corregir hacia adelante.
4. Dejar cambios aditivos sin uso cuando sea seguro. Para índice de rendimiento, retirar/cancelar el nuevo índice bajo revisión; no quitar unicidad financiera sin contención.
5. Si se necesita restaurar datos, aprobar alcance e intervalo, reconciliar pagos/eventos recibidos después del backup, restaurar en clon y validar antes de promover. No sobreescribir una BD viva con una copia vieja por automatismo.
6. Revocar tokens pendientes afectados. Nunca volver a contraseñas, claves JWT, sesiones o cuentas de ejemplo expuestas.
7. Repetir smoke, reconciliar datos, comunicar recuperación y abrir acción sobre causa raíz.

## Despliegue por fase

| Fase | Orden y release | Flags/controles propuestos | Reversión segura | Comunicación |
|---|---|---|---|---|
| F0 | Accesos/backup → rotación coordinada → baseline; sin migraciones de aplicación | Ventana de mantenimiento para renovación de sesiones si necesaria | Credencial nueva adicional, nunca la comprometida; destino restore aislado | Avisar posible nuevo login y canal de soporte, sin divulgar claves |
| F1 | Backend identidad/PDF/Bold/logout → frontend chat/HTML/demo; patches separados | Nuevos flags por implementar: portal restringido, checkout pausado, PDF regeneración y chat; valores server-side seguros | Deshabilitar función o servir artefacto seguro; no restaurar lógica vulnerable | Informar operaciones financieras temporalmente suspendidas y alternativa controlada |
| F2 | Baseline → conciliación de datos → FK/índices → tokens/ledger → servicios → UI → E2E | Activación/envíos y pagos manuales inicialmente desactivados hasta smoke | Mantener esquema expandido y ledger; suspender nuevos intentos/envíos, no borrar eventos | Instrucciones de invitación/reset; advertir logout global de rotación y capacitación admin |
| F3 | DTO compatibles → datos/métricas → outbox/consumidor → UI por lotes → privacidad/purga → gates | CSP report-only antes de enforce; consumidor único; purga dry-run antes de lotes; UI por rutas | Pausar cron/purga; retener outbox; revertir lote UI compatible; no resucitar sesiones eliminadas | Avisar cambios de privacidad y atención de derechos por canal aprobado |
| F4 | Recursos/SEO/licencias → docs/código muerto → reauditoría → simulacro aislado | Sin flags globales nuevos; simulacro con destino separado | Revertir recurso o documento individual; detener ensayo si sale del sandbox | Entrega de runbooks, responsables y calendario de continuidad |

## Casos que no tienen rollback simétrico

- **Rotación:** se recupera emitiendo otra clave nueva, no reactivando la anterior. Comprobar que se revocaron sesiones refresh además de invalidar JWT si la exposición lo exige.
- **Historial Git:** revocar primero. Reescritura y coordinación de forks requieren aprobación concreta durante implementación. Guardar copia forense restringida no equivale a volver a publicarla.
- **Pagos:** el rollback no deshace dinero recibido en Bold; conciliación y ajustes compensatorios preservan referencia, autor y motivo.
- **Purga:** no es reversible con un revert de código. Dry-run, revisión de elegibilidad y protección de retención preceden borrado; restore selectivo exige base autorizada y no reactiva sesiones.
- **HSTS:** el navegador puede retener la política; validar HTTPS y comenzar con periodo corto antes de ampliarlo.
- **Baseline:** no editar retrospectivamente migraciones aplicadas para aparentar consistencia. Definir nuevo baseline y upgrades por versión con prueba de restauración.

## Backups, ventana y responsables

Objetivos propuestos para aprobación en T-002: RPO ≤15 min para datos operativos y RTO ≤60 min; pagos deben conciliarse sin pérdida lógica usando el registro del comercio. No están demostrados hoy. Si el proveedor no soporta esos objetivos, ajustar arquitectura/presupuesto y el compromiso antes de publicar SLA.

El líder decide go/no-go con QA y dueño de facturación; DevOps ejecuta despliegue; responsable de datos valida cambios de titularidad/retención; soporte comunica impacto con texto revisado. No se envió ningún aviso desde esta planificación. El rollback específico de cada tarea está en CSV y fichas.
