# Supuestos y alcance

**Solo planificación.** Este encargo no corrige, instala, migra, rota, despliega ni envía mensajes. Se crean documentos únicamente en watsolution_web_planning. Los reportes originales son evidencia inmutable. Todas las tareas están **Pendiente**.

## Entradas y limitaciones

Se encuentran completos los 19 archivos 00–18 y la carpeta de evidencias. El CSV 18_hallazgos.csv es la fuente de verdad de los 47 IDs (0 críticos, 10 altos, 30 medios, 7 bajos). Se leyó íntegramente el contenido de los 261 archivos de reportes/evidencias (16.408.639 bytes), con análisis estructural de tablas, JSON y logs completos y revisión de los reportes y resultados relevantes. Builds/caches se leyeron como artefactos generados, no como una nueva auditoría semántica de librerías ni revisión visual. types.log está vacío porque tsc terminó sin errores (types-meta.json: exitCode=0), no porque falte una prueba. Ver [lectura-entradas.json](lectura-entradas.json).

La auditoría contiene 101 archivos parcialmente revisados, no cobertura operativa exhaustiva. CVE actuales, HTTPS/cabeceras reales, contratos, región, IAM, restauración, carga, navegador y cobertura porcentual siguen sin verificar. El anterior npm audit fue bloqueado por red/revisión automática; este encargo no reintenta ni presupone autorización del envío de metadata. La lectura de datos de producción, rotación y reescritura de historial se planifican; no se ejecutan.

Los diez altos se revalidaron localmente contra fuente e historial antes del triaje: [revalidacion-altos.json](revalidacion-altos.json). Todos siguen sustentados; dos riesgos (secretos y semilla) requieren confirmar exposición real. No se degradan a falsos positivos por falta de acceso operativo.

## Equipo y capacidad asumidos, por validar

| Perfil | Dedicación nominal | Capacidad efectiva semanal |
|---|---:|---:|
| Dos backend/full-stack senior, uno líder técnico | 2 personas completas | 60 h |
| Frontend Vue | 1 persona completa | 30 h |
| QA automatización | Media dedicación | 15 h |
| DevOps/seguridad | Media dedicación | 15 h |
| **Total técnico** | **5 personas, 4 equivalentes completos** | **120 h** |

Responsable de facturación/datos y asesor jurídico disponibles para decisiones en 2 días hábiles: supuesto, no personal confirmado. No hay presupuesto monetario ni tarifas; no se calcula costo ficticio. 30 h efectivas de una semana de 40 dejan margen para reuniones/soporte. Las horas por tarea incluyen implementación, prueba específica, revisión y documentación; las tareas de QA agregan integración/validación de fase, sin volver a estimar el desarrollo. Para el calendario conservador se cargan todas las horas al perfil principal; la ayuda cruzada solo se podrá descontar tras acordarla.

Tareas de 4 a 24 h-persona; ninguna supera tres jornadas nominales de 8 h. Las tareas de 4 h son intencionalmente menores a un día. Dedicación parcial, dependencias y esperas pueden alargar su duración calendario: no confundir horas-persona con días transcurridos. Si una investigación excede 24 h, dividirla antes de comprometerla, conservando IDs de hallazgos y criterios.

## Estimación y calendario

Esfuerzo base **856–1416 h**; reserva de incertidumbre separada 20%, redondeada al alza: **1028–1700 h presupuestadas**. No se distribuye esa reserva en tareas ni se suma dos veces. Equivalente agregado a 120 h/semana: **7.13–11.8 semanas**, que no es una promesa de entrega. Calendario por perfil/dependencias/fases: **18.27–30 semanas hábiles**; con reserva: **22–36 semanas**. Sin vacaciones, festivos ni esperas de proveedores, aprobación legal o datos faltantes. El primer ciclo de mejora continua está incluido; recurrencias trimestrales posteriores no lo están.

Día 0 de contención = salida de F0. Las ventanas originales 0–7 días / 1–4 semanas / 1–3 meses son objetivos de riesgo, no estimaciones validadas. Se ajustan en el roadmap según el equipo: no se promete cerrar todo en cuatro semanas. Adelantar apoyo DevOps/QA y parallelizar por capacidad real puede reducir tiempo, con recalculación obligatoria. Una exposición activa se atiende como incidente inmediatamente: la rotación T-003 no espera el ensayo completo de backup.

## Regla transparente de prioridad

S: severidad máxima del CSV (Crítica 5, Alta 4, Media 3, Baja 2, Informativa 1). L: probabilidad ordinal asumida de 1 rara a 5 frecuente; B: impacto de 1 cosmético a 5 datos/dinero/acceso. Son juicios del plan, no probabilidades estadísticas. D=min(3, número de tareas que desbloquea directamente). E=min(3, 24 / horas medias de tarea). **Puntuación = 8S + 4L + 4B + 2D + 2E.** Menor esfuerzo y más dependencias desbloqueadas suben prioridad a igual riesgo.

P0: puntuación ≥80; además toda preparación F0, contención Alta de F1 y el habilitador indispensable T-014 se elevan a P0. P1: puntuación ≥65 o cualquier tarea Alta. P2: ≥45. P3: restante. Las dependencias duras se ejecutan antes que el orden numérico de prioridad; una tarea puede tener P1 en F3 por impacto pero necesita completar prerrequisitos. No se rebaja severidad del CSV. La tabla de puntuación completa está en triaje.

## Límites del alcance de corrección

Se corrigen los 47 hallazgos. Se incluyen tareas habilitadoras, reauditorías y primer simulacro. No se añade WhatsApp/SMS ni hardware de sensores, una reescritura completa de la aplicación, un dictamen jurídico o soporte recurrente. Se acuerda una topología soportada (y se retira/documenta cualquier alternativa obsoleta). Se presume acceso autorizado a staging, backups y sandbox de pagos/correo al ejecutar; si no existe, el hito no puede cerrarse. Versiones nuevas y herramientas que aún no están instaladas se seleccionarán/verificarán durante implementación.

No se acepta riesgo en nombre del negocio. Si el equipo quisiera aceptar alguno, deberá añadir dueño, razón, control compensatorio, caducidad y firma al registro, manteniendo el ID. Plan asignado al 100% no significa corrección verificada al 100%.
