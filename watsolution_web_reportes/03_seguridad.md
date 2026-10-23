# Seguridad

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Se revisaron autenticación, autorización por rol y registro, cookies, JWT, contraseñas, controles de entrada, SQL, archivos, integraciones y configuración HTTP. Hay mejoras claras: firma HS256 con issuer/audience, secreto obligatorio de al menos 32 bytes, acceso de 15 minutos, refresh aleatorio almacenado como hash y rotación con bloqueo, sesión/activación consultadas en BD y revocación al cambiar contraseña. Cookie __Host- con HttpOnly/Secure/SameSite=Strict y comprobación de Origin en transporte web.

El guard de propiedad protege lecturas de personas, lecturas, facturas y Bold; no compensa el endpoint de portal WS-001. Las rutas públicas son registro, login, refresh con prueba propia, noticias públicas, webhook con firma, management/info y superficies Swagger/Socket.IO. No se detectó MFA implementado.

| Control | Resultado y límite |
|---|---|
| Acceso roto / IDOR | WS-001; controles por propietario presentes en CRUD de lectura |
| Criptografía / secretos | bcrypt y firmas presentes; secretos históricos WS-003 y semilla WS-009 |
| Inyección SQL/NoSQL/comandos | SQL de entrada usa parámetros en servicios revisados; interpolaciones de migración usan listas constantes. No se confirmó SQLi. No hay driver NoSQL ni ejecución de comandos desde endpoints detectada |
| XSS | WS-011; el resto de v-html detectado usa traducciones. innerHTML en Bold se usa para vaciar, no insertar datos recibidos |
| CSRF | Mutaciones normales usan Bearer en memoria; refresh web valida Origin y cookie strict. No se probó navegador/entorno desplegado |
| SSRF / redirección / traversal | S3 endpoint proviene de configuración; no hay fetch de URL arbitraria del usuario identificado. Claves PDF/QR generadas por servidor; PDFURL editable por ADMIN requiere endurecimiento del CRUD. No se confirmó explotación |
| XXE / deserialización | Sin parser XML de usuario identificado en backend; JMX y web.xml son configuración, no superficies de entrada web |
| Subida de archivos | No se halló endpoint multipart de subida por usuario; backend genera buffers PDF/QR para S3. ACL/cifrado bucket No verificados |
| Configuración insegura | WS-012, WS-036–038; Swagger se configura incondicionalmente en main.ts:48 |
| Componentes vulnerables | Lock analizado; npm audit sin resultado válido, no se reporta cero vulnerabilidades |
| Identidad y autenticación | WS-004, WS-007, WS-013; sin recuperación funcional ni MFA observado |
| Integridad y diseño | WS-002, WS-005, WS-008: ciclo financiero parcialmente centralizado |
| Logging / monitoreo | Interceptor registra ruta, no cuerpos/headers; WS-019–020, WS-042 y logs de login de PortalService aún requieren minimización |

Historial: 66 commits locales alcanzables; escaneo heurístico de 427 blobs candidatos. Los 100 matches son candidatos, **no 100 secretos**. Se confirmaron credenciales incrustadas en URLs y una clave JWT literal mediante validación local sin registrar sus valores. Archivos .env vigentes: ninguno en el inventario actual. Objetos inaccesibles, remotos no descargados y validez de credenciales: No verificados.

### [WS-001] El portal confunde el login con el propietario y permite cruzar cuentas
- **Categoría:** Seguridad
- **Severidad:** Alta
- **Ubicación:** server/src/service/portal.service.ts:25
- **Evidencia:**

```text
25:   async getPortalData(userLogin: string): Promise<PortalDataDTO> {
26:     this.logger.log(`getPortalData for login: ${userLogin}`);
27: 
28:     const person = await this.personRepository.findOne({
29:       relations: { address: true },
30:       where: [{ userId: userLogin }, { email: userLogin }],
31:     });
```

Reproducido con repositorios simulados: evidencias/probes-resultados.json, primer caso; cuenta 99/login 42 selecciona propietario 42.

- **Impacto:** El controlador pasa req.user.login (portal.controller.ts:24), pero person.userId contiene el ID convertido a texto (person.controller.ts:127). Una cuenta activada con login numérico igual al ID de otra cuenta puede obtener su perfil y facturas. La alternativa por email también es ambigua. No se probó acceso a datos reales.
- **Recomendación:** Pasar exclusivamente req.user.id y buscar por una relación de propietario inequívoca. Retirar alternativas por login/email, migrar vínculos ambiguos con revisión humana y probar dos cuentas activas con IDs y logins distintos.
- **Esfuerzo estimado:** Medio

