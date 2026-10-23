// Datos de planificación. No importa ni ejecuta código de la aplicación.
const tasks=[];
function add(n,title,ids,phase,hours,owner,deps,steps,accept,verify,rollback,risk='Medio',prob=3,impact=3){tasks.push({id:`T-${String(n).padStart(3,'0')}`,title,ids:ids.map(i=>`WS-${String(i).padStart(3,'0')}`),phase,hours,owner,deps:deps.map(i=>`T-${String(i).padStart(3,'0')}`),steps:steps.split(' || '),accept:accept.split(' || '),verify,rollback,risk,prob,impact});}
add(1,'Fijar alcance, responsables y entorno de trabajo',[43],0,[8,12],'QA',[],
'Registrar commit y cambios locales sin descartarlos; acordar congelación de cambios ajenos || Designar responsables de datos, pagos, despliegue y revisión || Preparar rama y especificación de staging con datos sintéticos, destino y accesos aislados; acordar topología',
'Inventario firmado y cada acceso de staging separado de producción || Responsable y sustituto asignados por área; exclusiones y topología documentadas',
'Q-DOC: cotejar hashes y destinos; revisión de accesos con dueño del servicio. No copiar PII a staging.',
'Cancelar preparación conservando instantánea; no resetear cambios locales existentes.','Bajo',2,4);
add(2,'Probar backup y restauración antes de cambiar datos',[14],0,[12,20],'OPS',[1],
'Inventariar PostgreSQL, bucket y configuración sin volcar valores secretos a documentos || Crear respaldo cifrado y verificar integridad y retención || Restaurar en destino aislado; contar registros y cuadrar importes; medir RPO/RTO con negocio',
'Restauración independiente demostrada y accesos comprobados || Inventario de datos, última copia, RPO/RTO objetivo y tiempos medidos aprobados',
'Q-RESTORE: acta de restauración con destino, hashes, conteos e importes conciliados; no usar scripts down -v del repo.',
'No alterar producción durante el ensayo; retirar acceso temporal al clon según política. Si falla, bloquear cambios de esquema.','Alto',3,5);
add(3,'Rotar las credenciales históricas y revocar sesiones',[3],0,[8,16],'OPS',[1],
'Identificar entornos que usaron los valores históricos sin probarlos contra destinos no autorizados || Crear credenciales PostgreSQL y claves JWT nuevas por gestor de secretos; ensayar despliegue coordinado || Revocar claves anteriores y familias de sesiones; revisar accesos y registrar solo identificadores de versión',
'Cada credencial histórica tiene evidencia de revocación o de que nunca se desplegó || Token firmado con clave anterior y refresh revocado son rechazados; aplicación usa credencial nueva',
'Q-SECRET: comprobar versiones del proveedor y sesión de prueba; no imprimir claves ni contraseñas.',
'Emitir otra credencial nueva si falla; jamás reactivar el secreto expuesto. Mantener acceso administrativo de emergencia verificado.','Alto',4,5);
add(4,'Capturar la línea base reproducible y presupuestos',[43,42],0,[8,16],'QA',[1,2],
'Reproducir 42 pruebas backend y 182 frontend con versiones fijadas en staging || Capturar build, lint, cobertura real y métricas iniciales de rutas representativas || Guardar resultados por commit y fijar cuentas sintéticas, carga y criterios de comparación',
'224 pruebas previas reproducidas o diferencias explicadas || Cobertura, latencia, errores y bundle tienen medición o bloqueo identificado; ningún dato desconocido se registra como cero',
'Q-UNIT, Q-TYPE, Q-BUILD, Q-LINT y Q-PERF; no ejecutar E2E heredado que migra BD.',
'Descartar resultados de un entorno mal configurado y repetir captura; no cambiar la línea base original.','Bajo',3,4);
add(5,'Aislar el portal mediante el ID autenticado',[1],1,[8,16],'BE',[4],
'Cambiar controlador para pasar req.user.id || Consultar Person por String(id) sin alternativa por login o correo; denegar vínculos ausentes/ambiguos || Crear prueba de dos cuentas con login numérico coincidente y comprobar perfil, facturas y resúmenes',
'Cuenta 99 con login 42 nunca recibe datos del propietario 42 || Cuenta válida sigue accediendo; vínculo ambiguo produce respuesta controlada sin PII',
'Q-UNIT y Q-API: prueba real con guardas; fijar caso del probe WS-001 en suite de integración.',
'Si afecta vínculos antiguos, deshabilitar temporalmente portal afectado y corregir mapeo; no restaurar fallback por login.','Alto',4,5);
add(6,'Persistir únicamente la clave PDF de la factura',[2],1,[8,12],'BE',[4],
'Añadir actualización parcial de pdfUrl por ID || Sustituir ambos guardados de instantánea en descarga y generate-pdf || Inyectar barrera S3 durante confirmación de pago y probar errores de generación',
'PAID y boldTransactionId sobreviven a PDF concurrente en ambos endpoints || Error S3 no cambia estado financiero y se distingue de factura inexistente',
'Q-UNIT y Q-API: carrera reproducible con barreras; PostgreSQL requerido para cierre final.',
'Desactivar regeneración PDF y servir documentos existentes; conservar estado financiero y no volver al guardado completo.','Medio',4,5);
add(7,'Limpiar el chat cuando cambia la sesión',[6],1,[4,8],'FE',[4],
'Desmontar o reiniciar el chat por identidad de sesión || Borrar mensajes, entrada y estados; abortar petición o descartar respuesta de sesión anterior || Probar salida y cambio admin a usuario con respuesta en vuelo',
'Tras logout/login no hay mensajes ni PII de la sesión anterior || Respuesta tardía de otra sesión no se representa',
'Q-UI: componente montado desde router y navegador con dos cuentas sintéticas.',
'Ocultar/deshabilitar chatbot mediante flag nuevo si falla; nunca conservar conversaciones entre cuentas.','Bajo',4,5);
add(8,'Revocar refresh y cerrar cookie con acceso vencido',[7],1,[12,20],'BE',[4],
'Definir logout web autenticado por refresh y Origin, con revocación idempotente y limpieza de cookie || Mantener contrato de clientes móviles y rechazo de orígenes ajenos || UI espera resultado, trata fallo de red y sincroniza pestañas sin fingir revocación confirmada',
'JWT vencido más refresh válido permite salir y el refresh queda inutilizable || Recarga y otra pestaña no restauran sesión revocada; origen ajeno no revoca ni renueva',
'Q-API y Q-UI: cookie Secure/HttpOnly real sobre HTTPS, vencimiento de JWT, múltiples pestañas y red caída.',
'Forzar revocación de familias y desactivar renovación web temporalmente si falla; rollback de UI compatible sin restaurar tokens.','Alto',4,5);
add(9,'Asignar referencia Bold de forma atómica',[5],1,[12,20],'BE',[4],
'Bloquear fila dentro de transacción al crear/reutilizar boldOrderId || Leer estado e importe bajo el mismo bloqueo; generar hash tras fijar referencia || Probar doble clic, solicitudes simultáneas y factura ya pagada',
'20 solicitudes concurrentes obtienen una única referencia estable e importe consistente || Factura no pagable no genera orden',
'Q-API: barrera de concurrencia con PostgreSQL y aserción de unicidad; mantener firma existente.',
'Desactivar nuevas aperturas de checkout y seguir recibiendo webhooks; no eliminar referencias ya entregadas a Bold.','Alto',4,5);
add(10,'Retirar cuentas de ejemplo y asegurar primer administrador',[9],1,[8,12],'BE',[2,3],
'Buscar por criterios auditables cuentas sembradas en cada entorno autorizado || Diferenciar cuentas reales de ejemplos, desactivar ejemplos y revocar sus sesiones || Impedir reutilización de semilla en entornos reales y documentar alta segura sin contraseña fija',
'No existen cuentas de ejemplo activas o se aporta evidencia de ausencia || Bootstrap real no crea contraseñas fijas y conserva un administrador verificado',
'Q-API y Q-SECRET: matriz de cuentas por entorno sin contraseñas; ensayo de bootstrap en base vacía.',
'Recuperar acceso mediante nuevo administrador de emergencia validado; no reactivar cuentas ni contraseñas sembradas.','Alto',3,5);
add(11,'Contener mutaciones financieras fuera del dominio',[8],1,[8,12],'BE',[4],
'Bloquear temporalmente edición de importes, relaciones y estado tras iniciar pago || Restringir rutas CRUD alternativas de creación y borrado que evaden BillingService || Mantener emisión canónica y comunicar a administración las operaciones suspendidas',
'ADMIN no puede alterar una factura pagada ni cambiar una referencia activa por CRUD || Emisión canónica permanece disponible; denegaciones tienen mensaje claro',
'Q-API: matriz POST/PUT/DELETE en pendientes, con orden y pagadas; comprobar frontend administrativo.',
'Mantener restricciones y tramitar excepciones con revisión humana; no reabrir el CRUD vulnerable para resolver un incidente.','Alto',4,5);
add(12,'Escapar nombres de usuario en las vistas',[11],1,[4,8],'FE',[4],
'Reemplazar v-html de nombre por texto/componentes i18n en ajustes y contraseña || Acordar formato de nuevos logins sin invalidar cuentas existentes || Probar traducciones y etiquetas maliciosas como texto',
'Cadena HTML se muestra literalmente y no crea elementos activos || Ajustes y cambio de contraseña siguen funcionando en español',
'Q-UI: payload sintético inerte y aserción de DOM; comprobar ambos componentes.',
'Volver a título fijo sin interpolación si falla la traducción; no restaurar v-html con entrada libre.','Bajo',2,3);
add(13,'Identificar demos y retirar telemetría ficticia de producción',[25],1,[4,8],'FE',[4],
'Etiquetar datos demo y bloquear generación aleatoria en entorno real || Mostrar Sin datos verificados con fecha/calidad cuando falta fuente || Registrar decisión de negocio sobre futura integración de sensores',
'Ningún dato aleatorio o fijo se presenta como actividad o telemetría real || Ausencia de sensor produce estado explícito, no porcentaje inventado',
'Q-UI: inspección de pantalla y mensajes Socket.IO en perfiles demo y producción.',
'Ocultar tarjeta y enlaces de demo; no volver a mostrar En vivo sin fuente verificada.','Bajo',5,4);
add(14,'Preparar integración aislada con PostgreSQL',[43],2,[16,24],'QA',[4],
'Crear configuración de prueba PostgreSQL descartable con destinos permitidos || Inicializar esquema de fixtures explícito sin ejecutar synchronize histórico || Mantener guardas reales y dobles solo para correo, S3 y pasarela externos',
'Suite no puede apuntar a producción; guardas no se sustituyen || Limpieza afecta solo base descartable y fallo de destino cancela ejecución',
'Q-API: implementar config server/e2e/jest.postgres.config.cjs y guard de destino; ejecutar smoke de login/propiedad.',
'Desactivar job nuevo si falla aislamiento y conservar unitarias; nunca degradar a SQLite como prueba equivalente.','Alto',3,5);
add(15,'Definir baseline de esquema y runner explícito',[14],2,[16,24],'BE',[2,14],
'Comparar esquema real autorizado, entidades e historial de migraciones || Diseñar baseline para instalaciones nuevas y actualización aditiva para existentes; preservar migraciones ya aplicadas || Sustituir uso operativo de synchronize por runner revisable con preflight y ensayo up/rollback',
'Nueva base y clon existente llegan al mismo esquema esperado sin synchronize || No se reescribe a ciegas historial aplicado; rollback compatible ensayado y documentado',
'Q-DB: diff de esquema antes/después y repetición idempotente; restore T-002 disponible.',
'Detener migración ante precondición incumplida; mantener esquema aditivo y revertir aplicación compatible. Restaurar copia solo bajo plan de reconciliación.','Alto',3,5);
add(16,'Conciliar vínculos de usuarios y suscriptores',[1,15],2,[16,24],'BE',[5,15],
'Inventariar duplicados, huérfanos y texto no numérico en userId y asignaciones || Preparar correspondencia aprobada por dueño de datos; separar casos ambiguos || Aplicar corrección controlada e idempotente con bitácora anterior/nueva',
'Cada vínculo ambiguo tiene resolución aprobada o cuenta restringida sin fuga || Cero asignaciones cruzadas en muestra y prueba exhaustiva de restricciones',
'Q-DB y Q-API: conciliación por conteos y revisión humana; no inferir dueño solo por correo/login.',
'Revertir mapeo usando bitácora validada, manteniendo acceso bloqueado para casos dudosos.','Alto',3,5);
add(17,'Añadir relaciones y FK de identidad',[15],2,[12,20],'BE',[16],
'Agregar columnas/relaciones tipadas mediante expandir, rellenar y validar || Incorporar FK de persona, operador, sesiones y operaciones con reglas de borrado aprobadas || Mantener lectura compatible hasta retirar columnas antiguas en cambio posterior',
'Insertar referencia inexistente falla sin dejar huérfanos || No se eliminan facturas ni datos sujetos a retención al borrar cuenta',
'Q-DB: catálogo FK, datos previos, borrado y rollback con versión anterior compatible.',
'Detener cambio de lectura y conservar columnas antiguas; quitar restricción nueva solo si no reabre acceso cruzado.','Alto',3,4);
add(18,'Proteger unicidad financiera e índices medidos',[16],2,[12,20],'BE',[9,15],
'Acordar una factura por lectura y unicidad de referencias según negocio; detectar duplicados || Conciliar duplicados sin borrado automático y crear restricciones parciales para valores nulos || Añadir índices de historial y sesión con medición EXPLAIN y ventana de locks',
'Duplicado de lectura/referencia se rechaza con conflicto controlado || Historial y sesiones usan índices previstos; no hay bloqueo superior al presupuesto acordado',
'Q-DB: duplicados preflight, catálogo, EXPLAIN y carga concurrente de escrituras.',
'Cancelar índice concurrente fallido y conservar datos; retirar índice de rendimiento si regresa latencia, sin eliminar protección financiera sin contención.','Alto',3,5);
add(19,'Centralizar emisión y actualización de facturas',[8,10],2,[16,24],'BE',[11,18],
'Dirigir todas las altas al cálculo canónico desde lectura confirmada || Usar lista explícita de campos y bloquear cambios financieros con orden/pago || Definir comandos y estados permitidos con pruebas de cada transición',
'Ninguna ruta acepta importe calculado por cliente como autoridad || Dos canales generan el mismo saldo; pagadas y con orden no admiten edición incompatible',
'Q-API y Q-UNIT: matriz de todos los endpoints de factura y propiedades del cálculo en centavos.',
'Volver a contención T-011 y conservar eventos/estados; no revertir a escritura genérica.','Alto',4,5);
add(20,'Proteger la secuencia de lecturas y sus correcciones',[8],2,[12,20],'BE',[19],
'Validar orden temporal y lectura acumulada bajo bloqueo del suscriptor || Rechazar cambios de lectura ya facturada sin flujo de corrección || Alinear API administrativa y móvil; registrar autor/motivo',
'Lectura menor o fuera de secuencia no corrompe consumo || ADMIN y móvil aplican la misma regla y una lectura facturada no se borra',
'Q-API: dos capturas concurrentes, edición retroactiva y corrección autorizada.',
'Deshabilitar edición retroactiva y mantener captura válida; conservar registro anterior y corrección.','Alto',3,5);
add(21,'Registrar pagos manuales y ajustes auditables',[8],2,[16,24],'BE',[19],
'Acordar permisos, motivo, soporte e idempotencia de pagos manuales || Crear comando transaccional que guarde evento, fecha y actor sin sobrescribir evidencia Bold || Ajustar UI para solicitar soporte y usar reversos compensatorios',
'Repetir una operación no duplica abono || Toda modificación de saldo tiene evento, actor y motivo; no permite ocultar una referencia de pasarela',
'Q-API y Q-UI: pago manual duplicado, rol no permitido y ajuste/reverso conciliados.',
'Cerrar temporalmente operación manual; nunca borrar eventos contabilizados, compensar mediante operación aprobada.','Alto',3,5);
add(22,'Crear tokens de invitación y activación de un solo uso',[4],2,[16,24],'BE',[10,15],
'Persistir hash, propósito, vencimiento y consumo de token con migración aditiva || Implementar activación pública con prueba del token y validación de contraseña || Consumir token y activar cuenta en una transacción; limitar reintentos',
'Token vencido/reutilizado/otro propósito no activa cuenta || Dos consumos simultáneos solo permiten una activación; secreto nunca se guarda en claro',
'Q-API: token válido, inválido, replay y carrera; Q-DB para migración de tabla nueva.',
'Desactivar emisión/consumo por flag nuevo y revocar tokens pendientes; conservar cuentas ya activadas legítimamente.','Alto',3,5);
add(23,'Entregar invitaciones verificables por correo',[4],2,[16,24],'BE',[22],
'Acordar proveedor, dominio remitente y prueba de entrega con negocio || Encapsular envío, reintento acotado e idempotencia sin tokens en logs || Vincular alta administrativa a emisión tras commit y ofrecer reenvío seguro',
'Cuenta nueva recibe enlace funcional en buzón de pruebas || Fallo de proveedor muestra estado pendiente recuperable sin duplicar usuario ni enviar claves',
'Q-API: adaptador de correo y buzón sandbox; comprobar rebote, retry y enlace de host permitido.',
'Pausar envíos y conservar cola/estado; anular enlaces no entregados si hay sospecha de fuga.','Medio',3,4);
add(24,'Habilitar recuperación pública segura de contraseña',[4],2,[16,24],'BE',[8,22,29],
'Implementar inicio con respuesta neutra y token de propósito reset || Validar vencimiento/uso único y contraseña; revocar sesiones al completar || Enviar notificación de cambio y proteger contra enumeración y ráfagas',
'Usuario sin sesión recupera acceso y sus sesiones previas quedan revocadas || Respuesta no revela existencia de cuenta; token de activación no sirve para reset',
'Q-API: correo existente/no existente, límites, replay, reset concurrente y revocación.',
'Suspender inicio/finish por flag y ofrecer soporte verificado; no restaurar contraseñas previas ni sesiones revocadas.','Alto',3,5);
add(25,'Completar UI de activación y recuperación',[4],2,[12,20],'FE',[23,24],
'Conectar vistas/rutas activas con contratos nuevos || Retirar mensaje teléfono como contraseña y alinear regla 12 caracteres/72 bytes con backend || Añadir estados expirado/usado/reenvío/error sin revelar cuenta',
'Nuevo suscriptor establece clave, entra, sale y recupera sin asistencia técnica || Textos y errores reflejan límites reales; no hay pantallas de éxito ficticias',
'Q-UI: viaje de alta a reset en navegador y pruebas de componentes usados por router.',
'Deshabilitar acciones nuevas conservando página explicativa y canal verificado; API y tokens válidos siguen compatibles.','Medio',3,4);
add(26,'Hacer transaccional el alta de persona, cuenta y dirección',[17],2,[12,20],'BE',[14,17],
'Extraer alta compuesta a servicio con un EntityManager transaccional || Aplicar unicidad y convertir errores públicos a conflicto estable || Emitir invitación solo tras commit',
'Fallo tras cualquiera de las tres escrituras deja cero objetos parciales || Reintento legítimo no encuentra cuenta huérfana; correo no sale antes de commit',
'Q-API: fault injection en cada escritura y documento/correo duplicados.',
'Suspender altas y conservar registros confirmados; no usar compensación parcial que borre datos válidos.','Alto',3,4);
add(27,'Persistir intentos y eventos de pago conciliables',[5],2,[16,24],'BE',[18,19],
'Crear ledger aditivo de intentos/eventos con referencia e idempotencia || Migrar referencias conocidas sin inventar fechas históricas || Registrar inicio y confirmación con correlación de factura y transacción',
'Cada referencia emitida tiene registro durable y no se pierde al reintentar || ID de transacción duplicado no abona otra factura',
'Q-DB y Q-API: upgrade del esquema, duplicados y trazabilidad hasta factura.',
'Conservar ledger y dejarlo en lectura; detener nuevos checkouts si versión anterior no conserva referencias.','Alto',4,5);
add(28,'Conciliar webhooks desconocidos y cobros históricos',[5],2,[16,24],'BE',[27],
'Persistir evento firmado desconocido en bandeja durable con alerta || Definir acuse tras persistencia, reintento y revisión manual con fuente Bold autorizada || Conciliar periodo expuesto con exportación del comercio sin reprocesar cargos',
'Evento desconocido no se pierde silenciosamente y genera revisión || Importe/moneda/firma inválidos no modifican saldo; conciliación histórica tiene responsable y diferencias resueltas',
'Q-API: repetición/desorden/evento desconocido; Q-DOC: conciliación de importes con evidencia del comercio.',
'Mantener recepción durable y suspender aplicación automática de casos dudosos; no volver a cobrar ni borrar eventos.','Alto',4,5);
add(29,'Limitar abuso de login y registro sin bloquear el hilo',[13],2,[12,20],'BE',[14],
'Combinar cuota por cuenta, origen confiable y capacidad; incluir registro/reset || Cambiar compareSync por comparación asíncrona || Validar proxy confiable y falsificación de IP; medir latencia y rechazos',
'Rotar nombres no elude cuota de origen/capacidad || 429 controlado, contraseñas siguen validando y tráfico permitido cumple presupuesto acordado',
'Q-API y Q-PERF: ráfagas sintéticas acotadas en staging, múltiples cuentas/IP simuladas.',
'Ajustar umbrales con métricas manteniendo cuota global; no volver a bcrypt síncrono ni abrir registro sin límites.','Medio',4,4);
add(30,'Alinear permisos por operación entre UI y API',[27],2,[8,16],'BE',[5,14],
'Acordar matriz explícita USER/ADMIN/OPERATOR por ruta y registro || Aplicar a menús/router y decoradores sin herencia implícita || Añadir pruebas con cada rol aislado y cuentas ajenas',
'Permisos aprobados coinciden en UI/API para todas las rutas afectadas || Ocultar menú nunca es la única autorización y no se amplía ADMIN por accidente',
'Q-API y Q-UI: tabla de positivos y negativos por rol; 401/403/404 definidos.',
'Cerrar rutas nuevas si hay duda; restaurar matriz restrictiva anterior sin habilitar accesos cruzados.','Alto',3,4);
add(31,'Reproducir contenedores desde el lock y runtime único',[36],2,[16,24],'OPS',[4],
'Elegir topología y versión soportada de Node tras comprobar compatibilidad en ejecución || Incluir lock raíz y npm ci con workspaces; fijar imágenes por digest y validar scripts nativos || Ejecutar con usuario no privilegiado y probar imagen final',
'Dos builds del mismo lock resuelven las mismas versiones; imagen ejecuta el runtime acordado || Proceso sin root y smoke de API/cliente supera regresión',
'Q-IMAGE: build de topología elegida y test en contenedor final; cotejar lock y UID.',
'Desplegar digest previo compatible con secretos nuevos y schema expandido; no reconstruir imagen vieja con dependencias distintas.','Alto',3,4);
add(32,'Declarar variables y persistencia por entorno',[38],2,[8,16],'OPS',[3,31],
'Declarar variables obligatorias y pasarlas explícitamente mediante secretos || Separar compose de desarrollo, staging y despliegue; eliminar trust fuera de fixtures aislados || Verificar volumen persistente y fallo de arranque por configuración incompleta sin imprimir valores',
'Falta de variable cancela arranque con nombre y sin secreto || Reinicio conserva datos en entorno persistente y credenciales no quedan en imagen',
'Q-CONFIG y Q-IMAGE: smoke positivo/negativo y prueba de reinicio en staging.',
'Restaurar versión de configuración no secreta; mantener credenciales rotadas y volumen existente.','Alto',3,4);
add(33,'Unificar cabeceras HTTP con política compatible con Bold',[12],2,[8,16],'OPS',[31,32],
'Capturar cabeceras actuales en ambas topologías admitidas || Introducir CSP en reporte y ensayar scripts/conexiones Bold; después aplicar || Activar HSTS solo con HTTPS completo y revisar permisos, framing y caché de datos privados',
'HTML/API devuelven políticas acordadas y pago funciona sin violaciones inesperadas || Ningún recurso privado queda cacheado públicamente; prueba HTTPS completa precede HSTS',
'Q-HEADERS y Q-UI: checkout sandbox, login/refresh, PDF y reporte CSP.',
'Volver CSP a report-only si rompe carga; HSTS no se revierte inmediatamente en clientes, por eso aplicar max-age gradual.','Medio',3,4);
add(34,'Reenviar Socket.IO y verificar reconexión',[37],2,[4,8],'OPS',[13,31],
'Configurar ruta /socket.io y Upgrade/Connection en proxy || Definir timeouts, origen y reconexión para topología elegida || Probar polling y upgrade sin presentar simulaciones como reales',
'Handshake recibe respuesta Engine.IO y upgrade funciona || Reiniciar backend reconecta con estado de desconexión visible',
'Q-SOCKET y Q-UI sobre Nginx de staging; no basta prueba directa contra Nest.',
'Desactivar tarjeta/stream y mantener API HTTP; restaurar proxy previo solo con telemetría explícitamente fuera de servicio.','Bajo',3,3);
add(35,'Añadir health de aplicación y dependencias',[42],2,[12,20],'OPS',[32],
'Separar liveness de readiness con timeout de PostgreSQL || Proteger detalles y reflejar versión real de release || Conectar readiness al despliegue y comprobar pérdida controlada de DB',
'DB caída retira readiness sin reinicios en bucle por liveness || Endpoints públicos no revelan secretos y versión coincide con imagen',
'Q-HEALTH: fallo de conexión simulado y healthcheck real del contenedor.',
'Volver regla de encaminamiento anterior manteniendo alarma manual; no usar TCP como evidencia de salud de DB.','Medio',3,4);
add(36,'Cerrar regresión HTTP y navegador de los riesgos altos',[43],2,[16,24],'QA',[5,6,7,8,9,20,21,25,26,28,30,35],
'Integrar pruebas específicas ya creadas por cada corrección en viajes reales || Ejecutar identidad, alta, reset, sesiones, pago/PDF y matriz de roles sobre staging || Capturar evidencia por hallazgo y revisar con dueño de negocio',
'Todos los casos de alto riesgo pasan con guardas reales y PostgreSQL || No hay diferencias financieras no conciliadas; fallo de caso bloquea hito',
'Q-API y Q-UI completos; repetir casos concurrentes con barreras para evitar éxitos accidentales.',
'No promover release fallida; conservar restricciones F1 y abrir defecto con reproducción.','Alto',4,5);
add(37,'Sanear historial tras revocar secretos y añadir prevención',[3],2,[8,16],'OPS',[3,10],
'Inventariar clones, forks, tags y responsables de integraciones || Acordar ventana y copia restringida; ejecutar saneamiento solo con autorización de reescritura || Reincorporar colaboradores y añadir escaneo preventivo sin registrar valores',
'Ramas/tags distribuidos acordados no contienen secretos detectados || Revocación fue previa; forks/clones fuera de control quedan identificados con seguimiento',
'Q-SECRET: escaneo local de referencias y revisión de protección CI; no ejecutar comandos que impriman blobs.',
'Conservar copia forense con acceso restringido; restaurar solo referencias saneadas y coordinar rebase, nunca publicar otra vez secretos.','Alto',3,5);
add(38,'Validar contratos financieros e ID de ruta',[10,21],3,[12,20],'BE',[19,20],
'Separar DTO de alta/edición para facturas y lecturas con tipos, rangos, fechas y campos permitidos || Hacer ID de ruta autoritativo y rechazar discrepancias o ausencia de registro || Adaptar clientes antes de activar whitelist/rechazo de extras en estas rutas',
'Negativos, fechas/estados inválidos y campos extra reciben 400 sin escritura || PUT /1 con id 2 no altera ninguno; inexistente devuelve 404',
'Q-API: matriz de entradas inválidas y contratos actuales válidos para web/móvil.',
'Mantener allowlist de campos financieros; desactivar únicamente incompatibilidad de cliente identificada mediante parche específico.','Medio',3,4);
add(39,'Validar DTO e IDs del resto del CRUD',[10,21],3,[16,24],'BE',[38,30],
'Aplicar DTO anidados y mapeos explícitos a personas, direcciones, noticias y reportes || Validar formato de login nuevo y mantener compatibilidad de usuarios previos || Activar política global solo tras inventariar interfaces inline y adaptar cada ruta',
'Todos los PUT con ID respetan URL y no insertan accidentalmente || Contratos IA/móvil/refresh siguen funcionando y se rechazan extras peligrosos',
'Q-API: contrato parametrizado por cada controlador del inventario, sin depender solo de Swagger.',
'Revertir por ruta al DTO anterior seguro; evitar retirar globalmente validación para resolver una incompatibilidad puntual.','Medio',3,4);
add(40,'Acotar listados y corregir enlaces de paginación',[22,23],3,[8,16],'BE',[39],
'Validar page/size y sort con límites y lista de campos || Calcular páginas con ceil y limitar next/last || Publicar límites y total/cursor de contrato',
'size negativo/excesivo y sort desconocido se rechazan o normalizan según contrato || Para 21 registros y size 20, last=1; cero registros y última página no generan next inválido',
'Q-UNIT y Q-API: tabla 0/1/20/21 registros, límites, desbordamiento y entradas no numéricas.',
'Conservar límite máximo y corregir enlaces sin reabrir listados ilimitados.','Bajo',4,3);
add(41,'Eliminar N+1 y añadir búsqueda paginada',[22],3,[12,20],'BE',[17,18,40],
'Reescribir getUsersWithStatus y bootstrap móvil con consultas por lote || Añadir búsqueda de suscriptores y paginación de noticias públicas || Medir consultas y latencia con datos sintéticos representativos',
'Número de consultas no crece linealmente con 20/100 filas || Suscriptor fuera de primera página aparece por búsqueda; resultados no filtran datos de otro rol',
'Q-PERF y Q-API: conteo de SQL y EXPLAIN con filtro; presupuesto propuesto <=5 consultas por página, validar en T-004.',
'Restaurar consulta anterior acotada y conservar paginación; investigar plan SQL sin quitar filtros de autorización.','Medio',4,3);
add(42,'Paginar búsquedas y listas administrativas completas',[24],3,[12,20],'FE',[41],
'Consumir búsqueda servidor y total/cursor en facturación || Incorporar navegación en usuarios/noticias e historial afectado || Cancelar requests viejos y separar vacío, carga y error',
'Cuenta 201 y suscriptor 21 son accesibles mediante UI || Respuesta vieja no sobrescribe filtro nuevo y errores no parecen lista vacía',
'Q-UI: fixture >200 usuarios y >20 suscriptores/noticias, respuestas fuera de orden.',
'Conservar filtro/contrato API y ofrecer navegación simple si falla búsqueda avanzada.','Medio',4,3);
add(43,'Acordar definiciones de consumo, recaudo y vencimiento',[18,47],3,[8,12],'BE',[21,28],
'Definir consumo por diferencia, reinicio de medidor y datos faltantes con negocio || Definir fecha de cobro real y tratamiento de pagos históricos sin timestamp verificable || Acordar día/hora/zona de vencimiento y casos de medianoche',
'Ejemplos aprobados: 100 a 110 equivale a 10 y pago en mes distinto se asigna al cobro || Regla de vencimiento y tratamiento desconocido documentados sin inventar fechas',
'Q-DOC: tabla de ejemplos firmada por responsable de facturación.',
'Mantener indicadores como no verificados si negocio no decide; no publicar cálculos arbitrarios.','Bajo',4,4);
add(44,'Tratar fechas de calendario y mora de forma uniforme',[47],3,[8,16],'FE',[43],
'Evitar parseo UTC de YYYY-MM-DD para visualización de calendario || Compartir criterio de vencimiento aprobado en API/cron/UI || Probar fecha límite en Bogotá y navegador con otra zona',
'2026-10-05 se muestra como 5 de octubre en Bogotá || Mora cambia en instante de negocio acordado, de igual forma en UI/API',
'Q-UNIT y Q-UI: medianoche, fin de mes, año bisiesto y zonas distintas.',
'Mostrar fecha literal y suspender etiqueta de mora calculada localmente hasta corregir discrepancia.','Medio',4,4);
add(45,'Corregir agregación de consumo en los tableros',[18],3,[12,20],'BE',[43,20],
'Usar consumos confirmados/diferencias según definición aprobada || Aplicar misma consulta al resumen admin y portal || Tratar primer registro, reinicio y huecos como datos incompletos explícitos',
'Series de lecturas conocidas cuadran con facturas y suma del periodo || No se suman acumulados ni se inventa consumo faltante',
'Q-UNIT y Q-API: fixtures multi-mes y cambio de medidor; comparar resultado tabular y gráfico.',
'Ocultar indicador incorrecto conservando datos brutos; no reescribir lecturas para hacer coincidir tablero.','Medio',4,4);
add(46,'Atribuir recaudo a eventos de pago verificables',[18],3,[12,20],'BE',[43,28,21],
'Guardar timestamp confiable de pago y fuente en eventos || Agrupar recaudo por fecha de cobro y excluir pendientes || Clasificar históricos sin evidencia como fecha desconocida y conciliar totales',
'Factura emitida en un mes y pagada al siguiente cuenta en el segundo || Total de caja concilia con eventos; histórico sin fecha no se atribuye a emisión por defecto',
'Q-DB y Q-API: duplicados, reversos, cobro parcial si negocio lo admite y periodos.',
'Mantener eventos y restaurar vista sin desglose temporal si hay inconsistencia; no alterar contabilización.','Alto',4,4);
add(47,'Añadir outbox transaccional de eventos de facturación',[19,20],3,[16,24],'BE',[15,19,28],
'Crear tabla aditiva de eventos y claves de idempotencia || Escribir factura/actividad/evento con mismo manager en transacción || Separar confirmación financiera de entrega de notificación',
'Commit financiero siempre deja evento durable correspondiente || Rollback de factura no deja aviso y entrega caída no pierde evento',
'Q-DB y Q-API: caída antes/después de commit y posterior recuperación.',
'Pausar consumidor y conservar outbox; no borrar eventos pendientes ni duplicar entrega legacy.','Alto',3,4);
add(48,'Entregar avisos y actividad de forma idempotente',[19],3,[12,20],'BE',[47],
'Consumir eventos con locking, reintento acotado y clave única de entrega || Registrar creación desde flujo canónico y actor || Añadir estado fallido revisable sin exponer PII en logs',
'Cada factura canónica genera aviso y actividad una sola vez || Caída de entrega se recupera sin deshacer pago ni perder aviso',
'Q-API: dos consumidores, reintento y red caída; verificar actividad/aviso persistidos.',
'Detener consumidores manteniendo cola y usar reenvío controlado por clave; no habilitar dos mecanismos sin deduplicar.','Medio',3,4);
add(49,'Recuperar cron omitido sin duplicar avisos',[20],3,[12,20],'BE',[48,44],
'Persistir ventanas procesadas y recuperar días pendientes || Fijar zona aprobada y deduplicar por factura/tipo/fecha || Ensayar dos réplicas y caída de 48 horas',
'Dos réplicas generan una sola entrega lógica || Reinicio procesa atrasos sin repetir avisos ni omitir vencimientos',
'Q-API con reloj controlado, dos workers y marca de progreso durable.',
'Pausar cron automático y mantener backlog; recuperar por lotes idempotentes revisados.','Medio',4,4);
add(50,'Conectar actividad real y calidad de datos del tablero',[25],3,[8,16],'FE',[48],
'Sustituir lista fija por API paginada con permisos || Mostrar actor, instante y estado vacío/error de forma clara || Mantener telemetría sin fuente deshabilitada y documentar contrato futuro autenticado',
'Pago/lectura de prueba aparecen desde API sin nombres fijos || Telemetría no integrada se muestra Sin fuente; no se entrega integración física inexistente',
'Q-UI y Q-API: evento real sintético, desconexión y cuenta sin permiso.',
'Ocultar actividad ante fallo; conservar estado sin datos y no volver a mocks de producción.','Bajo',4,3);
add(51,'Asociar etiquetas y mensajes de formularios',[28],3,[8,12],'FE',[25],
'Inventariar controles activos y asignar id/for únicos || Vincular ayudas/errores con aria-describedby y nombres de botones || Verificar formularios de alta, edición y cuentas con lector',
'Cada control tiene nombre accesible inequívoco || Error es anunciado y referencia a su campo sin IDs duplicados',
'Q-A11Y: análisis automático más NVDA/teclado en flujos activos.',
'Revertir marcado defectuoso de forma local manteniendo asociación accesible alternativa.','Bajo',4,3);
add(52,'Garantizar foco y teclado en modales',[29],3,[12,20],'FE',[51],
'Crear componente/modal común con rol, nombre y aria-modal || Gestionar foco inicial, contención, Escape y retorno || Migrar modales activos y validar superposición/scroll',
'Usuario completa y cierra cada modal solo con teclado || Al cerrar vuelve al activador y lector anuncia título sin acceder al fondo',
'Q-A11Y y Q-UI: tab/shift-tab/Escape, apertura anidada y móvil.',
'Deshabilitar modal problemático ofreciendo formulario en página accesible; no quitar control de foco globalmente.','Medio',4,3);
add(53,'Dar equivalentes textuales a los gráficos',[30],3,[8,12],'FE',[45],
'Añadir título y resumen accesible a cada gráfico || Renderizar tabla de la misma serie y estados independientes del color || Validar lectura y valores frente a API',
'Todos los puntos de la serie se consultan sin canvas || Tabla, resumen y gráfico coinciden y funcionan al ocultar colores',
'Q-A11Y: lector y tabla con fixtures; Q-UI de vacío y error.',
'Presentar solo tabla si gráfico falla; no retirar acceso a los datos.','Bajo',4,3);
add(54,'Liberar listeners y gráficos al desmontar',[26],3,[4,8],'FE',[4],
'Registrar resize en montaje y retirarlo con misma función || Destruir instancias Chart y cancelar peticiones || Probar navegación repetida en las cinco vistas afectadas',
'Tras 20 entradas/salidas listeners y gráficos vuelven al conteo inicial || No se actualiza una vista desmontada',
'Q-UI: espías add/removeEventListener y destroy; perfil de memoria sin crecimiento sostenido.',
'Volver vista individual a render sin gráfico si falla lifecycle; no reintroducir listeners globales sin limpieza.','Bajo',3,2);
add(55,'Reducir carga inicial y configurar caché de assets',[33],3,[12,20],'FE',[54],
'Medir móvil con configuración estable y mapa de imports || Diferir Chart y funciones administrativas; retirar CSS duplicado || Configurar caché de assets con hash y compresión en borde manteniendo HTML/datos privados sin caché',
'Bundle inicial gzip disminuye al menos 20% respecto a 301616 bytes o se justifica nuevo presupuesto medido || Navegación crítica funciona y no se cachean respuestas con datos personales',
'Q-BUILD y Q-PERF con mismo escenario; Q-HEADERS para compresión/caché.',
'Desplegar assets anteriores junto a HTML compatible; conservar archivos de ambas versiones durante transición.','Medio',3,3);
add(56,'Obtener escaneo vigente y mapa de actualización',[34],3,[8,16],'OPS',[3,31],
'Obtener autorización explícita para enviar metadata a npm o informe equivalente aprobado || Separar runtime/dev, alcanzabilidad y deprecaciones || Seleccionar versiones soportadas con documentación actual y lista de cambios; priorizar vulnerabilidades explotables si aparecen',
'Inventario completo tiene fecha de escaneo y decisión por alerta || Resultado bloqueado no se interpreta como cero; críticas/altas nuevas escalan a F1 sin esperar F3',
'Q-AUDIT; cotejar lock y SBOM con artefacto final. No usar audit fix automático.',
'No cambia runtime por sí sola; conservar informe y suspender actualizaciones no probadas.','Bajo',3,4);
add(57,'Preparar sustitución de BootstrapVue y compat',[34],3,[16,24],'FE',[56],
'Inventariar componentes/directivas globales, dependencias transitorias y usos CSS || Elegir alternativa mantenida y crear adaptadores mínimos en rama || Portar un componente representativo y fijar contratos de interacción',
'Matriz de reemplazo cubre los 11 archivos con b-* detectados y usos indirectos || Prototipo conserva teclado, estilo y pruebas sin agregar otra capa permanente',
'Q-UI y Q-A11Y del prototipo; revisión del lock y licencia candidata.',
'Retirar prototipo aislado sin actualizar dependencias de producción; conservar pruebas de contrato.','Medio',3,3);
add(58,'Migrar navegación y componentes compartidos',[34],3,[16,24],'FE',[57,52],
'Migrar navbar, entities-menu y adaptadores comunes || Reemplazar directivas/global plugins equivalentes || Probar navegación con roles y modales accesibles',
'Componentes comunes no requieren BootstrapVue || Menús, foco y rutas conservan matriz de permisos',
'Q-UI y Q-A11Y: navbar, menú entidades y adaptadores.',
'Revertir lote común con lock compatible si no reabre vulnerabilidad; mantener contenciones previas.','Medio',3,3);
add(59,'Migrar componentes administrativos y de entidades',[34],3,[16,24],'FE',[58,42],
'Migrar user-management, address, invoice, meter y person con b-* || Conservar contratos validados y mensajes de error || Verificar tablas, edición y formularios sobre componentes del router',
'Los nueve archivos administrativos/entidades inventariados dejan de requerir b-* || Crear/editar/listar conserva reglas financieras, paginación y accesibilidad',
'Q-UI: viaje por entidad con rol autorizado y negativos; snapshot visual de tabla y modal.',
'Revertir lote de componentes y lock probado sin revertir reglas backend; feature flag de pantalla si es necesario.','Alto',3,4);
add(60,'Migrar login y estilos públicos dependientes',[34],3,[16,24],'FE',[58,25],
'Migrar login-form y estilos derivados de Bootstrap/Bootswatch || Revisar registro, activación, recuperación y páginas públicas para dependencias indirectas || Validar tamaños móviles y compatibilidad de navegadores acordados',
'Login y páginas públicas no dependen del runtime Vue 2 || Flujos de acceso corregidos y estilos esenciales pasan regresión',
'Q-UI y Q-A11Y: login/alta/reset en móvil y escritorio.',
'Restaurar lote UI probado conservando API segura; no restaurar textos de contraseña telefónica.','Medio',3,4);
add(61,'Retirar compat y dependencias obsoletas del runtime',[34,33],3,[12,20],'FE',[59,60,55],
'Eliminar @vue/compat, BootstrapVue, Bootstrap/Bootswatch 4 si matriz confirma sustitución || Regenerar lock de forma controlada y explicar dependencias transitivas restantes || Ejecutar build/regresión y escaneo final del árbol distribuido',
'Runtime distribuido no incluye Vue 2/Bootstrap 4/BootstrapVue retirados || Dependencia deprecated restante tiene eliminación o sustitución aprobada y prueba; escaneo vigente sin altas alcanzables sin resolver',
'Q-BUILD, Q-UI, Q-AUDIT y árbol de dependencias antes/después.',
'Volver al último lote compatible solo si no reintroduce vulnerabilidad bloqueante; en ese caso desactivar función afectada y corregir hacia adelante.','Alto',3,4);
add(62,'Validar inventario de datos, finalidades y proveedores',[39,40,41],3,[8,16],'BE',[3,23,28],
'Contrastar proveedor real, región, canal y contrato con responsable de datos || Definir base aplicable por finalidad y evidencia de autorizaciones físicas existentes || Acordar retención, atención de derechos y plazos con asesor competente',
'Matriz de tratamientos/proveedores tiene responsable y evidencia || Decisiones legales pendientes quedan identificadas, no se sustituye validación por una casilla',
'Q-DOC: revisión de contratos y operaciones por responsable; fuentes oficiales actualizadas al ejecutar.',
'No publicar afirmaciones no verificadas; conservar inventario versionado y escalar falta de evidencia.','Medio',3,4);
add(63,'Publicar política coherente con la operación comprobada',[39],3,[8,12],'FE',[62,29,32,35],
'Corregir pagos Bold, sesiones, bcrypt y límites reales || Describir proveedores/residencia/backups solo con evidencia || Versionar política y coordinar aviso de cambios con responsable',
'Cada afirmación de control/proveedor corresponde a evidencia operativa || Texto aprobado, versión/fecha visible y canales de derechos probados',
'Q-DOC y Q-UI: comparación de texto y matriz de tratamientos.',
'Publicar corrección aprobada y conservar versiones anteriores como evidencia; no volver a afirmaciones falsas.','Medio',3,4);
add(64,'Guardar evidencia de autorización cuando corresponda',[40],3,[12,20],'BE',[62,15],
'Modelar titular, finalidad, versión, instante, canal y referencia a evidencia || Crear API con identidad verificada y reglas de integridad || Separar tratamientos opcionales de acceso necesario; registrar revocación',
'Autorización aplicable puede consultarse y vincularse a texto/version exactos || Otra cuenta no lee ni modifica evidencia; revocación conserva trazabilidad mínima aprobada',
'Q-API y Q-DB: permisos, repetición, versión nueva y revocación.',
'Pausar nuevas finalidades opcionales; conservar evidencia ya registrada y usar canal manual validado.','Alto',3,4);
add(65,'Completar consentimiento y atención de derechos en UI',[40],3,[12,20],'FE',[64,63],
'Conectar acciones de aceptación/revocación a API y quitar casilla sin efecto probatorio || Ofrecer acceso al texto aplicable y confirmación clara || Ensayar solicitud de acceso/corrección/supresión por canal aprobado sin prometer eliminación automática indebida',
'Decisión persiste y vuelve a mostrarse al recargar || Usuario puede ejercer derechos por flujo documentado con número de seguimiento',
'Q-UI y Q-DOC: auditoría de evidencia de una solicitud sintética de principio a fin.',
'Mantener tratamiento opcional deshabilitado y canal manual; no asumir consentimiento por uso continuado.','Medio',3,4);
add(66,'Aplicar purga por retención sin romper sesiones ni idempotencia',[41],3,[12,20],'BE',[62,15,8],
'Definir elegibilidad de sesiones revocadas/expiradas y datos operativos con ventanas aprobadas || Implementar dry-run, lotes acotados y métricas sin PII || Preservar hashes anti-replay mientras sesión sea válida y claves de operación durante horizonte offline/reintento',
'Dry-run concilia conteos y purga solo registros elegibles || Refresh replay y sincronización offline siguen protegidos; política pública refleja retención real',
'Q-API y Q-DB: límites temporales, sesión activa, legal hold y corrida repetida.',
'Detener job; datos borrados no se recuperan por rollback de código. Restauración selectiva solo autorizada y sin reactivar sesiones expiradas.','Alto',3,4);
add(67,'Normalizar formato en cambio separado',[44],3,[8,16],'BE',[36],
'Acordar finales de línea y exclusiones de artefactos || Aplicar formato por lotes con diff sin cambios funcionales || Rebasar ramas activas de manera coordinada antes de continuar',
'Errores prettier/CRLF desaparecen en áreas de entrega || Revisión del diff confirma ausencia de cambios de lógica',
'Q-LINT y Q-UNIT; cotejo de cambios semánticos separado de formato.',
'Revertir solo commit de formato en rama de implementación; no descartar correcciones mezcladas.','Bajo',5,2);
add(68,'Resolver reglas semánticas y añadir tipos Vue a CI',[44],3,[12,20],'FE',[67,61],
'Corregir unused/require-await/no-empty y reglas Vue con motivo || Incorporar vue-tsc compatible como dependencia de desarrollo autorizada || Hacer lint sin autofix y tipos obligatorios en CI, excluyendo reportes y generados',
'Lint cliente/servidor tiene cero errores y advertencias justificadas con propietario || CI falla ante error de tipos Vue sembrado en rama de prueba',
'Q-LINT, Q-TYPE y Q-CI; no usar npm test raíz como evidencia.',
'Retirar solo regla nueva mal calibrada con incidencia y fecha de cierre; conservar comprobaciones de seguridad existentes.','Medio',4,3);
add(69,'Conectar métricas, alertas y correlación operativa',[42],3,[12,20],'OPS',[35,28,49],
'Exponer métricas por red interna/autenticación y corregir target de Prometheus || Propagar ID de correlación y duración sin secretos ni PII innecesaria || Crear alertas de pago no conciliado, backlog/cron y DB con procedimiento de respuesta',
'Scrape válido y métricas de requests/job/pagos se actualizan || Alerta sintética llega a canal acordado y operador ejecuta runbook',
'Q-METRICS: scrape, simulación controlada de alerta y revisión de logs.',
'Desactivar regla ruidosa manteniendo chequeo manual; no exponer endpoint ni retirar diagnóstico esencial.','Medio',3,4);
add(70,'Hacer obligatoria la regresión completa y cerrar F3',[43],3,[12,20],'QA',[36,68,69,61,65,66,53,52,39,40,41,42,44,45,46,50],
'Integrar suites HTTP/navegador, accesibilidad y presupuestos en CI || Medir cobertura de ramas de módulos críticos y eliminar expectativas de 500 para flujo implementado || Reauditar F3 y archivar evidencia por tarea/commit',
'CI bloquea regresiones críticas con servicios descartables y cero secretos reales || Criterios de F3 y métricas acordadas pasan o hay no-go documentado',
'Q-CI, Q-API, Q-UI, Q-A11Y, Q-PERF y Q-AUDIT vigentes.',
'Bloquear promoción sin deshabilitar pruebas para obtener verde; corregir caso o implementación con revisión.','Medio',3,4);
add(71,'Incluir recursos públicos en el artefacto',[31],4,[4,8],'FE',[61],
'Definir publicDir/copia explícita para robots, manifest e iconos || Verificar ambas modalidades de build admitidas || Añadir smoke de URLs y tipos MIME desde imagen final',
'robots.txt y manifest.webapp existen en build y responden sin fallback HTML || Referencias a iconos resuelven y robots no sustituye permisos',
'Q-BUILD y Q-SEO: petición HTTP y comparación con artefacto.',
'Revertir regla de copia aislada manteniendo referencias coherentes de HTML.','Bajo',4,2);
add(72,'Completar metadatos públicos y comportamiento 404',[32],4,[12,20],'FE',[71],
'Acordar dominio canónico y páginas indexables con negocio || Implementar títulos/descripciones/OG/canonical y sitemap, datos estructurados solo si aplican || Probar contenido visible a crawler y 404; limitar prerender a páginas públicas si es necesario',
'Inicio/noticias/política muestran metadatos aprobados y sitemap coherente || Rutas inexistentes no simulan páginas válidas; contenido privado permanece protegido',
'Q-SEO: HTML recibido por crawler, enlaces y códigos de respuesta en staging.',
'Volver metadatos estáticos correctos y retirar sitemap defectuoso; no indexar contenido privado.','Medio',3,2);
add(73,'Resolver licencia del producto y atribuciones',[35],4,[8,16],'OPS',[61,56],
'Obtener decisión del titular sobre licencia propia sin inferirla del servidor || Conciliar licencias del artefacto distribuido, assets y herramientas || Publicar LICENSE/avisos y obligaciones aprobadas según distribución',
'Manifestos del producto son coherentes y avisos corresponden a dependencias entregadas || Entradas LGPL/CC-BY y sin metadata tienen revisión documentada, no declaración genérica de incompatibilidad',
'Q-DOC y revisión de SBOM/avisos por responsable legal.',
'Retirar distribución de componente cuestionado hasta resolver derechos; conservar historial de avisos.','Medio',3,3);
add(74,'Documentar operación, API y onboarding comprobados',[45],4,[12,20],'BE',[70,32,63],
'Reescribir README en español con comandos reales y variables sin valores || Mantener OpenAPI de invitación, facturación y administración conforme al contrato || Ensayar instalación limpia, rotación, conciliación y rollback con persona distinta',
'Operador nuevo completa checklist desde documentación sin instrucciones verbales || No hay secretos por defecto, comandos inexistentes ni promesas de migración automática',
'Q-DOC: acta de onboarding independiente y validación OpenAPI contra rutas.',
'Corregir documentación conservando versiones; publicar aviso si una instrucción anterior era insegura.','Bajo',4,3);
add(75,'Retirar implementaciones no montadas y duplicación acotada',[46],4,[8,16],'FE',[61,70],
'Confirmar referencias estáticas/dinámicas de .component.ts alternativos || Retirar archivos sin consumidores en commit propio || Extraer solo un composable/layout repetido y dirigir pruebas a componentes reales',
'Ningún import o ruta queda roto y tests ejercitan componentes montados || Se elimina simulación obsoleta sin alterar pagos reales',
'Q-BUILD, Q-TYPE, Q-UI y grafo de imports antes/después.',
'Restaurar archivo necesario desde commit sin reintroducir ruta de simulación activa; mantener prueba que reveló dependencia.','Bajo',3,2);
add(76,'Reauditar el cierre completo de hallazgos',[43],4,[12,20],'QA',[70,71,72,73,74,75,37,17,18,26,16,15,10,12,13,33,34,54,56],
'Revisar cada uno de los 47 IDs contra criterio y evidencia de cierre || Repetir escaneo vigente, regresión, restore y controles desplegados según paquetes ya creados || Emitir resultado final con riesgos residuales, excepciones firmadas si surgieran y responsables',
'47/47 IDs tienen corrección verificada o decisión formal posterior con caducidad || Ninguna tarea se cierra solo por merge ni quedan críticas/altas técnicas sin resolver',
'Q-CIERRE: matriz firmada y evidencia por release; muestreo adversarial de identidad, pagos y sesiones.',
'Reabrir hallazgo fallido y bloquear aprobación de operación; no borrar evidencia previa.','Medio',3,4);
add(77,'Ensayar recuperación y respuesta a incidentes trimestral',[42],4,[12,20],'OPS',[76],
'Simular caída de DB o proveedor y restauración en entorno aislado || Medir detección, respuesta, recuperación y conciliación de pagos || Actualizar runbook y programar revisión trimestral con dueño y sustituto',
'Primer simulacro completa objetivos RPO/RTO acordados o genera acción correctiva || Calendario y responsable quedan definidos; recurrencias no están contratadas ni automatizadas en este encargo',
'Q-RESTORE y Q-METRICS: acta con tiempos y conciliación; no ejecutar fallos en producción.',
'Interrumpir ensayo si afecta servicio real; conservar evidencia y corregir aislamiento antes de repetir.','Medio',3,4);
// La integración y el navegador mínimos deben existir antes de verificar F1.
const harness=tasks.find(t=>t.id==='T-014');
harness.phase=1;
harness.steps.push('Preparar runner mínimo de navegador HTTPS para cookies/chat y fixtures de cuentas; T-036 ampliará los viajes completos');
for(const n of [5,6,7,8,9,10,11,12,13])tasks.find(t=>t.id===`T-${String(n).padStart(3,'0')}`).deps.push('T-014');
tasks.find(t=>t.id==='T-001').steps.push('Si la aplicación está operando, acordar contención operativa temporal del portal/checkout expuesto mientras se preparan parches; no esperar semanas sin limitar el riesgo');
module.exports={tasks};
