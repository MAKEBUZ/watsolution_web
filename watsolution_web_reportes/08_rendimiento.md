# Rendimiento

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Compilación local exitosa con Vite, salida redirigida a evidencias/build, sin ejecutar scripts clean. Se conservan inventario de archivos y tamaños gzip. Bundle inicial JS: 924.882 bytes / 301.616 gzip; CSS: 303.485 / 42.673. Artefacto completo: 6.000.396 bytes, 85 archivos, incluyendo varias distribuciones Swagger que no son todas carga inicial.

Rutas diferidas ayudan, pero Chart, BootstrapVue y compat se importan globalmente. CSS main entra a través de global.scss y como import separado en main.ts; revisar duplicación al analizar estilos. Carga externa identificada: Bold bajo demanda e imágenes de i.pravatar.cc. Font stack usa Inter con alternativas; no hay prueba de descarga de fuente remota.

Nginx no especifica compresión/caché de assets en este archivo; reglas globales/CDN desconocidas. YAML declara compresión pero main.ts no la conecta con middleware. Esto no prueba ausencia en el borde. Backend: N+1 y límites WS-022; comparar agregados por lote con consulta secuencial.

Lighthouse, Core Web Vitals, CPU, memoria, concurrencia, carga JMeter y latencia DB: **No verificado**. El JMX se revisó como artefacto histórico y no se ejecutó: incluye escrituras/autenticación y cargas incompatibles con la restricción de solo lectura de datos. No se inventaron métricas de producción.

### [WS-022] Listados admiten tamaños arbitrarios y rutas costosas no paginan
- **Categoría:** Rendimiento / API
- **Severidad:** Media
- **Ubicación:** server/src/domain/base/pagination.entity.ts:38
- **Evidencia:**

```text
38:   public static handleNumberTypes(pp: number | PaginationQueryType, fallback: number): number {
39:     if (typeof pp === 'number') {
40:       return pp;
41:     }
42:     const query = PageRequest.handleQueryType(pp);
43:     if (query) {
44:       const parsed = parseInt(query, 10);
45:       return Number.isNaN(parsed) ? fallback : parsed;
46:     }
```

- **Impacto:** Se aceptan tamaños negativos o enormes y ordenaciones sin lista de campos permitidos. getUsersWithStatus carga todos los usuarios y hace consultas por cada uno; mobile.bootstrap realiza hasta 100 consultas secuenciales adicionales por página. Noticias públicas retorna todas las activas.
- **Recomendación:** Acotar size/page y sort; paginar usuarios y noticias; sustituir consultas N+1 por joins o consultas agregadas con índices. Añadir presupuestos de consultas y límites medidos.
- **Esfuerzo estimado:** Medio

### [WS-026] Vistas mantienen listeners y gráficos tras desmontarse
- **Categoría:** Rendimiento
- **Severidad:** Baja
- **Ubicación:** client/src/app/views/admin/admin-facturacion.vue:40
- **Evidencia:**

```text
40: if (typeof window !== 'undefined') {
41:   window.addEventListener('resize', handleResize)
42:   handleResize()
43: }
```

- **Impacto:** Facturación, usuarios, noticias y actividad añaden resize sin retirarlo. MiConsumo crea Chart sin destruirlo al desmontar. Navegar repetidamente puede acumular trabajo y referencias.
- **Recomendación:** Registrar efectos en onMounted y retirarlos en onUnmounted; destruir Chart y cancelar solicitudes. Probar entrar/salir repetidamente con contador de listeners.
- **Esfuerzo estimado:** Bajo

### [WS-033] El JavaScript inicial supera 900 kB minificado
- **Categoría:** Rendimiento
- **Severidad:** Media
- **Ubicación:** client/src/app/main.ts:24
- **Evidencia:**

```text
24: import {
25:   Chart,
26:   CategoryScale,
27:   LinearScale,
28:   PointElement,
29:   LineElement,
30:   BarElement,
31:   Title,
32:   Tooltip,
33:   Legend,
```

evidencias/build.log y build-inventario.json. Swagger añade archivos distribuidos, pero no todos se cargan en la home.

- **Impacto:** El build genera app de 924.882 bytes (301.616 gzip) y CSS de 303.485 bytes (42.673 gzip). Vue compat, BootstrapVue y Chart se cargan globalmente. Puede ralentizar móviles; no se midieron LCP, INP o CLS ni se atribuye una puntuación Lighthouse.
- **Recomendación:** Medir ruta crítica en móvil y dividir gráficos/administración; reducir convivencia de frameworks y CSS. Configurar caché de assets con hash y compresión verificadas en proxy/CDN.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
