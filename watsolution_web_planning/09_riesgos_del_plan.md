# Riesgos de ejecutar el plan

Escala ordinal: probabilidad Baja/Media/Alta y impacto Bajo/Medio/Alto. Evaluación de planificación, no frecuencia medida. Reserva general 20% en horas; no reemplaza mitigaciones ni cubre cambios ilimitados de alcance.

| Riesgo | Probabilidad | Impacto | Señal / disparador | Mitigación y contingencia | Responsable |
|---|---|---|---|---|---|
| Secretos históricos todavía activos o copiados en forks | Media | Alto | Entorno sin evidencia de revocación | T-003 inmediata, revisar sesiones/accesos, sanear después; tratar como incidente si hay indicios de uso | Seguridad / dueño del servicio |
| Backup no restaurable o incompleto sin bucket/configuración | Media | Alto | Conteos/saldos o documentos no cuadran | T-002 con restore independiente; no-go de migración y corrección del respaldo | DevOps |
| Vínculos ambiguos de identidad generan bloqueo o reasignación indebida | Alta | Alto | userId inválido/duplicado | Denegar acceso ambiguo, revisión humana T-016, bitácora reversible; no inferir por correo | Backend / datos |
| Cambio de pagos duplica abono o pierde evento | Media | Alto | Diferencia entre ledger y comercio | Barreras PostgreSQL, idempotencia, recepción durable, conciliación diaria durante transición | Backend / facturación |
| Contratos DTO más estrictos rompen web o móvil externo | Alta | Alto | Subida de 400 en clientes válidos | Inventariar consumidores, contrato por ruta, release compatible y mantener solo campos permitidos | Líder técnico |
| Migración de datos bloquea tablas o falla con volumen real | Media | Alto | Locks/tiempo superan ensayo | Preflight, lotes, índices concurrentes si corresponde, timeout y mantenimiento aprobado | Backend / DBA |
| Cambio de esquema no admite la imagen anterior | Media | Alto | Smoke con versión previa falla | Expandir primero, evitar drop/rename inicial, rollback ensayado por versión | DevOps / backend |
| Logout o rotación deja a usuarios sin acceso y sin recuperación | Media | Alto | Fallos de soporte tras sesión expirada | Comunicación, admin de emergencia validado, despliegue coordinado, T-022–025 | Backend / soporte |
| Proveedor de correo o Bold sandbox no disponible | Alta | Alto | Credenciales/dominio/contrato sin entregar | Resolver al inicio, pruebas con dobles solo parciales; no cerrar viaje hasta probar entrega y sandbox | Producto / DevOps |
| CSP rompe checkout o PDFs | Media | Alto | Violaciones inesperadas o checkout vacío | Report-only, escenarios reales de sandbox y aplicación gradual; fallback seguro | Frontend / DevOps |
| Retirar compat rompe componentes fuera del lote | Alta | Medio | Imports/directivas indirectas no inventariados | Prototipo, matriz de 11 archivos b-* más estilos/usos indirectos, lotes T-057–061 y navegador | Frontend |
| El formato masivo genera conflictos y oculta cambios funcionales | Alta | Medio | Diff de miles de líneas mezclado | Commit de formato independiente, rebase coordinado y revisión semántica separada | Líder técnico |
| Pruebas verdes con guardas simuladas dan falsa confianza | Alta | Alto | Integración sustituye AuthGuard o usa SQLite | T-014 PostgreSQL/guardas reales, fault injection y Q-UI; distinguir unitario de operativo | QA |
| Una sola persona conoce deploy o facturación | Media | Alto | Ausencia bloquea release | Sustituto por perfil, revisión cruzada y onboarding independiente T-074 | Líder técnico |
| Falta de permiso para audit mantiene CVE desconocidos | Alta | Medio | Revisión automática o red sigue bloqueando | Informe de servicio aprobado o autorización específica; no marcar cero; escalar nuevos riesgos | Seguridad |
| Purga elimina evidencia necesaria o abre replay offline | Media | Alto | Ventana retención menor que vida de sesión/operación | T-062 decisión legal/negocio, dry-run, preservar hashes activos e idempotencia | Datos / backend |
| Política legal no refleja proveedores y contratos reales | Media | Alto | Documento asegura región/cifrado sin evidencia | Revisión del responsable, inventario de tratamientos y validación externa; no dictamen automático | Responsable de datos |
| Accesibilidad automática omite problemas de uso | Alta | Medio | Score alto pero teclado/lector falla | Recorridos manuales por usuarios/QA, contraste y zoom medidos; no certificar AA por Lighthouse | QA / frontend |
| Equipo supuesto no disponible o tiene soporte no previsto | Alta | Alto | Capacidad real <120 h/semana | Confirmar dedicaciones; recalcular por perfil, limitar trabajo en curso y reservar capacidad de incidentes | Gestión / líder |
| Nuevos hallazgos exceden la reserva y alargan calendario | Media | Alto | Tarea >24 h o pruebas descubren esquema distinto | Dividir nuevas tareas con IDs trazables, evaluar impacto, aprobar nuevo alcance sin cerrar falsamente | Líder / producto |

## Gestión semanal

Revisar tareas bloqueadas, consumo de reserva, capacidad real y diferencia entre esfuerzo consumido y avance verificable. Una tarea con 90% de código pero sin prueba no está terminada. Escalar en 24 h cualquier bloqueo de identidad/pagos/secretos y en 2 días hábiles permisos/proveedores que afecten ruta crítica. Actualizar plan y dejar decisión visible; no cambiar estimaciones históricas para ocultar sobrecoste.
