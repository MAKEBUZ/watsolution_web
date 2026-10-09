# Roadmap por fases

El plan original solicita F0 antes de código, F1 0–7 días, F2 1–4 semanas, F3 1–3 meses y F4 3+ meses. Son objetivos iniciales. **La capacidad asumida no sostiene todas esas ventanas.** El calendario siguiente expone el ajuste en vez de ocultar sobreasignación. Semanas hábiles de cinco días; sin festivos ni espera externa. D0 se fija después de F0.

| Fase | Duración modelada min–max, semanas | Fin acumulado min–max desde inicio de preparación | Horas |
|---|---:|---:|---:|
| F0 Preparación | 2.4–4.27 | 2.40–4.27 | 36–64 |
| F1 Contención inmediata | 2–3.2 | 4.40–7.47 | 84–140 |
| F2 Estabilización | 4.67–7.33 | 9.07–14.80 | 296–476 |
| F3 Consolidación | 6.8–11.07 | 15.87–25.87 | 372–616 |
| F4 Mejora continua | 2.4–4.13 | 18.27–30.00 | 68–120 |

Reserva de 20% y disponibilidad externa se añaden al compromiso, no a los criterios técnicos. F1 tiene una meta de 7 días calendario: si el cronograma excede esa meta, destinar temporalmente más backend/DevOps o mantener bloqueadas funciones expuestas; no posponer sin contención. Los sprints sugeridos son de dos semanas, seleccionando tareas listas del mismo paquete y respetando el límite de capacidad. No se compromete un sprint por cada fase ni un tamaño de equipo no confirmado.

## Fase 0 — Preparación

**Objetivo:** Asegurar punto de recuperación, credenciales y entorno.

**Esfuerzo:** 36–64 h, 4 tareas.

| Tarea | Entregable concreto | Perfil | Horas |
|---|---|---|---:|
| T-001 | Fijar alcance, responsables y entorno de trabajo | QA | 8–12 |
| T-002 | Probar backup y restauración antes de cambiar datos | OPS | 12–20 |
| T-003 | Rotar las credenciales históricas y revocar sesiones | OPS | 8–16 |
| T-004 | Capturar la línea base reproducible y presupuestos | QA | 8–16 |

**Entregables del hito:** Inventario, matriz de accesos, acta de restore, rotación y línea base.

**Criterio de salida:** T-001–004 completos; ningún secreto expuesto vigente sin contención.

**Go/no-go:** No-go si no se puede restaurar, falta destino seguro o no hay dueño de los secretos.

**Punto de control:** revisión semanal del líder, QA y dueño del dato; evidencias antes de merge/promoción y 24–48 h de observación después del release (tiempo de observación adicional a esfuerzo).

## Fase 1 — Contención inmediata

**Objetivo:** Contener exposición de clientes y errores financieros.

**Esfuerzo:** 84–140 h, 10 tareas.

| Tarea | Entregable concreto | Perfil | Horas |
|---|---|---|---:|
| T-005 | Aislar el portal mediante el ID autenticado | BE | 8–16 |
| T-006 | Persistir únicamente la clave PDF de la factura | BE | 8–12 |
| T-007 | Limpiar el chat cuando cambia la sesión | FE | 4–8 |
| T-008 | Revocar refresh y cerrar cookie con acceso vencido | BE | 12–20 |
| T-009 | Asignar referencia Bold de forma atómica | BE | 12–20 |
| T-010 | Retirar cuentas de ejemplo y asegurar primer administrador | BE | 8–12 |
| T-011 | Contener mutaciones financieras fuera del dominio | BE | 8–12 |
| T-012 | Escapar nombres de usuario en las vistas | FE | 4–8 |
| T-013 | Identificar demos y retirar telemetría ficticia de producción | FE | 4–8 |
| T-014 | Preparar integración aislada con PostgreSQL | QA | 16–24 |

**Entregables del hito:** Parches pequeños, flags de contención propuestos y evidencia de casos reproducibles.

**Criterio de salida:** T-005–014 con pruebas específicas; ninguna regresión en permisos/pagos.

**Go/no-go:** No-go ante fuga entre cuentas, PAID→PENDING, refresh válido tras logout o checkout ambiguo.

**Punto de control:** revisión semanal del líder, QA y dueño del dato; evidencias antes de merge/promoción y 24–48 h de observación después del release (tiempo de observación adicional a esfuerzo).

