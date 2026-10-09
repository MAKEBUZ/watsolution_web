# Pruebas y testing

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

| Comprobación | Resultado | Evidencia |
|---|---|---|
| tsc backend --noEmit | Aprobado | types.log, types-meta.json |
| Jest unitario | 9 suites, 42 pruebas aprobadas | jest.log |
| Vitest unitario | 36 archivos, 182 pruebas aprobadas | frontend.log |
| Build Vite | Aprobado, advertencia de chunk >500 kB | build.log |
| ESLint backend / cliente | Fallo de formato y reglas | lint-resumen.json |
| Probes de auditoría | 7 casos ejecutados, reproducen 6 defectos/condiciones y cadena HTML sin escape | probes-resultados.json |
| E2E / JMeter / despliegue | No ejecutados | Prohibición de migraciones/escrituras y falta de entorno aislado aprobado |
| npm audit | No verificado | audit.log, auditprod.log y rechazo de permisos |

Los probes llaman clases reales con repositorios/S3 simulados; **no sustituyen una prueba de concurrencia PostgreSQL ni un exploit HTTP contra producción**. La reproducción de XSS confirma cadena HTML sin escapar, no ejecución JS en navegador ni ataque contra otra cuenta.

Para respetar la carpeta de escritura, Vitest utilizó config equivalente de plugin Vue, aliases, define, setup y happy-dom con cache/reportes dentro de evidencias y cobertura desactivada. Vite cargó configuración original con loader native y solo cambió envDir/cacheDir/outDir/emptyOutDir. No se cargaron .env reales en el build. Intentos iniciales con loaders incompatibles y lint desde raíz se corrigieron; no son defectos del producto. No se ejecutó npm test raíz: es un echo sin pruebas.

Cobertura porcentual de código: **No medida**. El 85/75/85 del config no es resultado de cobertura. Los reportes tmp preexistentes son históricos, no prueba del estado actual.

### [WS-043] Los tests aprobados no cubren los flujos completos de producción
- **Categoría:** Pruebas
- **Severidad:** Media
- **Ubicación:** server/e2e/account.e2e-spec.ts:49
- **Evidencia:**

```text
49:   beforeEach(async () => {
50:     const moduleFixture: TestingModule = await Test.createTestingModule({
51:       imports: [AppModule],
52:     })
53:       .overrideGuard(AuthGuard)
54:       .useValue(authGuardMock)
55:       .overrideGuard(RolesGuard)
56:       .useValue(rolesGuardMock)
```

E2E no ejecutados por prohibición expresa de migraciones. El test de frontend usó configuración adaptada para escribir solo en reportes; sin cobertura porcentual medida.

- **Impacto:** Los E2E existentes sustituyen guardas y algunas pruebas esperan 500 de funciones incompletas. No se ejecutan en CI. Usan AppModule con perfil SQLite que sincroniza/migra y contiene SQL PostgreSQL. Las 224 pruebas unitarias aprobadas no certifican aislamiento HTTP, cookies, PostgreSQL ni webhooks reales.
- **Recomendación:** Añadir integración aislada PostgreSQL y E2E de alta/activación, permisos entre cuentas, refresh/logout, pagos/PDF y roles; ejecutarlos en CI con servicios desechables y sin secretos reales.
- **Esfuerzo estimado:** Alto


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
