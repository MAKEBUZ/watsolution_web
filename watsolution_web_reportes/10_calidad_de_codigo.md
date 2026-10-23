# Calidad de código

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Análisis sintáctico de todos los archivos JS/TS y scripts Vue inventariados: sin diagnósticos de sintaxis en el escaneo. TypeScript backend con --noEmit: aprobado. ESLint por workspace: falló; detalle WS-044. Las advertencias sin ruleId del resumen son directivas eslint-disable no utilizadas, no errores de parser.

Tipado backend: strict/strictNullChecks/noImplicitAny no activados. Uso frecuente de any, casts y DTO con fechas any reduce garantías. Mappers copian cualquier propiedad; DTO separado no limita entrada por sí mismo. Vistas grandes (admin-usuarios.vue: 1.740 líneas, portal-dashboard.vue: 1.183) mezclan UI, HTTP y estilos. Componentes/servicios heredados coexisten con implementaciones inline (WS-046).

No se modificó formato ni código. La cifra de lint es una salida de herramienta, no un conteo de vulnerabilidades. Datos estructurales, señales TODO/FIXME, catches vacíos, SQL y HTML están en evidencias/analisis-por-archivo.json con ubicación. Las señales no se elevaron automáticamente a hallazgos.

### [WS-044] Lint falla y el pipeline no lo exige
- **Categoría:** Calidad
- **Severidad:** Media
- **Ubicación:** watsolution_web_reportes/evidencias/lint-resumen.json:1
- **Evidencia:**

```text
1: {
2:   "lintserver": {
3:     "files": 150,
4:     "errors": 4469,
5:     "warnings": 15,
6:     "byRule": {
7:       "prettier/prettier": 4432,
```

evidencias/lintserver.log, lintclient.log; invocaciones iniciales desde raíz se descartaron por cwd incorrecto.

- **Impacto:** Ejecución correcta desde cada workspace: servidor 4.469 errores/15 advertencias; cliente 23.122 errores/56 advertencias. Predomina formato/CRLF; no equivalen a igual número de defectos funcionales. La CI ejecuta tsc backend, tests y Vite, pero no lint ni comprobación de tipos Vue.
- **Recomendación:** Normalizar formato en una tarea separada, resolver errores semánticos y habilitar lint y vue-tsc --noEmit en CI. Mantener controles sin autofix durante auditorías.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
