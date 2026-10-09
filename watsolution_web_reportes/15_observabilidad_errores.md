# Observabilidad y errores

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

LoggingInterceptor evita imprimir body/Authorization y usa nombre de controlador/método/ruta. Es una mejora frente a registrar credenciales. PortalService todavía registra login/personId y estado de deuda; revisar minimización, acceso y retención. No hay correlación de solicitudes, métricas de latencia ni alertas declaradas en código.

ActivityLog permite actor por BaseEntity, pero varias escrituras de eventos no lo rellenan. Algunos errores de logging se silencian con catch(() => {}), y la vista de actividad activa es fija (WS-025). Un pago confirmado hace commit financiero antes del aviso; si el aviso falla, el log dice pendiente pero no existe reintento durable.

Errores de infraestructura en PDF se convierten en 404, confundiendo inexistencia con indisponibilidad; otros flujos devuelven err.message de BD en PersonController. Se debe mapear a errores públicos estables y retener diagnóstico seguro con ID correlacionable. Monitoreo externo real, retención/SIEM y alertas: **No verificado**.

### [WS-019] El flujo principal de facturación omite aviso y registro de actividad
- **Categoría:** Observabilidad / notificaciones
- **Severidad:** Media
- **Ubicación:** server/src/service/billing.service.ts:38
- **Evidencia:**

```text
38:       const amount = calculateBill(consumption, dto.rate, dto.fixedCharge, dto.subsidy ?? 0, dto.surcharges ?? 0);
39:       const now = new Date();
40:       return invoices.save({ person: { id: dto.personId }, meter: { id: meter.id }, issueDate: now, dueDate: new Date(now.getTime() + 30 * 86400000), consumptionM3: consumption, amountDue: amount, ratePerM3: dto.rate, fixedCharge: dto.fixedCharge, subsidyPercent: dto.subsidy ?? 0, additionalCharges: dto.surcharges ?? 0, status: InvoiceStatus.PENDING, createdBy: actor, lastModifiedBy: actor, createdAt: now });
```

- **Impacto:** El servicio canónico guarda directamente la factura y no emite notificación de creación ni actividad. Esos efectos están en InvoiceService.save, que este flujo no llama. La UI administrativa usa el flujo canónico, por lo que el comportamiento cambia según endpoint.
- **Recomendación:** Crear evento de factura emitida dentro de la transacción y entregarlo mediante outbox; reutilizar el mismo flujo para toda emisión, con prueba de creación y entrega.
- **Esfuerzo estimado:** Medio

### [WS-020] El cron puede duplicar avisos entre réplicas y perderlos en una caída
- **Categoría:** Observabilidad / tareas
- **Severidad:** Media
- **Ubicación:** server/src/service/notification.service.ts:69
- **Evidencia:**

```text
69:   @Cron('0 8 * * *')
70:   async checkInvoiceDates(): Promise<void> {
71:     this.logger.log('Running invoice due-date notification cron');
72: 
73:     const today = new Date();
74:     today.setHours(0, 0, 0, 0);
75: 
76:     const in3Days = new Date(today);
77:     in3Days.setDate(today.getDate() + 3);
78:     const in3DaysEnd = new Date(in3Days);
```

- **Impacto:** Cada proceso ejecuta el cron sin clave idempotente ni coordinación. Una réplica adicional duplica avisos; un día sin ejecución omite vencimientos porque solo busca ventanas exactas. La zona horaria depende del host.
- **Recomendación:** Persistir eventos únicos por factura/tipo/fecha, coordinar trabajadores, recuperar ventanas no procesadas y fijar America/Bogota donde corresponda.
- **Esfuerzo estimado:** Medio

### [WS-042] La configuración Prometheus apunta a una ruta no implementada
- **Categoría:** Observabilidad
- **Severidad:** Media
- **Ubicación:** docker/prometheus/prometheus.yml:27
- **Evidencia:**

```text
27:     metrics_path: /management/prometheus
28:     static_configs:
29:       - targets:
30:           # On MacOS, replace localhost by host.docker.internal
31:           - localhost:8080
```

- **Impacto:** El inventario de rutas solo contiene management/info; no management/prometheus ni health de dependencias. info devuelve dev fijo (management.controller.ts:20). El healthcheck Docker es TCP, no verifica BD. No hay evidencia local de métricas/alertas efectivas.
- **Recomendación:** Implementar readiness/liveness separados, métricas autenticadas o internas y scraping real; correlacionar solicitudes y registrar duración/resultado. Definir alertas para pagos sin conciliar, DB y cron.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
