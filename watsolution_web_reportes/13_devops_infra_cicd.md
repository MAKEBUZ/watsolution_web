# DevOps, infraestructura y CI/CD

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Topologías disponibles: Docker raíz monolítico, Docker cliente Nginx y Docker servidor separados, configuración Railway por servicio, compose PostgreSQL/desarrollo, Sonar y Prometheus. La CI .github/workflows/security-checks.yml fija acciones por SHA, permissions contents:read, timeout 20 min y persist-credentials:false; instala con npm ci --ignore-scripts y ejecuta audit producción, tsc, Jest, Vitest y build. No se validaron SHAs remotos o ejecuciones GitHub.

Variables detectadas en código, sin sus valores: DATABASE_URL, DATABASE_PUBLIC_URL, JWT_SECRET_BASE64, WEB_ORIGINS, BACKEND_ENV, PORT/NODE_SERVER_PORT, BUCKET_NAME/REGION/ENDPOINT/ACCESS_KEY_ID/SECRET_ACCESS_KEY, BOLD_SECRET_KEY/BOLD_API_KEY, OPENAI_API_KEY, OFFLINE_SIGNING_KEY_BASE64 y variables de migración explícita. Cliente usa BACKEND_URL, PORT y STANDALONE.

No se encontró pipeline de despliegue/rollback, comprobación de backup o restore dentro de este repo. Eso no prueba ausencia en Railway o procedimientos externos. Se debe obtener evidencia de permisos del servicio, secretos CI, TLS, IAM, almacenamiento, retención de logs y RPO/RTO antes de autorizar producción. Permisos Windows locales no sustituyen usuario/permisos del contenedor. Docker y migraciones no fueron ejecutados.

### [WS-036] Las imágenes Docker no reproducen el lock ni unifican Node
- **Categoría:** DevOps
- **Severidad:** Media
- **Ubicación:** Dockerfile:11
- **Evidencia:**

```text
11: COPY . .
12: 
13: RUN npm install
14: RUN npm run --workspace server build
15: RUN npm run --workspace client build
16: RUN npm cache clean --force
17: RUN rm -rf target tmp
18: 
19: ENV NODE_ENV=production
```

- **Impacto:** La raíz excluye package-lock.json del contexto (.dockerignore:2) y usa npm install. Las imágenes separadas tampoco usan el lock raíz. El servidor usa Node 20 y el proyecto exige Node >=22.14 en raíz/cliente, mientras CI usa 24; el resultado validado no representa necesariamente el contenedor. No hay USER no privilegiado explícito.
- **Recomendación:** Construir desde lock con npm ci y contexto de workspaces coherente; unificar runtime soportado, imágenes fijadas y usuario sin privilegios; comprobar build/test del contenedor final en CI.
- **Esfuerzo estimado:** Medio

### [WS-037] El Nginx del cliente no reenvía Socket.IO
- **Categoría:** DevOps / proxy
- **Severidad:** Media
- **Ubicación:** client/nginx.conf:6
- **Evidencia:**

```text
6:     # SPA routing — all unknown paths fall back to index.html
7:     location / {
8:         try_files $uri $uri/ /index.html;
9:     }
10: 
11:     # Proxy API calls to the NestJS backend
12:     location /api/ {
13:         proxy_pass          ${BACKEND_URL}/api/;
14:         proxy_http_version  1.1;
15:         proxy_ssl_server_name on;
```

- **Impacto:** El dashboard conecta /tank con ruta de transporte /socket.io en el origen del cliente. Nginx solo reenvía /api, /management y /v3; /socket.io cae en el fallback SPA sin Upgrade. El despliegue separado pierde telemetría aunque funcione en desarrollo.
- **Recomendación:** Añadir proxy Socket.IO con Upgrade/Connection y timeouts adecuados o configurar un origen WebSocket explícito; probar handshake y reconexión en la topología Railway real.
- **Esfuerzo estimado:** Bajo

### [WS-038] docker/app.yml no aporta la configuración mínima de arranque
- **Categoría:** DevOps / configuración
- **Severidad:** Media
- **Ubicación:** docker/app.yml:3
- **Evidencia:**

```text
3:   app:
4:     build: ..
5:     environment:
6:       - BACKEND_ENV=prod
7:     ports:
8:       - 8080:8080
```

- **Impacto:** Solo pasa BACKEND_ENV=prod; el código requiere JWT_SECRET_BASE64 y DATABASE_URL, y las sesiones web requieren WEB_ORIGINS. Compose no importa automáticamente todas las variables del host al contenedor. El PostgreSQL auxiliar usa trust y carece de volumen explícito; está declarado para desarrollo.
- **Recomendación:** Documentar variables requeridas y pasarlas explícitamente por mecanismos de secretos; diferenciar compose local de producción, persistencia y autenticación. Añadir comprobación de configuración al inicio y smoke test.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
