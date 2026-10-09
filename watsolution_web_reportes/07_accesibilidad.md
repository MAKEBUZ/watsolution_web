# Accesibilidad

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Evaluación estática orientada a WCAG 2.2 AA. No constituye declaración de conformidad. Se revisaron etiquetas, roles, imágenes, foco/ciclo de modales y gráficos; no se midió contraste renderizado, foco visible por navegador, tamaño de objetivo, zoom 200–400 %, orden de tabulación, lectores de pantalla ni movimiento reducido.

| Criterio | Evidencia / estado |
|---|---|
| 1.1.1 Contenido no textual | WS-030, gráficos sin equivalente de serie |
| 1.3.1 Relaciones / 4.1.2 nombre-rol-valor | WS-028 y WS-029 |
| 2.1.1 Teclado / 2.4.3 foco | Falta de gestión modal en fuente; comprobación interactiva No verificada |
| 1.4.3 contraste / 1.4.10 reflow | No verificado visualmente; no se deducen ratios de paletas aisladas |
| 2.4.7 foco visible / 2.4.11 foco no oculto | No verificado en ejecución |
| 3.3.1 errores / 3.3.2 instrucciones | Algunos errores son div sin alert; requiere auditoría de anuncios en ejecución |
| 3.3.8 autenticación accesible | Inputs admiten pegado y autocomplete en login; flujo de recuperación está incompleto |

W3C recomienda asociar controles con etiquetas y proporcionar rol/nombre y comportamiento de foco a los diálogos. [Etiquetado de formularios](https://www.w3.org/WAI/tutorials/forms/labels/), [patrón modal WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

### [WS-028] Los campos administrativos carecen de asociación con su etiqueta
- **Categoría:** Accesibilidad
- **Severidad:** Media
- **Ubicación:** client/src/app/views/admin/admin-usuarios.vue:495
- **Evidencia:**

```text
495:           <div class="form-row">
496:             <div class="form-field">
497:               <label class="form-label">Nombre completo *</label>
498:               <input class="form-control" v-model="formData.fullName" placeholder="Nombre completo" required />
499:             </div>
500:             <div class="form-field">
501:               <label class="form-label">N° Documento *</label>
502:               <input class="form-control" v-model="formData.documentNumber" placeholder="Número de documento" required />
```

Revisión de marcado; contraste, zoom y lector de pantalla No verificados. Referencias W3C en el reporte.

- **Impacto:** Los label no tienen for y los inputs no están anidados en ellos ni tienen ID/aria-labelledby. La relación visual no está expresada semánticamente; afecta lectores de pantalla y selección por voz.
- **Recomendación:** Asignar ID único y for, conectar ayuda/errores con aria-describedby, y comprobar nombres accesibles con tecnologías asistivas.
- **Esfuerzo estimado:** Bajo

### [WS-029] Los modales personalizados no gestionan semántica ni foco
- **Categoría:** Accesibilidad
- **Severidad:** Media
- **Ubicación:** client/src/app/views/admin/admin-usuarios.vue:480
- **Evidencia:**

```text
480:     <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
481:       <div class="modal-card">
482:         <div class="modal-header">
483:           <h2>{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
484:           <button class="modal-close" @click="closeModal">
485:             <font-awesome-icon icon="times" :size="18" />
486:           </button>
```

- **Impacto:** El modal usa div sin role=dialog/aria-modal ni nombre accesible, no mueve o devuelve foco y no contiene navegación por tabulación; cerrar depende de clic. Los botones solo con icono también requieren nombre.
- **Recomendación:** Usar componente modal accesible o implementar semántica, foco inicial, Escape, contención y retorno de foco; probar apertura/cierre solo con teclado.
- **Esfuerzo estimado:** Medio

### [WS-030] Los gráficos carecen de alternativa textual equivalente
- **Categoría:** Accesibilidad
- **Severidad:** Media
- **Ubicación:** client/src/app/views/portal/portal-dashboard.vue:320
- **Evidencia:**

```text
320:             <span class="chart-card__badge">Últimos 6 meses</span>
321:           </div>
322:           <div class="chart-wrapper">
323:             <canvas ref="lineChartRef"></canvas>
324:           </div>
325:           <button class="chart-card__link" @click="activeSection = 'consumo'">
```

Verificación estática, no certificación WCAG AA.

- **Impacto:** Canvas no ofrece nombre/descripción ni una tabla con la serie mensual equivalente. Un lector de pantalla no obtiene la tendencia representada.
- **Recomendación:** Añadir nombre y resumen accesibles y tabla de los mismos datos; no depender únicamente del color para estados y series.
- **Esfuerzo estimado:** Bajo


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
