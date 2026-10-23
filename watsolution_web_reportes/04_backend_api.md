# Backend y API

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

El inventario incluye **80 rutas HTTP decoradas** con método, prefijo, guarda, rol y ubicación; se adjunta al final. La resolución es estática por AST, no un barrido contra servidor. Superficies adicionales: Swagger /api/v2/api-docs (y JSON/YAML generado por Nest), /swagger-ui estático, /management/info y Socket.IO namespace /tank con transporte /socket.io.

Contratos: DTO con decoradores Swagger/class-validator en CRUD; interfaces inline para refresh, IA y móvil no aportan validación automática de clase. MobileService valida explícitamente claves, UUID, fecha, escala, propietario/asignación e idempotencia; BillingService recalcula consumo y redondea con enteros. API sin prefijo de versión uniforme. Excepciones de Nest producen 400/401/403/404/409 en flujos protegidos, pero GET CRUD no encontrado suele retornar undefined en vez de 404, y PUT usa cabeceras created=201. El parámetro de ID no siempre es autoritativo (WS-021).

Pagos: webhook usa rawBody, HMAC del cuerpo base64 y timingSafeEqual; compara moneda/importe y bloquea factura. Solo evento aprobado cambia estado; el redirect del navegador no prueba pago. No se verificó un evento firmado real de Bold ni configuración del comercio. Existe idempotencia parcial al ignorar PAID; faltan referencias de intentos para conciliación.

Tareas: cron diario de avisos y purga horaria de auth_rate_limit; sin cola durable/outbox. Timeouts: axios global 30 s; instancias axios.create de refresh/logout no heredan ese interceptor. SDK S3/OpenAI sin presupuesto propio de operación/circuit breaker visible. GET hash y descarga generan efectos persistentes; revisar semántica e idempotencia.

### [WS-002] Generar el PDF puede deshacer un pago concurrente
- **Categoría:** Backend / pagos
- **Severidad:** Alta
- **Ubicación:** server/src/web/rest/invoice.controller.ts:101
- **Evidencia:**

```text
101:           amountDue: Number(invoice.amountDue ?? 0),
102:         });
103:         pdfKey = `facturacion/FAC-${invoice.id}.pdf`;
104:         await this.bucketService.uploadPdf(pdfKey, pdfBuffer);
105:         await this.invoiceService.update({ ...invoice, pdfUrl: pdfKey });
```

Intercalado reproducido contra los métodos reales con repositorio/S3 simulados: PAID → PENDING. También afecta generatePdf, líneas 186–190.

- **Impacto:** La descarga permitida al propietario carga una factura PENDING, espera PDF/S3 y guarda la copia completa. Si el webhook confirma PAID durante la espera, InvoiceService.update vuelve a guardar PENDING y puede borrar la referencia de pago de una instantánea antigua.
- **Recomendación:** Actualizar únicamente pdfUrl con UPDATE por ID, sin guardar el objeto leído; separar estado financiero de metadatos. Añadir prueba de concurrencia sobre PostgreSQL para PDF y webhook.
- **Esfuerzo estimado:** Bajo

### [WS-004] Las altas quedan sin un flujo funcional para obtener acceso
- **Categoría:** Backend / cuentas
- **Severidad:** Alta
- **Ubicación:** server/src/web/rest/person.controller.ts:96
- **Evidencia:**

```text
96:     // Account is inactive until a separate verified activation flow. Never use the phone as a password.
97:     let savedUser: any;
98:     try {
99:       savedUser = await this.authService.registerNewUser({
100:         login: dto.email,
101:         email: dto.email,
102:         password: randomBytes(48).toString('base64url'),
103:         firstName: dto.fullName,
104:         activated: false,
105:         authorities: ['ROLE_USER'],
```

- **Impacto:** El alta administrativa crea cuenta inactiva con contraseña aleatoria desconocida. Activación y recuperación lanzan 500 (account.controller.ts:53–54,123–137), y recuperación exige sesión. Activar desde administración no entrega una contraseña; la UI todavía dice que el teléfono será la contraseña (admin-usuarios.vue:516).
- **Recomendación:** Implementar invitación/activación verificadas con token de uso único, expiración, envío y establecimiento de contraseña; recuperación pública con respuesta neutra, límites y revocación. Alinear textos y retirar rutas de éxito ficticio.
- **Esfuerzo estimado:** Alto

### [WS-005] Dos aperturas simultáneas pueden perder la referencia de un pago
- **Categoría:** Backend / pagos
- **Severidad:** Alta
- **Ubicación:** server/src/service/bold.service.ts:36
- **Evidencia:**

