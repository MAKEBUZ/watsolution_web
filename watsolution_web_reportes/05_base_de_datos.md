# Base de datos

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Se identifican 12 entidades ORM: jhi_user, jhi_authority, address, person, meter, invoice, noticia, reporte, activity_log, notifications, auth_session y mobile_operation, con BaseEntity abstracta como clase común y una tabla unión de authorities adicional. También existen tablas por SQL directo auth_rate_limit y document_embeddings con pgvector. El esquema se resume al final mediante metadatos de las entidades.

PostgreSQL en prod/dev, SQLite :memory: en test. Producción usa DATABASE_URL y no impone TLS en código; puede configurarse en URL/infraestructura, **No verificado**. Desarrollo declara rejectUnauthorized=true. synchronize y migrationsRun son true solo en test; existe un ejecutor aditivo SecureMobile con confirmación de backup mediante variable y --apply. Ninguno fue ejecutado.

Importes y lecturas usan decimal de dos posiciones; subsidio cuatro. Servicio canónico usa enteros/BigInt para cálculo, y lectura móvil bloquea Person para serializar capturas. Semántica de consumo correcta en ese flujo, incoherente en agregados WS-018. address.latitude/longitude usan escala 2, insuficiente si se pretende precisión de ubicación de campo; requisito GPS no confirmado.

Sin inspección de esquema vivo, permisos de cuenta DB, EXPLAIN, tamaños, frecuencia de backups, cifrado de discos, restauración o RPO/RTO: **No verificado**. No confundir columnas personales sin transformer con prueba de ausencia de cifrado del proveedor.

### [WS-014] Migraciones históricas sincronizan el esquema y no permiten reversión
- **Categoría:** Base de datos
- **Severidad:** Alta
- **Ubicación:** server/src/migrations/1570200270081-CreateTables.ts:4
- **Evidencia:**

```text
4:   public async up(queryRunner: QueryRunner): Promise<any> {
5:     if (process.env.BACKEND_ENV === 'prod' || process.env.BACKEND_ENV === 'dev') {
6:       if (queryRunner.isTransactionActive) {
7:         await queryRunner.commitTransaction();
8:       }
9:     }
10: 
11:     await queryRunner.connection.synchronize();
```

- **Impacto:** La migración ejecuta synchronize y puede confirmar una transacción abierta; otra repite el patrón. Ejecutarlas manualmente sobre una BD existente puede modificar el esquema sin un cambio explícito revisable. La migración SecureMobile separada es más prudente y no se ejecutó ninguna migración en esta auditoría.
- **Recomendación:** Sustituir synchronize histórico por una línea base controlada y migraciones SQL explícitas; comprobar restauración y ejecutar en staging antes de producción. Documentar cuál runner es válido para cada versión.
- **Esfuerzo estimado:** Alto

### [WS-015] Los vínculos de identidad son columnas sin integridad referencial
- **Categoría:** Base de datos
- **Severidad:** Media
- **Ubicación:** server/src/domain/person.entity.ts:40
- **Evidencia:**

```text
40:   @Column({ name: 'assigned_operator_id', type: 'integer', nullable: true })
41:   assignedOperatorId?: number;
42: 
43:   @Column({ name: 'user_id', nullable: true })
44:   userId?: string;
```

Esquema de producción No verificado; conclusión limitada a entidades y migraciones del repositorio.

- **Impacto:** user_id es texto libre y assigned_operator_id un entero sin relación/FK declarada. Sesiones y operaciones también guardan IDs sin FK en su migración. Borrar una cuenta puede dejar suscriptores, sesiones o asignaciones huérfanos; el código alterna interpretaciones de identidad.
- **Recomendación:** Normalizar la relación Person–User, resolver duplicados y añadir FK e índices mediante migración explícita. Definir reglas de borrado/retención de datos financieros y de sesiones.
- **Esfuerzo estimado:** Alto

### [WS-016] Faltan restricciones e índices para facturación y acceso habitual
- **Categoría:** Base de datos
- **Severidad:** Media
- **Ubicación:** server/src/domain/invoice.entity.ts:50
- **Evidencia:**

```text
50:   @Column({ type: 'varchar', name: 'bold_order_id', nullable: true })
51:   boldOrderId?: string;
52: 
53:   @Column({ type: 'varchar', name: 'bold_transaction_id', nullable: true })
54:   boldTransactionId?: string;
55: 
56:   @ManyToOne(type => Meter)
57:   meter?: Meter;
58: 
59:   @ManyToOne(type => Person)
```

