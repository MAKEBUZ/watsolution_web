# Plan de remediación

Cada ID se cuenta una sola vez. Esfuerzo Bajo: hasta 1–2 jornadas orientativas; Medio: 3–8; Alto: más de 8 o coordinación de varias áreas. No son cotizaciones; validar con el equipo. No se aplicó ninguna corrección.

## Inmediato (0–7 días)

| ID | Trabajo concreto | Dependencias | Esfuerzo |
|---|---|---|---|
| WS-001 | Pasar exclusivamente req.user.id y buscar por una relación de propietario inequívoca. Retirar alternativas por login/email, migrar vínculos ambiguos con revisión humana y probar dos cuentas activas con IDs y logins distintos. | WS-015 para migración definitiva; bloqueo de acceso primero | Medio |
| WS-002 | Actualizar únicamente pdfUrl con UPDATE por ID, sin guardar el objeto leído; separar estado financiero de metadatos. Añadir prueba de concurrencia sobre PostgreSQL para PDF y webhook. | Sin dependencia; coordinar WS-005/008 | Bajo |
| WS-003 | Rotar credenciales históricas de PostgreSQL y claves de firma que pudieran seguir en uso; revisar sesiones y accesos; después coordinar saneamiento del historial y escaneo preventivo. No reutilizar los valores expuestos. | Inventario de entornos y propietarios de credenciales | Medio |
| WS-004 | Implementar invitación/activación verificadas con token de uso único, expiración, envío y establecimiento de contraseña; recuperación pública con respuesta neutra, límites y revocación. Alinear textos y retirar rutas de éxito ficticio. | WS-003/009 y canal de correo seguro | Alto |
| WS-005 | Crear/reutilizar la referencia dentro de una transacción con bloqueo, o mediante asignación condicional atómica; persistir intentos de pago y tratar referencias desconocidas con conciliación y alerta. | WS-016 para restricciones definitivas | Medio |
| WS-006 | Vaciar mensajes, entrada y estado al cambiar ID de sesión; cancelar solicitudes o descartar respuestas de otra generación. Desmontar el componente al salir y probar admin → logout → usuario en la misma SPA. | Sin dependencia | Bajo |
| WS-007 | Permitir cerrar la sesión identificada por refresh con verificación de origen, borrar siempre la cookie y revocar la familia; esperar confirmación o explicar un fallo de revocación. Probar JWT vencido, red fallida y varias pestañas. | Pruebas de transporte web y sesión | Medio |
| WS-008 | Unificar escritura en servicios de dominio: generar desde lectura confirmada, bloquear importes y referencias tras iniciar pago, registrar pagos manuales con motivo y soporte, y realizar correcciones mediante eventos auditables. | WS-010/016/021; conciliar datos existentes | Alto |
| WS-009 | Excluir cuentas de ejemplo de entornos reales y provisionar el administrador por canal seguro. Consultar en un entorno autorizado si existen cuentas sembradas, desactivarlas y rotarlas si procede. | WS-003; confirmar cuentas en entorno autorizado | Bajo |
| WS-014 | Sustituir synchronize histórico por una línea base controlada y migraciones SQL explícitas; comprobar restauración y ejecutar en staging antes de producción. Documentar cuál runner es válido para cada versión. | Backup restaurado y revisión de esquema | Alto |

## Corto plazo (1–4 semanas)