```text
36:     if (invoice.status !== InvoiceStatus.PENDING) throw new BadRequestException('Invoice is not payable');
37:     const boldOrderId = invoice.boldOrderId ?? `INV-${invoiceId}-${crypto.randomUUID()}`;
38:     const amount = Number(invoice.amountDue);
39: 
40:     const hash = crypto.createHash('sha256').update(`${boldOrderId}${amount}COP${secretKey}`).digest('hex');
41: 
42:     await this.invoiceRepository.update(invoiceId, { boldOrderId });
```

Reproducido con dos llamadas simultáneas y repositorio simulado; evidencias/probes-resultados.json.

- **Impacto:** Dos solicitudes leen boldOrderId vacío y generan referencias distintas. La última actualización gana; un webhook de la primera referencia ya no encuentra factura y retorna sin conciliar (líneas 60–61), aun cuando el cliente haya pagado.
- **Recomendación:** Crear/reutilizar la referencia dentro de una transacción con bloqueo, o mediante asignación condicional atómica; persistir intentos de pago y tratar referencias desconocidas con conciliación y alerta.
- **Esfuerzo estimado:** Medio

### [WS-008] El CRUD de facturas y lecturas evita las reglas del flujo canónico
- **Categoría:** Backend / integridad
- **Severidad:** Alta
- **Ubicación:** server/src/service/invoice.service.ts:84
- **Evidencia:**

```text
84:   async update(invoiceDTO: InvoiceDTO, updater?: string): Promise<InvoiceDTO | undefined> {
85:     const prevEntity = invoiceDTO.id ? await this.invoiceRepository.findOne({ where: { id: invoiceDTO.id }, relations: { person: true } }) : null;
86:     const entity = InvoiceMapper.fromDTOtoEntity(invoiceDTO);
87:     if (updater) {
88:       entity.lastModifiedBy = updater;
89:     }
90:     const result = await this.invoiceRepository.save(entity);
```

- **Impacto:** Las rutas ADMIN de creación/edición guardan importes, estado, relaciones y referencias recibidos. No usan calculateBill ni impiden cambios a facturas pagadas. Las lecturas se editan sin comprobar su secuencia. Un error de administración o integración puede romper saldos y trazabilidad; no es una escalada de un usuario ordinario.
- **Recomendación:** Unificar escritura en servicios de dominio: generar desde lectura confirmada, bloquear importes y referencias tras iniciar pago, registrar pagos manuales con motivo y soporte, y realizar correcciones mediante eventos auditables.
- **Esfuerzo estimado:** Alto

### [WS-010] Los DTO del CRUD no validan tipos, rangos ni estados
- **Categoría:** Backend / validación
- **Severidad:** Media
- **Ubicación:** server/src/service/dto/invoice.dto.ts:24
- **Evidencia:**

```text
24:   @IsNotEmpty()
25:   @ApiProperty({ description: 'consumptionM3 field' })
26:   consumptionM3: number;
27: 
28:   @IsNotEmpty()
29:   @ApiProperty({ description: 'amountDue field' })
30:   amountDue: number;
```

Probe: amountDue=-100, consumptionM3=-5, fechas inválidas y status INVALID producen cero errores de class-validator.

- **Impacto:** IsNotEmpty acepta números negativos, cadenas no vacías y fechas inválidas. La tubería global carece de whitelist/forbidNonWhitelisted y los mappers copian todas las propiedades. Las rutas protegidas siguen expuestas a datos corruptos enviados por clientes autorizados.
- **Recomendación:** Usar DTO separados para alta y edición con IsNumber, Min, IsEnum, IsDateString, longitudes y validación anidada; activar whitelist y rechazo de extras tras adaptar contratos; mapear campos explícitos.
- **Esfuerzo estimado:** Medio

### [WS-017] El alta compuesta deja una cuenta huérfana si falla la persona
- **Categoría:** Backend / transacciones
- **Severidad:** Media
- **Ubicación:** server/src/web/rest/person.controller.ts:131
- **Evidencia:**

```text
131:     } catch (err) {
132:       // Clean up on failure
133:       await this.addressService.deleteById(savedAddress.id).catch(() => {});
134:       throw new HttpException(err.message ?? 'Could not create person', err.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
```

Reproducido con métodos reales y repositorios simulados; evidencias/probes-resultados.json.