No se afirmó que la BD desplegada carezca de índices añadidos fuera del repositorio.

- **Impacto:** No se declara unicidad de meter por factura ni de referencias de pago; tampoco índices compuestos para historial por persona/fecha. El bloqueo de BillingService evita duplicados solo dentro de ese flujo. La migración de sesiones omite el índice userId declarado en la entidad, con synchronize deshabilitado en producción.
- **Recomendación:** Definir unicidad según reglas de negocio y crear índices para invoice(personId,issue_date), meter(personId,reading_date,id) y auth_session(userId); medir EXPLAIN en datos representativos antes de ajustar.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.

## Entidades y relaciones declaradas

### server/src/domain/activity-log.entity.ts

- Línea 9: @Entity('activity_log')
- Línea 14: @Column({ type: 'varchar', name: 'action', enum: ActivityAction })
- Línea 17: @Column({ name: 'description', type: 'text' })
- Línea 20: @Column({ name: 'reference', nullable: true })
- Línea 23: @Column({ type: 'decimal', name: 'amount', precision: 12, scale: 2, nullable: true })
- Línea 26: @Column({ name: 'person_name', nullable: true })
- Línea 29: @Column({ type: 'timestamp', name: 'created_at' })

### server/src/domain/address.entity.ts

- Línea 8: @Entity('address')
- Línea 13: @Column({ name: 'neighborhood' })
- Línea 16: @Column({ name: 'street', nullable: true })
- Línea 19: @Column({ name: 'house_number', nullable: true })
- Línea 22: @Column({ name: 'city' })
- Línea 25: @Column({ type: 'decimal', name: 'latitude', precision: 10, scale: 2, nullable: true })
- Línea 28: @Column({ type: 'decimal', name: 'longitude', precision: 10, scale: 2, nullable: true })

### server/src/domain/auth-session.entity.ts

- Línea 3: @Entity('auth_session')
- Línea 5: @PrimaryColumn({ type: 'varchar', length: 36 }) id: string;
- Línea 6: @Index() @Column() userId: number;
- Línea 7: @Column({ type: 'varchar', length: 64 }) refreshHash: string;
- Línea 8: @Column({ type: 'text', default: '[]' }) usedRefreshHashes: string;
- Línea 9: @Column() expiresAt: Date;
- Línea 10: @Column({ default: false }) revoked: boolean;

### server/src/domain/authority.entity.ts

- Línea 4: @Entity('jhi_authority')
- Línea 7: @PrimaryColumn()

### server/src/domain/invoice.entity.ts

- Línea 12: @Entity('invoice')
- Línea 17: @Column({ type: 'date', name: 'issue_date' })
- Línea 20: @Column({ type: 'date', name: 'due_date' })
- Línea 23: @Column({ type: 'decimal', name: 'consumption_m_3', precision: 10, scale: 2 })
- Línea 26: @Column({ type: 'decimal', name: 'amount_due', precision: 10, scale: 2 })
- Línea 29: @Column({ type: 'decimal', name: 'rate_per_m3', precision: 10, scale: 2, nullable: true })
- Línea 32: @Column({ type: 'decimal', name: 'fixed_charge', precision: 10, scale: 2, nullable: true })
- Línea 35: @Column({ type: 'decimal', name: 'subsidy_percent', precision: 5, scale: 4, nullable: true })
- Línea 38: @Column({ type: 'decimal', name: 'additional_charges', precision: 10, scale: 2, nullable: true })
- Línea 41: @Column({ type: 'varchar', name: 'pdf_url', nullable: true })
- Línea 44: @Column({ type: 'varchar', name: 'status', enum: InvoiceStatus })
- Línea 47: @Column({ type: 'timestamp', name: 'created_at', nullable: true })
- Línea 50: @Column({ type: 'varchar', name: 'bold_order_id', nullable: true })
- Línea 53: @Column({ type: 'varchar', name: 'bold_transaction_id', nullable: true })
- Línea 56: @ManyToOne(type => Meter)
- Línea 59: @ManyToOne(type => Person)

### server/src/domain/meter.entity.ts

