# Resumen ejecutivo

**Resultado: 44/100, preparación insuficiente para aprobar una puesta en producción con datos reales.** No es una certificación ni una medición automática de seguridad. Evaluación del estado local del 5 de octubre de 2026; cambios previos del usuario incluidos.

Se inventariaron 455 archivos y 93 directorios, se trazaron 80 rutas HTTP y se analizó el lock completo. Pasaron 42 pruebas backend, 182 frontend y el build Vite. Los probes aislados revelaron condiciones no cubiertas por esas pruebas. No se modificó el código fuente: solo se creó esta carpeta de reportes. Consultar verificación final de hashes para el cierre de integridad.

## Hallazgos únicos

| Severidad | Cantidad |
|---|---:|
| Crítica | 0 |
| Alta | 10 |
| Media | 30 |
| Baja | 7 |
| Informativa | 0 |
| **Total** | **47** |

No hay hallazgo Crítico: no se demostró explotación contra producción ni vigencia de credenciales históricas. Las altas corresponden a defectos reproducidos o condiciones graves sustentadas en código; cada reporte explica precondiciones y límites.

## Puntuación por área

Escala de juicio profesional: 0–39 controles insuficientes, 40–59 brechas relevantes, 60–79 base funcional con mejoras, 80–100 evidencia sólida. La puntuación global es la media simple redondeada de las 15 áreas; la falta de validación operativa limita la confianza y no se trata como evidencia favorable. Se valoran controles positivos y defectos por impacto, no se descuentan puntos por cada mensaje de lint.

| Área | Puntuación /100 |
|---|---:|
| Arquitectura | 60 |
| Seguridad | 38 |
| Backend y API | 42 |
| Base de datos | 45 |
| Frontend y UX | 55 |
| Accesibilidad | 40 |
| Rendimiento | 50 |
| SEO | 35 |
| Calidad | 48 |
| Pruebas | 55 |
| Dependencias y licencias | 45 |
| DevOps | 40 |
| Privacidad | 40 |
| Observabilidad | 35 |
| Documentación | 35 |

## Diez riesgos principales

1. **WS-001: El portal confunde el login con el propietario y permite cruzar cuentas.** Un usuario podría consultar información y facturas de otro cliente cuando su nombre de acceso coincide con el identificador de esa persona.

2. **WS-002: Generar el PDF puede deshacer un pago concurrente.** Si se genera un PDF mientras se confirma un pago, una factura pagada puede volver a aparecer como pendiente.

3. **WS-003: Credenciales de base de datos y clave JWT permanecen en Git.** El historial del repositorio conserva contraseñas de base de datos y una clave de acceso. Se desconoce si siguen vigentes; deben revisarse y rotarse.

4. **WS-004: Las altas quedan sin un flujo funcional para obtener acceso.** Las cuentas nuevas quedan inactivas y sin un mecanismo funcional para que el cliente obtenga o recupere su contraseña.

5. **WS-005: Dos aperturas simultáneas pueden perder la referencia de un pago.** Abrir el pago dos veces al mismo tiempo puede hacer que un cobro exitoso quede sin asociar a su factura.

6. **WS-006: El historial del chatbot sobrevive al cambio de usuario.** Al cambiar de cuenta en el mismo navegador, el siguiente usuario podría ver mensajes y datos personales consultados por el anterior.

7. **WS-007: Salir con el JWT vencido no revoca la cookie de renovación.** Cerrar sesión después de que venza el acceso puede dejar una credencial de renovación válida y permitir que la cuenta se restaure al recargar.

8. **WS-008: El CRUD de facturas y lecturas evita las reglas del flujo canónico.** Los formularios administrativos permiten alterar facturas y lecturas fuera de las reglas principales de cálculo y protección de pagos.

9. **WS-009: La migración histórica siembra cuentas activas con contraseñas fijas.** Existen cuentas privilegiadas de ejemplo con contraseñas fijas en una carga de datos histórica. Es necesario comprobar que no existan en el entorno real.

10. **WS-014: Migraciones históricas sincronizan el esquema y no permiten reversión.** Las migraciones antiguas no definen cambios de esquema estables ni una reversión efectiva; una actualización requiere ensayo y respaldo restaurable.

## Fortalezas

- Separación Nest por módulos y rutas Vue diferidas; lock de workspaces y pipeline de comprobaciones.
- JWT corto con emisor/audiencia, clave obligatoria, refresh con hash/rotación/bloqueo y revocación de sesiones.
- Lecturas móviles con validación explícita, asignación e idempotencia; facturación canónica con aritmética en centavos.
- Webhook con rawBody/HMAC, comparación de importe/moneda y bloqueo; redirect nunca confirma pago por sí mismo.
- QR sin PII directa, URLs de descarga temporales y resúmenes personales de IA procesados localmente.
- 224 pruebas unitarias existentes aprobadas y compilación reproducida dentro de reportes.

## Hoja de ruta

0–7 días: cerrar aislamiento del portal y carreras de pago/PDF, rotar secretos históricos, asegurar logout y limpieza de chatbot, resolver altas. 1–4 semanas: centralizar reglas financieras, migraciones e integridad, contratos y errores, automatizar integración. 1–3 meses: rendimiento, accesibilidad, despliegues reproducibles, privacidad y monitoreo. Detalle de cada ID, dependencia y criterio de cierre: [17_plan_de_remediacion.md](17_plan_de_remediacion.md).

## Limitaciones

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.

La cobertura por archivo distingue revisión estática, parcial y no revisado con motivo. Revisión estática automatizada no equivale a lectura semántica manual exhaustiva de cada rama. Los binarios y comportamiento visual permanecen parciales. No se ejecutaron E2E que inicializan/migran BD. Credenciales históricas y autorizaciones físicas no se probaron.

## Recomendación final

Priorizar los riesgos de identidad, sesión e integridad financiera y exigir integración sobre PostgreSQL/staging antes de aprobar operación real. No basta con que las pruebas unitarias pasen. Obtener evidencia de respaldo/restauración, controles desplegados y escaneo vigente de dependencias.