- **Impacto:** Dirección, cuenta y persona se guardan por separado. Si falla el último paso, se elimina la dirección pero no la cuenta; reintentar con el mismo correo falla y obliga a intervención. La eliminación compensatoria también oculta errores.
- **Recomendación:** Usar una transacción común para las tres escrituras y restricciones de unicidad; devolver conflictos de negocio controlados. Probar documento duplicado y fallo tras crear cuenta.
- **Esfuerzo estimado:** Medio

### [WS-018] Los tableros suman lecturas acumuladas como consumo
- **Categoría:** Backend / métricas
- **Severidad:** Media
- **Ubicación:** server/src/service/admin-stats.service.ts:39
- **Evidencia:**

```text
39:     const consumptionResult = await this.meterRepository
40:       .createQueryBuilder('m')
41:       .select('SUM(m.water_measure)', 'total')
42:       .where('m.reading_date >= :from', { from: firstDayOfMonth })
43:       .getRawOne();
44: 
45:     return {
46:       activeUsers,
47:       monthlyRevenue: parseFloat(revenueResult?.total ?? '0'),
48:       totalConsumption: parseFloat(consumptionResult?.total ?? '0'),
```

- **Impacto:** Facturación calcula diferencia entre lecturas (billing.service.ts:32–38), pero el tablero suma water_measure. Lecturas 100 y 110 producen 210 en vez de consumo 10. PortalService también usa la última lectura y sumas mensuales. Recaudo se agrupa por fecha de emisión, no de pago, y puede atribuir cobros al mes equivocado.
- **Recomendación:** Definir métricas con negocio; agregar diferencias o consumos facturados, y guardar fecha/evento de pago para recaudo. Añadir ejemplos con lecturas acumulativas y facturas pagadas en otro mes.
- **Esfuerzo estimado:** Medio

### [WS-021] PUT con ID en la URL modifica el ID del cuerpo
- **Categoría:** Backend / contratos
- **Severidad:** Media
- **Ubicación:** server/src/web/rest/invoice.controller.ts:218
- **Evidencia:**

```text
218:   async putId(@Req() req: Request, @Body() invoiceDTO: InvoiceDTO): Promise<InvoiceDTO> {
219:     HeaderUtil.addEntityCreatedHeaders(req.res, 'Invoice', invoiceDTO.id);
220:     return await this.invoiceService.update(invoiceDTO, req.user?.login);
221:   }
```

- **Impacto:** El método no lee ni compara el parámetro de URL. Un cliente puede apuntar a /invoices/1 y modificar otra factura cuyo ID lleve el cuerpo, o insertar si falta. Patrón equivalente en personas, direcciones, medidores, noticias y reportes. Las rutas son ADMIN.
- **Recomendación:** Usar ParseIntPipe y hacer del ID de ruta la autoridad; rechazar discrepancias, comprobar existencia y devolver 404/409 adecuados. Separar create de update.
- **Esfuerzo estimado:** Bajo

### [WS-023] Los enlaces de paginación confunden registros con páginas
- **Categoría:** Backend / contratos
- **Severidad:** Baja
- **Ubicación:** server/src/client/header-util.ts:41
- **Evidencia:**

```text
41:     if (pageNumber < page.total - 1) {
42:       links.push(this.prepareLink(url, pageNumber + 1, pageSize, 'next'));
43:     }
44:     if (pageNumber > 0) {
45:       links.push(this.prepareLink(url, pageNumber - 1, pageSize, 'prev'));
46:     }
47:     links.push(this.prepareLink(url, page.total - 1, pageSize, 'last'));
48:     links.push(this.prepareLink(url, 0, pageSize, 'first'));
```

Reproducido: evidencias/probes-resultados.json.

- **Impacto:** Con 21 registros y size=20, last apunta a page=20 en lugar de page=1. next puede aparecer después de la última página válida.
- **Recomendación:** Calcular totalPages=Math.ceil(total/size), usar max(0,totalPages-1) y emitir next solo si queda otra página.
- **Esfuerzo estimado:** Bajo


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.

## Inventario estático de rutas HTTP

Roles exactos; ROLE_ADMIN no implica ROLE_USER. Webhook valida firma; refresh valida cookie/token. Las rutas de Swagger y Socket.IO se describen en el reporte backend.

