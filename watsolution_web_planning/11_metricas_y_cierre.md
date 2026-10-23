# Métricas y cierre

Las metas son propuestas de aceptación y se confirman en F0 con negocio/operaciones. La auditoría no midió todos los valores; **No medido** nunca se convierte en cero ni en aprobado. El horizonte relativo se expresa por hito porque el calendario depende del equipo confirmado.

| KPI | Línea base conocida | Meta propuesta | Fecha relativa / evidencia |
|---|---|---|---|
| Hallazgos Críticos / Altos abiertos | 0 / 10, con exposición real parcialmente desconocida | 0 / 0 verificados; nuevos críticos activan respuesta inmediata | H2; matriz y pruebas por ID |
| Hallazgos Medios / Bajos abiertos | 30 / 7 | Medios operativos corregidos en H3; WS-043 cierra con la reauditoría T-076; todos 0 en H4 salvo excepción futura firmada | H3/H4; 47 IDs revalidados |
| Cobertura del plan | 47/47 asignados | 100% sin huérfanos en cada revisión | Desde entrega del plan; no equivale a cierre |
| Unitarias y regresión | 42 backend +182 frontend aprobadas en auditoría | 100% de suite vigente verde, sin eliminar casos para alcanzar la meta | Cada PR y H1–H4 |
| Cobertura de ramas | No medida; umbrales de config no son resultados | ≥85% en identidad/sesiones/facturación/pagos; global ≥75% o baseline mayor sin retroceso; revisar factibilidad en F0 | Medir H0, objetivo H3; reporte de cobertura |
| Integración de escenarios críticos | Sin evidencia PostgreSQL/HTTP/navegador real | 100% de casos negativos/positivos definidos en Q-API/Q-UI, sin guardas sustituidas | H2 y cada release |
| Estabilidad de pruebas concurrentes | Probes aislados; sin tasa medida | Cero fallos en 20 repeticiones de carreras con barreras; investigar cualquier intermitencia | H2; artifacts del CI |
| Integridad de pagos | Dos condiciones concurrentes reproducidas con dobles | Cero PAID→PENDING por PDF y cero cobros no conciliados por referencia perdida | H1 contención/H2 cierre y observación 48 h |
| Cuentas y sesiones | Alta/reset incompletos; logout expirado inseguro | Alta→invitación→login→logout→reset exitosos; renovación revocada siempre rechazada | H2; navegador HTTPS |
| Secretos/cuentas de ejemplo | Literales en Git; vigencia real desconocida | 100% de entornos con disposición documentada; claves revocadas y ejemplos fuera de operación | Rotación H0, semilla H1, historial H2 |
| CVE de dependencias | No verificado por bloqueo de consulta | Cero Críticas/Altas alcanzables sin resolver; escaneo válido ≤7 días antes de release | T-056/H3; informe con versión del lock |
| Lint | 27.591 errores y 71 advertencias | 0 errores; advertencias cero o justificación acotada con dueño; CI obligatorio | H3; salida por workspace |
| Bundle inicial JS gzip | 301.616 bytes en build auditado | ≤241.292 bytes (reducción ≥20%) bajo build/config comparable; registrar cambio de baseline si se justifica | T-055/H3 |
| Lighthouse móvil | No medido | Performance ≥85, accesibilidad ≥95, SEO ≥90 en páginas públicas; mediana de 3 corridas idénticas | Medir H0, H3/H4 según área |
| Uso con teclado/lector | Solo revisión estática | 100% de recorridos críticos completables; errores de foco/etiquetas/gráficos corregidos | H3; acta manual, no certificado AA |
| Core Web Vitals de campo | No medido | Propuesta LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 en p75; habilitar medición respetando privacidad | Tras 28 días de tráfico representativo; no cerrar por laboratorio |
| API p95 / error rate | No medido | Propuesta p95 ≤500 ms en listados y <1% error en 20 usuarios/5 min; excluir proveedor externo, medirlo aparte | T-004 baseline, T-041/H3 comparación |
| Consultas por página | N+1 identificado, conteo no medido | Propuesta ≤5 consultas por página y sin crecimiento lineal 20→100 filas | T-041; SQL medido |
| Avisos / cron | Flujo canónico sin evento y cron sin idempotencia | Una entrega lógica por evento; recuperación tras caída 48 h y cero eventos perdidos | H3; dos réplicas en prueba |
| Backup / recuperación | No verificado | RPO propuesto ≤15 min, RTO ≤60 min y conciliación íntegra de pagos; aprobar según proveedor | H0 y simulacro H4 |
| Privacidad / retención | Política incoherente y aceptación solo local | 100% de afirmaciones contrastadas; prueba consultable por finalidad aplicable; purga conforme a política aprobada | H3; revisión de responsable |
| Alertas operativas | Config apunta a endpoint ausente | Alerta de pago/DB/cron recibida y atendible; propuesta detección ≤5 min y acuse ≤15 min | H3/H4; simulacro |