### [WS-003] Credenciales de base de datos y clave JWT permanecen en Git
- **Categoría:** Seguridad
- **Severidad:** Alta
- **Ubicación:** watsolution_web_reportes/evidencias/secretos-historicos-validacion.json:1
- **Evidencia:**

```text
1: [
2:   {
3:     "key": "DATABASE_PUBLIC_URL",
4:     "line": 3,
5:     "masked": "[ENMASCARADO]",
6:     "literalNonempty": true,
7:     "hasEmbeddedPassword": true
8:   },
```

Evidencia Git: blob 95cd0a65f6fe9966ccb5c9974c450610c0c7a624, server/.env:3,4,7; blob 0ea385d4830c10025e3e6e4a74d9abf8c37e7b97, server/src/config/application.yml:53. Valores: [ENMASCARADO]. No se intentó utilizarlos.

- **Impacto:** Un blob histórico de server/.env incluye URLs con contraseña y POSTGRES_PASSWORD literales. Otro contiene un secreto JWT base64 literal de 128 bytes decodificados. Borrar el archivo actual no elimina el historial. Su vigencia y acceso al repositorio remoto no se verificaron.
- **Recomendación:** Rotar credenciales históricas de PostgreSQL y claves de firma que pudieran seguir en uso; revisar sesiones y accesos; después coordinar saneamiento del historial y escaneo preventivo. No reutilizar los valores expuestos.
- **Esfuerzo estimado:** Medio

### [WS-006] El historial del chatbot sobrevive al cambio de usuario
- **Categoría:** Seguridad / privacidad
- **Severidad:** Alta
- **Ubicación:** client/src/app/core/chatbot/chatbot.vue:26
- **Evidencia:**

```text
26: const messages = ref<Msg[]>([])
27: 
28: const hidden = computed(() =>
29:   !authenticated?.value || route.path.startsWith('/pagos'),
30: )
31: 
32: const toggle = () => {
33:   if (!open.value && messages.value.length === 0) {
34:     messages.value.push({ role: 'bot', text: welcomeMsg.value })
35:   }
```

Revisión estática del ciclo de vida completo; escenario de navegador no ejecutado.

- **Impacto:** App monta ChatBot permanentemente (app.vue:8). El logout solo lo oculta mediante hidden; messages no se limpia ni se vincula a la identidad. En el mismo navegador, la siguiente cuenta puede ver cédulas y resúmenes consultados por la anterior. Una respuesta en vuelo también puede agregarse tras el cambio.
- **Recomendación:** Vaciar mensajes, entrada y estado al cambiar ID de sesión; cancelar solicitudes o descartar respuestas de otra generación. Desmontar el componente al salir y probar admin → logout → usuario en la misma SPA.
- **Esfuerzo estimado:** Bajo

### [WS-007] Salir con el JWT vencido no revoca la cookie de renovación
- **Categoría:** Seguridad / sesiones
- **Severidad:** Alta
- **Ubicación:** client/src/app/shared/config/store/account-store.ts:37
- **Evidencia:**

```text
37:     logout() {
38:       const currentToken = getAccessToken();
39:       if (currentToken) void axios.create().post(`${SERVER_API_URL}api/session/logout`, {}, { withCredentials: true, headers: { Authorization: `Bearer ${currentToken}` } }).catch(() => {});
40:       setAccessToken(null);
41:       this.userIdentity = null;
42:       this.authenticated = false;
43:       this.logon = null;
44:       localStorage.removeItem('jhi-authenticationToken');
45:       sessionStorage.removeItem('jhi-authenticationToken');
```

Deducido del flujo de guardas y cookie; no se conectó a una sesión real.

- **Impacto:** El logout usa una instancia axios sin renovación y descarta el error. El backend exige AuthGuard antes de revocar y borrar cookie (session.controller.ts:22–26). Tras 15 minutos de inactividad el JWT puede expirar: el usuario ve salida, pero la cookie HttpOnly de siete días sigue válida y puede restaurar la cuenta al recargar.
- **Recomendación:** Permitir cerrar la sesión identificada por refresh con verificación de origen, borrar siempre la cookie y revocar la familia; esperar confirmación o explicar un fallo de revocación. Probar JWT vencido, red fallida y varias pestañas.
- **Esfuerzo estimado:** Medio

### [WS-009] La migración histórica siembra cuentas activas con contraseñas fijas
- **Categoría:** Seguridad
- **Severidad:** Alta
- **Ubicación:** server/src/migrations/1570200490072-SeedUsersRoles.ts:37
- **Evidencia:**

```text
37:   user3: User = {
38:     login: 'admin',
39:     password: '[ENMASCARADO]',
40:     firstName: 'Administrator',
41:     lastName: 'Administrator',
42:     email: 'admin@localhost.it',
43:     imageUrl: '',
44:     activated: true,
45:     langKey: 'en',
```

