# Resumen ejecutivo del plan

**47 hallazgos, 77 tareas concretas, 856–1416 horas-persona.** Presupuesto con reserva del 20%: **1028–1700 horas**. Todas las tareas están Pendiente; no se modificó la aplicación ni la auditoría original.

Con el equipo supuesto (dos backend, un frontend, QA y DevOps a media dedicación), hay 120 horas efectivas semanales. La simple división da 7.13–11.8 semanas de esfuerzo; el orden técnico, las fases y las especialidades llevan el calendario modelado a **18.27–30 semanas**, o **22–36 semanas con reserva**. Deben validarse equipo, accesos, datos y proveedor de correo antes de comprometer fechas. No hay cotización monetaria ni fecha absoluta.

## Tareas por prioridad

| Prioridad | Tareas |
|---|---:|
| P0 | 12 |
| P1 | 16 |
| P2 | 47 |
| P3 | 2 |

## Fases y esfuerzo

| Fase | Tareas | Horas | Resultado para negocio |
|---|---:|---:|---|
| F0 Preparación | 4 | 36–64 | Contar con respaldo restaurable, claves nuevas y punto de partida medido |
| F1 Contención inmediata | 10 | 84–140 | Reducir fugas entre cuentas y corrupción de pagos; dejar visibles las funciones temporalmente restringidas |
| F2 Estabilización | 23 | 296–476 | Recuperar altas y pagos confiables con controles probados antes de operar normalmente |
| F3 Consolidación | 33 | 372–616 | Mejorar calidad de datos, accesibilidad, privacidad, capacidad y automatización |
| F4 Mejora continua | 7 | 68–120 | Cerrar deuda restante y practicar recuperación con responsables definidos |

## Cinco acciones que deben empezar primero

1. **T-001 — Fijar alcance, responsables y entorno de trabajo (8–12 h).** Define responsables y evita intervenir un entorno equivocado.

2. **T-003 — Rotar las credenciales históricas y revocar sesiones (8–16 h).** Retira el valor operativo de los secretos expuestos; tras T-001 puede avanzar en paralelo al respaldo.

3. **T-002 — Probar backup y restauración antes de cambiar datos (12–20 h).** Hace recuperables los cambios de datos y permite continuar con una línea base segura.

4. **T-005 — Aislar el portal mediante el ID autenticado (8–16 h).** Cierra el cruce de datos del portal tras validar la línea base.

5. **T-006 — Persistir únicamente la clave PDF de la factura (8–12 h).** Evita que un documento revierta un pago; puede desarrollarse en paralelo al aislamiento del portal.

Estas acciones no son una cola de una sola persona. T-007 (chat), T-008 (logout) y T-009 (referencia de pago) siguen en el mismo paquete urgente según dependencias y perfiles. La ruta crítica y el cuello de capacidad están en el documento 06.

## Hitos de aprobación

- H0: restauración, rotación y línea base verificadas. Una exposición activa exige respuesta inmediata.
- H1: aislamiento, logout, PDF y referencia protegidos; restricciones de alto riesgo comunicadas.
- H2: alta/recuperación y reglas financieras funcionan con PostgreSQL y navegador reales; secretos/cuentas históricas tienen disposición documentada.
- H3: los controles de los Medios están implementados y probados; WS-043 conserva su cierre global hasta T-076 y la continuidad se ejercita en T-077; pipeline, privacidad y accesibilidad verificados.
- H4: 47/47 hallazgos con evidencia de cierre, documentación entregada y primer ensayo de recuperación completado.

## Riesgo residual y decisiones

El objetivo es cero Críticas/Altas abiertas y cero cobros no conciliados, no garantizar cero incidentes. Persisten riesgo de nuevos CVE, indisponibilidad de proveedores, errores humanos y retención en sistemas externos. La validez de controles del proveedor y el dictamen legal requieren evidencia de sus responsables. La integración física de telemetría no se presume existente: se deshabilita su presentación como dato real.

El alcance de datos desconocidos, problemas encontrados en restore, cambios de API del comercio o mayor complejidad de UI pueden superar la reserva. Si ocurre, se divide trabajo y recalcula calendario sin declarar cerrados hallazgos incompletos. El plan no asume ninguna aceptación de riesgo en nombre del equipo.