## Definición de Terminado por tarea

- Cambio acotado revisado, ligado a su ID de tarea y hallazgos; sin secretos ni datos reales en evidencias.
- Todos los criterios de aceptación del CSV cumplidos con prueba negativa y positiva cuando corresponde.
- Pruebas locales/CI y escenario real apropiado aprobados; PostgreSQL para locks/FK, navegador para cookies/foco, proveedor para rotación.
- Migración compatible y rollback/contención ensayados; manual actualizado si cambia operación.
- Release observada con métricas, sin diferencias financieras ni regresión de permisos; dueño técnico y de negocio aceptan evidencia.
- Si una condición no se verificó, tarea sigue Pendiente/En ejecución/Bloqueada durante implementación; nunca Cerrada por falta de acceso. El CSV entregado mantiene el estado solicitado Pendiente para todas.

## Definición de cierre de hallazgo

Cumplir todas sus correcciones y comprobaciones específicas, no solo una tarea compartida. Registrar ID, causa, cambios, commit/release, entorno, datos de prueba, evidencia, revisor y fecha. T-036/T-070/T-076 verifican cierre acumulado. Las mejoras recurrentes pueden continuar después sin reabrir automáticamente un defecto ya corregido; fallo del simulacro sí abre acción y reevalúa el riesgo.

## Reauditoría por fase

| Momento | Responsable sugerido | Alcance | Resultado esperado |
|---|---|---|---|
| H0 | QA + DevOps + líder | Restore, secretos, destinos y baseline | Actas y condiciones de arranque; no asumir que backup equivale a restore |
| H1 | QA + revisor backend distinto del autor | Repetir casos WS-001/002/005/006/007/008/009/011/025 | Contención real en HTTP/UI, restricciones comunicadas |
| H2 | QA + datos/facturación + seguridad | Diez Altos, migraciones, alta, roles y pagos de extremo a extremo | Cero Altos abiertos; T-036 y actas de proveedor |
| H3 | QA + frontend + datos | Medios, CI, métricas, privacidad, accesibilidad y dependencias | T-070 y metas acordadas; escaneo válido |
| H4 | Revisor independiente del implementador cuando sea posible | Matriz completa, SEO/licencias/docs/código muerto y primer simulacro | T-076/T-077, riesgos residuales y responsables |
| Cada trimestre posterior | Operaciones y responsable de seguridad/datos | Dependencias, restore, permisos y cambios de proveedores | Nuevo ciclo con presupuesto propio; no automatizado por este encargo |

## Comprobación de integridad del encargo de planificación

La entrega debe contener los 12 archivos obligatorios y una ficha por cada tarea Alta/Crítica, con trazabilidad a los 47 IDs del CSV. Validación automática de columnas, IDs únicos, aceptación, verificación, dependencias acíclicas, suma de horas, fichas y hashes de los archivos originales en [verificacion-final.json](verificacion-final.json). El estado de la aplicación y los reportes debe permanecer idéntico al inicio; las exclusiones de hashes se declaran allí.