- Línea 11: @Entity('meter')
- Línea 16: @Column({ type: 'decimal', name: 'water_measure', precision: 10, scale: 2 })
- Línea 19: @Column({ type: 'date', name: 'reading_date' })
- Línea 22: @Column({ name: 'observation', nullable: true })
- Línea 25: @Column({ type: 'timestamp', name: 'created_at', nullable: true })
- Línea 28: @ManyToOne(type => Person)
- Línea 31: @ManyToOne(type => Address)

### server/src/domain/mobile-operation.entity.ts

- Línea 3: @Entity('mobile_operation')
- Línea 5: @PrimaryColumn({ type: 'varchar', length: 36 }) id: string;
- Línea 6: @PrimaryColumn({ type: 'integer' }) userId: number;
- Línea 7: @Column({ type: 'varchar', length: 64 }) payloadHash: string;
- Línea 8: @Column() personId: number;
- Línea 9: @Column({ type: 'text' }) result: string;
- Línea 10: @Column() createdAt: Date;

### server/src/domain/noticia.entity.ts

- Línea 10: @Entity('noticia')
- Línea 15: @Column({ name: 'title' })
- Línea 18: @Column({ name: 'summary', type: 'text', nullable: true })
- Línea 21: @Column({ name: 'content', type: 'text', nullable: true })
- Línea 24: @Column({ type: 'varchar', name: 'category', enum: NoticiaCategory })
- Línea 27: @Column({ type: 'varchar', name: 'status', enum: NoticiaStatus, default: NoticiaStatus.ACTIVE })
- Línea 30: @Column({ type: 'date', name: 'publish_date', nullable: true })
- Línea 33: @Column({ name: 'image_url', nullable: true })

### server/src/domain/notification.entity.ts

- Línea 5: @Entity('notifications')
- Línea 10: @Column({ name: 'user_login', type: 'varchar', length: 100 })
- Línea 13: @Column({ type: 'varchar', length: 50 })
- Línea 16: @Column({ type: 'varchar', length: 200 })
- Línea 19: @Column({ type: 'text' })
- Línea 22: @Column({ name: 'invoice_id', nullable: true, type: 'int' })
- Línea 25: @Column({ default: false })

### server/src/domain/person.entity.ts

- Línea 11: @Entity('person')
- Línea 16: @Column({ name: 'full_name' })
- Línea 19: @Column({ name: 'document_number', unique: true })
- Línea 22: @Column({ name: 'phone', nullable: true })
- Línea 25: @Column({ name: 'email', nullable: true })
- Línea 28: @Column({ type: 'varchar', name: 'status', enum: PersonStatus })
- Línea 31: @Column({ type: 'timestamp', name: 'created_at', nullable: true })
- Línea 34: @Column({ name: 'subscriber_number', unique: true, nullable: true })
- Línea 37: @Column({ name: 'stratum', type: 'int', nullable: true, default: 1 })
- Línea 40: @Column({ name: 'assigned_operator_id', type: 'integer', nullable: true })
- Línea 43: @Column({ name: 'user_id', nullable: true })
- Línea 46: @Column({ name: 'green_points', type: 'int', default: 0 })
- Línea 49: @Column({ name: 'days_since_last_debt', type: 'int', default: 0 })
- Línea 52: @Column({ type: 'decimal', name: 'savings_percent', precision: 5, scale: 2, default: 0 })
- Línea 55: @ManyToOne(type => Address)

### server/src/domain/reporte.entity.ts

- Línea 11: @Entity('reporte')
- Línea 16: @Column({ type: 'varchar', name: 'type', enum: ReporteType })
- Línea 19: @Column({ name: 'description', type: 'text', nullable: true })
- Línea 22: @Column({ type: 'varchar', name: 'status', enum: ReporteStatus, default: ReporteStatus.PENDING })
- Línea 25: @Column({ type: 'timestamp', name: 'created_at', nullable: true })
- Línea 28: @ManyToOne(type => Person)

### server/src/domain/user.entity.ts

- Línea 6: @Entity('jhi_user')
- Línea 11: @Column({ unique: true })
- Línea 13: @Column({ nullable: true })
- Línea 15: @Column({ nullable: true })
- Línea 17: @Column()
- Línea 19: @Column({ default: false })
- Línea 21: @Column({ default: 'en' })
- Línea 24: @ManyToMany(() => Authority)
- Línea 25: @JoinTable()
- Línea 28: @Column({
- Línea 33: @Column({ nullable: true })
- Línea 35: @Column({ nullable: true })
- Línea 38: @Column({ nullable: true })
- Línea 41: @Column({ nullable: true })