## Fase 2 — Estabilización

**Objetivo:** Hacer fiables altas, pagos y cambios de esquema.

**Esfuerzo:** 296–476 h, 23 tareas.

| Tarea | Entregable concreto | Perfil | Horas |
|---|---|---|---:|
| T-015 | Definir baseline de esquema y runner explícito | BE | 16–24 |
| T-016 | Conciliar vínculos de usuarios y suscriptores | BE | 16–24 |
| T-017 | Añadir relaciones y FK de identidad | BE | 12–20 |
| T-018 | Proteger unicidad financiera e índices medidos | BE | 12–20 |
| T-019 | Centralizar emisión y actualización de facturas | BE | 16–24 |
| T-020 | Proteger la secuencia de lecturas y sus correcciones | BE | 12–20 |
| T-021 | Registrar pagos manuales y ajustes auditables | BE | 16–24 |
| T-022 | Crear tokens de invitación y activación de un solo uso | BE | 16–24 |
| T-023 | Entregar invitaciones verificables por correo | BE | 16–24 |
| T-024 | Habilitar recuperación pública segura de contraseña | BE | 16–24 |
| T-025 | Completar UI de activación y recuperación | FE | 12–20 |
| T-026 | Hacer transaccional el alta de persona, cuenta y dirección | BE | 12–20 |
| T-027 | Persistir intentos y eventos de pago conciliables | BE | 16–24 |
| T-028 | Conciliar webhooks desconocidos y cobros históricos | BE | 16–24 |
| T-029 | Limitar abuso de login y registro sin bloquear el hilo | BE | 12–20 |
| T-030 | Alinear permisos por operación entre UI y API | BE | 8–16 |
| T-031 | Reproducir contenedores desde el lock y runtime único | OPS | 16–24 |
| T-032 | Declarar variables y persistencia por entorno | OPS | 8–16 |
| T-033 | Unificar cabeceras HTTP con política compatible con Bold | OPS | 8–16 |
| T-034 | Reenviar Socket.IO y verificar reconexión | OPS | 4–8 |
| T-035 | Añadir health de aplicación y dependencias | OPS | 12–20 |
| T-036 | Cerrar regresión HTTP y navegador de los riesgos altos | QA | 16–24 |
| T-037 | Sanear historial tras revocar secretos y añadir prevención | OPS | 8–16 |

**Entregables del hito:** Baseline, relaciones, comandos financieros, invitación/reset, contenedores y E2E.

**Criterio de salida:** Todos los Altos corregidos y verificados; T-036 verde, T-037 saneado y evidencia del proveedor completa.

**Go/no-go:** No-go con restore fallido, datos ambiguos sin contención, diferencias de dinero o correos sin entrega.

**Punto de control:** revisión semanal del líder, QA y dueño del dato; evidencias antes de merge/promoción y 24–48 h de observación después del release (tiempo de observación adicional a esfuerzo).

## Fase 3 — Consolidación

**Objetivo:** Completar controles y calidad operativa.

**Esfuerzo:** 372–616 h, 33 tareas.