| ID | Trabajo concreto | Dependencias | Esfuerzo |
|---|---|---|---|
| WS-010 | Usar DTO separados para alta y edición con IsNumber, Min, IsEnum, IsDateString, longitudes y validación anidada; activar whitelist y rechazo de extras tras adaptar contratos; mapear campos explícitos. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-011 | Reemplazar v-html por interpolación de texto o componentes i18n; limitar formato de login en servidor y escapar parámetros. Añadir prueba que muestre literalmente una cadena con etiquetas. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-012 | Definir políticas en el punto que entrega HTML y API: CSP compatible con Bold, bloqueo de framing, no-sniff y política de permisos; activar HSTS solo tras confirmar HTTPS integral. Validar cabeceras en staging. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-013 | Combinar límites por cuenta, origen y capacidad; aplicar límites al registro y a tareas costosas. Usar compare asíncrono y métricas de latencia/rechazos, sin permitir bloqueo indefinido de cuentas. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-015 | Normalizar la relación Person–User, resolver duplicados y añadir FK e índices mediante migración explícita. Definir reglas de borrado/retención de datos financieros y de sesiones. | WS-001, resolver vínculos ambiguos | Alto |
| WS-016 | Definir unicidad según reglas de negocio y crear índices para invoice(personId,issue_date), meter(personId,reading_date,id) y auth_session(userId); medir EXPLAIN en datos representativos antes de ajustar. | Depurar duplicados y acordar reglas de negocio | Medio |
| WS-017 | Usar una transacción común para las tres escrituras y restricciones de unicidad; devolver conflictos de negocio controlados. Probar documento duplicado y fallo tras crear cuenta. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-018 | Definir métricas con negocio; agregar diferencias o consumos facturados, y guardar fecha/evento de pago para recaudo. Añadir ejemplos con lecturas acumulativas y facturas pagadas en otro mes. | Definición de consumo/recaudo y fecha de pago | Medio |
| WS-019 | Crear evento de factura emitida dentro de la transacción y entregarlo mediante outbox; reutilizar el mismo flujo para toda emisión, con prueba de creación y entrega. | WS-008, evento transaccional | Medio |
| WS-020 | Persistir eventos únicos por factura/tipo/fecha, coordinar trabajadores, recuperar ventanas no procesadas y fijar America/Bogota donde corresponda. | Outbox y clave idempotente | Medio |
| WS-021 | Usar ParseIntPipe y hacer del ID de ruta la autoridad; rechazar discrepancias, comprobar existencia y devolver 404/409 adecuados. Separar create de update. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-023 | Calcular totalPages=Math.ceil(total/size), usar max(0,totalPages-1) y emitir next solo si queda otra página. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-024 | Implementar búsqueda y paginación en servidor, propagar total/cursor y mostrar estado vacío diferente de error. Cancelar solicitudes viejas para evitar sobrescritura de resultados. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-025 | Conectar actividad a la API existente; separar demo y producción y etiquetar claramente cualquier simulación. Integrar telemetría autenticada y mostrar antigüedad/calidad del dato. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-027 | Publicar matriz de permisos única y alinear rutas, menús y API; incluir explícitamente roles permitidos por operación y probar cuentas con solo USER, ADMIN y OPERATOR. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-031 | Definir publicDir estable o copia explícita de robots, manifest e iconos; verificar URLs contra el artefacto generado y no solo contra el árbol fuente. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-032 | Definir metadatos reales por ruta pública y canonical; generar sitemap y decidir prerenderizado según necesidades. Mantener contenido privado fuera de indexación sin confundir robots con control de acceso. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-037 | Añadir proxy Socket.IO con Upgrade/Connection y timeouts adecuados o configurar un origen WebSocket explícito; probar handshake y reconexión en la topología Railway real. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-038 | Documentar variables requeridas y pasarlas explícitamente por mecanismos de secretos; diferenciar compose local de producción, persistencia y autenticación. Añadir comprobación de configuración al inicio y smoke test. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-039 | Reconciliar política con inventario real y evidencia operativa, incluir Bold y recursos de terceros, y evitar asegurar residencia, cifrado o backups sin verificación. Validar el texto con el responsable de datos. | Inventario operativo y responsable de datos | Medio |
| WS-042 | Implementar readiness/liveness separados, métricas autenticadas o internas y scraping real; correlacionar solicitudes y registrar duración/resultado. Definir alertas para pagos sin conciliar, DB y cron. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-043 | Añadir integración aislada PostgreSQL y E2E de alta/activación, permisos entre cuentas, refresh/logout, pagos/PDF y roles; ejecutarlos en CI con servicios desechables y sin secretos reales. | Entorno PostgreSQL aislado | Alto |
| WS-044 | Normalizar formato en una tarea separada, resolver errores semánticos y habilitar lint y vue-tsc --noEmit en CI. Mantener controles sin autofix durante auditorías. | Normalización CRLF separada | Medio |
| WS-045 | Escribir guía en español con variables sin valores, topologías admitidas, preparación/migración explícita, pruebas, rotación, rollback y RPO/RTO acordados; mantener contrato OpenAPI acorde al código. | Topología y flujos aprobados | Medio |
| WS-047 | Tratar fechas de calendario sin conversión UTC y definir hora/zona de vencimiento con negocio; usar el mismo criterio en frontend/backend y probar límites de medianoche. | Coordinar con contratos y pruebas del módulo | Medio |