| Método | Ruta | Guardas | Roles | Ubicación |
|---|---|---|---|---|
| POST | /api/register | Sin guarda JWT | sin rol específico | server/src/web/rest/account.controller.ts:33 |
| GET | /api/activate | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/account.controller.ts:44 |
| GET | /api/authenticate | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:57 |
| GET | /api/account | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:70 |
| POST | /api/account | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:84 |
| POST | /api/account/change-password | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:99 |
| POST | /api/account/reset-password/init | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:114 |
| POST | /api/account/reset-password/finish | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:127 |
| GET | /api/addresses | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:34 |
| GET | /api/addresses/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:52 |
| POST | /api/addresses | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:63 |
| PUT | /api/addresses | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:78 |
| PUT | /api/addresses/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:91 |
| DELETE | /api/addresses/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:104 |
| GET | /api/admin/stats | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:57 |
| GET | /api/admin/dashboard | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:65 |
| GET | /api/admin/activity | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:73 |
| GET | /api/admin/users-with-status | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:81 |
| GET | /api/admin/people/:personId/qr | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:89 |
| POST | /api/admin/billing/generate | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:125 |
| POST | /api/ai/chat | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/ai.controller.ts:13 |
| POST | /api/ai/admin/chat | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/ai.controller.ts:25 |
| POST | /api/ai/admin/seed-faqs | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/ai.controller.ts:36 |
| GET | /api/bold/hash | UseGuards(AuthGuard, RolesGuard, RecordAccessGuard) | Roles(RoleType.USER) | server/src/web/rest/bold.controller.ts:17 |
| POST | /api/bold/webhook | Sin guarda JWT | sin rol específico | server/src/web/rest/bold.controller.ts:27 |
| GET | /api/bold/result/:invoiceId | UseGuards(AuthGuard, RolesGuard, RecordAccessGuard) | Roles(RoleType.USER) | server/src/web/rest/bold.controller.ts:40 |
| GET | /api/invoices | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:44 |
| GET | /api/invoices/by-person/:personId | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:62 |
| GET | /api/invoices/download/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:76 |
| GET | /api/invoices/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:116 |
| POST | /api/invoices | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:128 |
| POST | /api/invoices/:id/generate-pdf | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:154 |
| PUT | /api/invoices | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:197 |
| PUT | /api/invoices/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:210 |
| DELETE | /api/invoices/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:223 |
| GET | /management/info | Sin guarda JWT | sin rol específico | server/src/web/rest/management.controller.ts:11 |
| GET | /api/meters | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:35 |
| GET | /api/meters/by-person/:personId | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:53 |
| GET | /api/meters/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:67 |
| POST | /api/meters | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:79 |
| PUT | /api/meters | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:94 |
| PUT | /api/meters/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:107 |
| DELETE | /api/meters/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:120 |
| POST | /api/mobile/permit | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/mobile.controller.ts:15 |
| GET | /api/mobile/bootstrap | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/mobile.controller.ts:18 |
| POST | /api/mobile/sync/push | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/mobile.controller.ts:21 |
| POST | /api/mobile/assign | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/mobile.controller.ts:24 |
| GET | /api/noticias | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/noticia.controller.ts:34 |
| GET | /api/noticias/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/noticia.controller.ts:48 |
| POST | /api/noticias | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:55 |
| PUT | /api/noticias | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:65 |
| PUT | /api/noticias/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:74 |
| DELETE | /api/noticias/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:83 |
| GET | /api/notifications | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/notification.controller.ts:17 |
| PATCH | /api/notifications/read-all | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/notification.controller.ts:26 |
| GET | /api/notifications/unread-count | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/notification.controller.ts:35 |
| GET | /api/people/me | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/person.controller.ts:47 |
| GET | /api/people | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:57 |
| GET | /api/people/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/person.controller.ts:71 |
| POST | /api/people | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:79 |
| PUT | /api/people | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:141 |
| PUT | /api/people/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:159 |
| DELETE | /api/people/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:176 |
| GET | /api/portal/dashboard | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/portal.controller.ts:19 |
| GET | /api/public/noticias | Sin guarda JWT | sin rol específico | server/src/web/rest/public-noticias.controller.ts:15 |
| GET | /api/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/public.user.controller.ts:19 |
| GET | /api/authorities | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/public.user.controller.ts:39 |
| GET | /api/reportes | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:34 |
| GET | /api/reportes/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:48 |
| POST | /api/reportes | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:55 |
| PUT | /api/reportes/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:65 |
| DELETE | /api/reportes/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:74 |
| POST | /api/session/refresh | Sin guarda JWT | sin rol específico | server/src/web/rest/session.controller.ts:12 |
| POST | /api/session/logout | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/session.controller.ts:22 |
| GET | /api/admin/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:43 |
| POST | /api/admin/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:62 |
| PUT | /api/admin/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:78 |
| GET | /api/admin/users/:login | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:105 |
| DELETE | /api/admin/users/:login | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:117 |
| POST | /api/authenticate | Sin guarda JWT | sin rol específico | server/src/web/rest/user.jwt.controller.ts:17 |