| Tarea | Entregable concreto | Perfil | Horas |
|---|---|---|---:|
| T-038 | Validar contratos financieros e ID de ruta | BE | 12–20 |
| T-039 | Validar DTO e IDs del resto del CRUD | BE | 16–24 |
| T-040 | Acotar listados y corregir enlaces de paginación | BE | 8–16 |
| T-041 | Eliminar N+1 y añadir búsqueda paginada | BE | 12–20 |
| T-042 | Paginar búsquedas y listas administrativas completas | FE | 12–20 |
| T-043 | Acordar definiciones de consumo, recaudo y vencimiento | BE | 8–12 |
| T-044 | Tratar fechas de calendario y mora de forma uniforme | FE | 8–16 |
| T-045 | Corregir agregación de consumo en los tableros | BE | 12–20 |
| T-046 | Atribuir recaudo a eventos de pago verificables | BE | 12–20 |
| T-047 | Añadir outbox transaccional de eventos de facturación | BE | 16–24 |
| T-048 | Entregar avisos y actividad de forma idempotente | BE | 12–20 |
| T-049 | Recuperar cron omitido sin duplicar avisos | BE | 12–20 |
| T-050 | Conectar actividad real y calidad de datos del tablero | FE | 8–16 |
| T-051 | Asociar etiquetas y mensajes de formularios | FE | 8–12 |
| T-052 | Garantizar foco y teclado en modales | FE | 12–20 |
| T-053 | Dar equivalentes textuales a los gráficos | FE | 8–12 |
| T-054 | Liberar listeners y gráficos al desmontar | FE | 4–8 |
| T-055 | Reducir carga inicial y configurar caché de assets | FE | 12–20 |
| T-056 | Obtener escaneo vigente y mapa de actualización | OPS | 8–16 |
| T-057 | Preparar sustitución de BootstrapVue y compat | FE | 16–24 |
| T-058 | Migrar navegación y componentes compartidos | FE | 16–24 |
| T-059 | Migrar componentes administrativos y de entidades | FE | 16–24 |
| T-060 | Migrar login y estilos públicos dependientes | FE | 16–24 |
| T-061 | Retirar compat y dependencias obsoletas del runtime | FE | 12–20 |
| T-062 | Validar inventario de datos, finalidades y proveedores | BE | 8–16 |
| T-063 | Publicar política coherente con la operación comprobada | FE | 8–12 |
| T-064 | Guardar evidencia de autorización cuando corresponda | BE | 12–20 |
| T-065 | Completar consentimiento y atención de derechos en UI | FE | 12–20 |
| T-066 | Aplicar purga por retención sin romper sesiones ni idempotencia | BE | 12–20 |
| T-067 | Normalizar formato en cambio separado | BE | 8–16 |
| T-068 | Resolver reglas semánticas y añadir tipos Vue a CI | FE | 12–20 |
| T-069 | Conectar métricas, alertas y correlación operativa | OPS | 12–20 |
| T-070 | Hacer obligatoria la regresión completa y cerrar F3 | QA | 12–20 |

**Entregables del hito:** Validación, paginación, métricas, outbox, UI accesible, runtime mantenido y privacidad coherente.

**Criterio de salida:** T-070 aprueba todas las rutas críticas; CVE vigente y métricas cumplen objetivos acordados.

**Go/no-go:** No-go si un escaneo pendiente se cuenta como limpio, hay retroceso de acceso o evidencia de privacidad incompleta.

**Punto de control:** revisión semanal del líder, QA y dueño del dato; evidencias antes de merge/promoción y 24–48 h de observación después del release (tiempo de observación adicional a esfuerzo).

## Fase 4 — Mejora continua

**Objetivo:** Cerrar deuda y dejar operación sostenible.

**Esfuerzo:** 68–120 h, 7 tareas.

| Tarea | Entregable concreto | Perfil | Horas |
|---|---|---|---:|
| T-071 | Incluir recursos públicos en el artefacto | FE | 4–8 |
| T-072 | Completar metadatos públicos y comportamiento 404 | FE | 12–20 |
| T-073 | Resolver licencia del producto y atribuciones | OPS | 8–16 |
| T-074 | Documentar operación, API y onboarding comprobados | BE | 12–20 |
| T-075 | Retirar implementaciones no montadas y duplicación acotada | FE | 8–16 |
| T-076 | Reauditar el cierre completo de hallazgos | QA | 12–20 |
| T-077 | Ensayar recuperación y respuesta a incidentes trimestral | OPS | 12–20 |

**Entregables del hito:** SEO, licencias, documentación, limpieza y actas de reauditoría/simulacro.

**Criterio de salida:** T-076 y T-077 completos; 47/47 con evidencia y responsables.

**Go/no-go:** No-go si documentación no reproduce arranque, falta titular de licencia o simulacro no recupera datos.

**Punto de control:** revisión semanal del líder, QA y dueño del dato; evidencias antes de merge/promoción y 24–48 h de observación después del release (tiempo de observación adicional a esfuerzo).

## Cómo acelerar sin eliminar controles

Aumentar DevOps/QA durante preparación e infraestructura, aportar un segundo frontend a migración/accesibilidad y resolver negocio/datos temprano. Recalcular con las disponibilidades reales; dividir horas por más personas no acorta tareas seriales como token→correo→UI o saneamiento→FK. Cambios independientes de F3 pueden prepararse en paralelo a F2 si no comparten archivos ni datos, pero no saltan los criterios de liberación. El calendario conservador incluido mantiene fases secuenciales para no prometer esa disponibilidad.