Contraseñas enmascaradas. Líneas 72–78 asignan ROLE_ADMIN a dos cuentas y las persisten.

- **Impacto:** La semilla contiene cuentas privilegiadas activadas y contraseñas literales conocidas en el repositorio. Producción no ejecuta migrationsRun automáticamente actualmente; no se verificó que estas cuentas existan en la BD desplegada. El riesgo aparece si se usó o se reutiliza esa semilla.
- **Recomendación:** Excluir cuentas de ejemplo de entornos reales y provisionar el administrador por canal seguro. Consultar en un entorno autorizado si existen cuentas sembradas, desactivarlas y rotarlas si procede.
- **Esfuerzo estimado:** Bajo

### [WS-011] El nombre de usuario llega sin escape a v-html
- **Categoría:** Seguridad
- **Severidad:** Media
- **Ubicación:** client/src/app/account/settings/settings.vue:4
- **Evidencia:**

```text
4:       <div class="col-md-8 toastify-container">
5:         <h2 v-if="username" id="settings-title">
6:           <span v-html="t$('settings.title', { username: username })"></span>
7:         </h2>
8: 
```

Probe local con vue-i18n instalado conserva <img>. También change-password.vue:6.

- **Impacto:** La traducción inserta username en HTML y la configuración i18n no activa escape de parámetros. El login solo exige ser cadena en UserDTO. Se confirmó que la traducción conserva etiquetas. El alcance demostrado es la propia cuenta; no se demostró ejecución contra otra víctima.
- **Recomendación:** Reemplazar v-html por interpolación de texto o componentes i18n; limitar formato de login en servidor y escapar parámetros. Añadir prueba que muestre literalmente una cadena con etiquetas.
- **Esfuerzo estimado:** Bajo

### [WS-012] La protección HTTP difiere entre Nest y el frontend Nginx
- **Categoría:** Seguridad
- **Severidad:** Media
- **Ubicación:** server/src/main.ts:31
- **Evidencia:**

```text
31:   expressApp.use((req, res, next) => {
32:     res.setHeader('X-Content-Type-Options', 'nosniff');
33:     res.setHeader('Referrer-Policy', 'no-referrer');
34:     res.setHeader('X-Frame-Options', 'DENY');
35:     if (req.path.startsWith('/api/') || req.path === '/' || req.path.endsWith('.html')) {
36:       res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
37:       res.setHeader('Pragma', 'no-cache');
38:     }
```

- **Impacto:** Nest define tres cabeceras, pero no CSP, HSTS ni Permissions-Policy. El Nginx del cliente no añade esas protecciones al HTML. Una inyección tiene menos barreras y la configuración local no garantiza políticas consistentes. Cabeceras del proveedor desplegado: No verificadas.
- **Recomendación:** Definir políticas en el punto que entrega HTML y API: CSP compatible con Bold, bloqueo de framing, no-sniff y política de permisos; activar HSTS solo tras confirmar HTTPS integral. Validar cabeceras en staging.
- **Esfuerzo estimado:** Medio

### [WS-013] Registro sin límites y limitación de login solo por nombre
- **Categoría:** Seguridad / disponibilidad
- **Severidad:** Media
- **Ubicación:** server/src/security/login-rate-limit.service.ts:15
- **Evidencia:**

```text
15:   async consume(login: string) {
16:     const key = createHash('sha256').update(login.trim().toLowerCase()).digest('hex');
17:     const now = Date.now();
18:     // PostgreSQL serializes this UPSERT across replicas; no password or username is stored.
19:     const rows = await this.db.query(
20:       `INSERT INTO auth_rate_limit (key, attempts, expires_at) VALUES ($1, 1, $2)
21:        ON CONFLICT (key) DO UPDATE SET
22:        attempts = CASE WHEN auth_rate_limit.expires_at <= $3 THEN 1 ELSE auth_rate_limit.attempts + 1 END,
23:        expires_at = CASE WHEN auth_rate_limit.expires_at <= $3 THEN $2 ELSE auth_rate_limit.expires_at END
24:        RETURNING attempts`, [key, now + 60000, now]);
```

- **Impacto:** El límite agrega por nombre normalizado, no por origen. Rotar nombres evita el límite global; POST /register no consume esta cuota y realiza bcrypt/escrituras. Además comparePassword usa compareSync (password-util.ts:8–9), bloqueando el hilo durante verificación. No se midió capacidad ni límites del proxy externo.
- **Recomendación:** Combinar límites por cuenta, origen y capacidad; aplicar límites al registro y a tareas costosas. Usar compare asíncrono y métricas de latencia/rechazos, sin permitir bloqueo indefinido de cuentas.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
