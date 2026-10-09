# SEO y metadatos

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

HTML con lang=es y viewport presente. No hay sitemap.xml en inventario. Las páginas públicas son inicio, noticias y política; el resto es funcional privado. El router envía rutas desconocidas a /not-found; Nginx aplica fallback index.html a cualquier ruta no encontrada, sin código 404 específico de aplicación. No se midió respuesta HTTP desplegada ni indexación real.

No se comprobaron todos los enlaces externos en red. Sí se contrastaron rutas fuente, recursos de build y referencias internas. El 404.html en inglés es una plantilla independiente; no basta para demostrar que el servidor la entregue con 404.

### [WS-031] robots.txt y manifest.webapp no llegan al build
- **Categoría:** SEO / distribución
- **Severidad:** Baja
- **Ubicación:** client/vite.config.mts:30
- **Evidencia:**

```text
30:   root: fileURLToPath(new URL('./src/', import.meta.url)),
31:   publicDir: isStandalone ? false : fileURLToPath(new URL('./../server/dist/static/public', import.meta.url)),
32:   cacheDir: isStandalone
33:     ? fileURLToPath(new URL('./tmp/.vite-cache', import.meta.url))
34:     : fileURLToPath(new URL('./../tmp/.vite-cache', import.meta.url)),
35:   build: {
36:     emptyOutDir: true,
37:     outDir: isStandalone
38:       ? fileURLToPath(new URL('./dist/', import.meta.url))
39:       : fileURLToPath(new URL('./../server/dist/static/', import.meta.url)),
```

evidencias/build-inventario.json: 85 archivos, sin robots.txt ni manifest.webapp.

- **Impacto:** El build usa src como raíz pero copia recursos públicos desde server/dist/static/public; los archivos robots.txt y manifest.webapp están en client/src y no se importan/copian. La compilación auditada no los contiene, aunque index.html referencia el manifest.
- **Recomendación:** Definir publicDir estable o copia explícita de robots, manifest e iconos; verificar URLs contra el artefacto generado y no solo contra el árbol fuente.
- **Esfuerzo estimado:** Bajo

### [WS-032] Metadatos públicos conservan valores de plantilla
- **Categoría:** SEO / metadatos
- **Severidad:** Baja
- **Ubicación:** client/src/index.html:6
- **Evidencia:**

```text
6:     <title>watsolution</title>
7:     <meta name="description" content="Description for watsolution" />
8:     <meta name="google" content="notranslate" />
9:     <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
10:     <meta name="theme-color" content="#000000" />
```

- **Impacto:** Título y descripción genéricos; no se define canonical, Open Graph, sitemap ni datos estructurados en el inventario. La SPA no actualiza metadatos por noticia/ruta. El fallback Nginx sirve index para rutas desconocidas: posible soft-404, sin medición de rastreo.
- **Recomendación:** Definir metadatos reales por ruta pública y canonical; generar sitemap y decidir prerenderizado según necesidades. Mantener contenido privado fuera de indexación sin confundir robots con control de acceso.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