## Mediano plazo (1–3 meses)

| ID | Trabajo concreto | Dependencias | Esfuerzo |
|---|---|---|---|
| WS-022 | Acotar size/page y sort; paginar usuarios y noticias; sustituir consultas N+1 por joins o consultas agregadas con índices. Añadir presupuestos de consultas y límites medidos. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-026 | Registrar efectos en onMounted y retirarlos en onUnmounted; destruir Chart y cancelar solicitudes. Probar entrar/salir repetidamente con contador de listeners. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-028 | Asignar ID único y for, conectar ayuda/errores con aria-describedby, y comprobar nombres accesibles con tecnologías asistivas. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-029 | Usar componente modal accesible o implementar semántica, foco inicial, Escape, contención y retorno de foco; probar apertura/cierre solo con teclado. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-030 | Añadir nombre y resumen accesibles y tabla de los mismos datos; no depender únicamente del color para estados y series. | Coordinar con contratos y pruebas del módulo | Bajo |
| WS-033 | Medir ruta crítica en móvil y dividir gráficos/administración; reducir convivencia de frameworks y CSS. Configurar caché de assets con hash y compresión verificadas en proxy/CDN. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-034 | Planificar migración desde BootstrapVue/compat y revisar cadenas transitivas; autorizar un escaneo actualizado y priorizar vulnerabilidades realmente alcanzables, separando runtime y desarrollo. | Permiso para escaneo de dependencia y plan UI | Alto |
| WS-035 | Definir la licencia propia; recopilar textos de licencias y avisos de dependencias distribuidas, distinguiendo herramientas y enlaces de workspace. Revisar obligaciones según forma de distribución con asesoría competente. | Coordinar con contratos y pruebas del módulo | Medio |
| WS-036 | Construir desde lock con npm ci y contexto de workspaces coherente; unificar runtime soportado, imágenes fijadas y usuario sin privilegios; comprobar build/test del contenedor final en CI. | Resolver requisitos Node y lock | Medio |
| WS-040 | Definir con el responsable la base jurídica por finalidad y conservar prueba cuando aplique (versión, titular, instante y canal); incluir flujo de revocación y atención. Separar autenticación de tratamientos opcionales. | Base jurídica y versión de política | Medio |
| WS-041 | Implementar retención y purga verificables de sesiones, operaciones y datos personales conforme a finalidad/legalidad; registrar ejecución sin secretos y corregir la promesa pública si la retención es distinta. | Política de retención aprobada | Medio |
| WS-046 | Identificar referencias con el grafo de imports, retirar código obsoleto en un cambio aparte y extraer layouts/composables comunes. Asegurar que pruebas importen componentes montados por el router. | Coordinar con contratos y pruebas del módulo | Medio |

## Largo plazo

- Ejercitar restauración y respuesta a incidentes periódicamente con RPO/RTO acordados; registrar evidencia de restauración, no solo existencia del backup.
- Revisar matriz de permisos, proveedores y retención al cambiar requisitos; ampliar auditoría de accesibilidad con usuarios y navegadores reales.
- Medir SLO y capacidad con datos representativos; evolucionar jobs/outbox y separar servicios solo si las mediciones lo justifican.

## Criterios de aceptación de los bloqueos prioritarios

1. WS-001: dos cuentas activas, incluida una con login numérico coincidente con otro ID, nunca intercambian perfil/facturas; probar HTTP real.
2. WS-002/005/008: pago y PDF concurrentes preservan PAID/transactionId; referencias Bold concurrentes son estables y conciliables; cambios manuales quedan auditados.
3. WS-003/009: evidencia de rotación y retiro de cuentas por defecto; sin imprimir secretos en tickets ni logs.
4. WS-004: nuevo suscriptor recibe invitación, establece contraseña, entra y puede recuperarla sin sesión previa.
5. WS-006/007: logout con JWT vencido, varias pestañas y cambio admin→usuario no restaura sesión ni muestra mensajes previos.
6. WS-014/016/043: migración revisada en PostgreSQL descartable, restore probado y E2E con guardas reales aprobados.

## Validación común

Para cada corrección: reproducir caso fallido, prueba positiva/negativa, revisión de impacto en datos y actualización de contrato/documentación. No ejecutar migraciones en producción sin respaldo/restauración y revisión del destino. Reabrir el análisis si cambian archivos respecto de evidencias/inventario-inicial.json.
