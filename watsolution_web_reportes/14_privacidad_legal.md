# Privacidad y cumplimiento

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

La UI contiene política extensa con responsable y canal habeas data, finalidades, derechos, terceros y plazos. Es una fortaleza documental inicial, pero contiene afirmaciones no respaldadas o contradictorias (WS-039). Se tratan nombre, documento, dirección, teléfono, correo, consumo, deuda, recibos y credenciales con hash. QR actual incluye v:2 y personId, sin PII legible; PDF contiene nombre/documento y se sirve por URL presignada de 300 s.

Proveedores comprobados en código: infraestructura/bucket configurable; Bold checkout y webhook; OpenAI embeddings únicamente para FAQs constantes. Chat personal se resume localmente y no manda prompts/facturas a OpenAI en este estado. Imágenes remotas de avatares pueden revelar IP/referer al proveedor; política y encabezados requieren revisión. WhatsApp/SMS y residencia de datos no se verifican por un texto de política.

La Ley 1581 exige, salvo excepciones, autorización previa e informada que pueda consultarse después; la aplicabilidad concreta, excepciones, obligaciones sectoriales y conservación requieren validación del responsable. [Ley 1581 de 2012, artículo 9, fuente oficial](https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?5=&i=49981). No se emite dictamen legal, no se certifica cumplimiento y no se presume aplicabilidad de GDPR/LOPD sin contexto territorial.

Derechos: hay edición de cuenta y canal de correo declarado; no API específica de exportación/supresión integral. Un proceso manual puede ser válido, pero tiempos, evidencia de atención y eliminación en backups/proveedores: **No verificado**. Contratos de encargados, autorizaciones físicas y términos comerciales no aportados.

### [WS-039] La política publicada describe controles y proveedores distintos al código
- **Categoría:** Privacidad / documentación
- **Severidad:** Media
- **Ubicación:** client/src/app/views/politica/politica-privacidad.vue:350
- **Evidencia:**

```text
350:                 <tr><td>WhatsApp Business API (Meta)</td><td>Envío de notificaciones de facturación, pagos y soporte</td><td>Número de celular y contenido del mensaje</td></tr>
351:                 <tr><td>Proveedor de SMS</td><td>Mensajes SMS como canal de respaldo</td><td>Número de celular y texto del mensaje</td></tr>
352:                 <tr><td>Railway (Infraestructura)</td><td>Hospedaje del backend, BD PostgreSQL y almacenamiento S3</td><td>Todos los datos de la plataforma (bajo contrato)</td></tr>
353:                 <tr><td>Pasarela PSE (futuro)</td><td>Pagos en línea (simulación en fase 1)</td><td>No se transmiten datos financieros reales en fase 1</td></tr>
354:               </tbody>
355:             </table>
356:           </div>
357:           <div class="pp-callout">
358:             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
359:             WatSolution no realiza transferencias internacionales de datos. Toda la información se almacena y procesa bajo los términos de los proveedores mencionados.
```

- **Impacto:** Declara pagos futuros simulados y ausencia de transferencias internacionales, pero el flujo activo integra Bold. También equipara bcrypt con AES-256 (928), promete cinco intentos donde hay diez/minuto y sesiones stateless aunque se consultan en BD. Contratos, regiones, backups y capacitación No verificados.
- **Recomendación:** Reconciliar política con inventario real y evidencia operativa, incluir Bold y recursos de terceros, y evitar asegurar residencia, cifrado o backups sin verificación. Validar el texto con el responsable de datos.
- **Esfuerzo estimado:** Medio

### [WS-040] La aceptación de privacidad no queda registrada en el flujo web
- **Categoría:** Privacidad
- **Severidad:** Media
- **Ubicación:** client/src/app/views/login/login.vue:168
- **Evidencia:**

```text
168:           <label class="auth-privacy">
169:             <input v-model="privacyAccepted" type="checkbox" class="auth-privacy__check">
170:             <span>
171:               He leído y acepto la
172:               <router-link to="/politica-privacidad" target="_blank" class="auth-privacy__link">
173:                 Política de Privacidad
174:               </router-link>
175:             </span>
176:           </label>
177: 
```

Marco consultado: Ley 1581 de 2012, artículo 9; no se emite dictamen legal ni se presume aplicabilidad de GDPR/LOPD.

- **Impacto:** privacyAccepted habilita un botón, pero POST authenticate no envía ni persiste versión/fecha/finalidad de aceptación. La política dice conservar autorización; el registro público tampoco incluye prueba. Una casilla local no permite acreditar autorización consultable después. Los formularios físicos mencionados en la política no fueron suministrados.
- **Recomendación:** Definir con el responsable la base jurídica por finalidad y conservar prueba cuando aplique (versión, titular, instante y canal); incluir flujo de revocación y atención. Separar autenticación de tratamientos opcionales.
- **Esfuerzo estimado:** Medio

### [WS-041] Las sesiones expiradas no se eliminan como promete la política
- **Categoría:** Privacidad / retención
- **Severidad:** Media
- **Ubicación:** server/src/service/session.service.ts:18
- **Evidencia:**

```text
18:   async validate(id: string, userId: number) {
19:     if (!id) return false;
20:     const session = await this.db.getRepository(AuthSession).findOneBy({ id, userId, revoked: false });
21:     return !!session && session.expiresAt.getTime() > Date.now();
22:   }
```

- **Impacto:** validate solo comprueba expiración y revoke marca estado; no existe purga de auth_session en el código revisado. usedRefreshHashes puede acumular hasta 1.000 elementos por sesión. La política promete eliminación al expirar (politica-privacidad.vue:389); tareas externas No verificadas.
- **Recomendación:** Implementar retención y purga verificables de sesiones, operaciones y datos personales conforme a finalidad/legalidad; registrar ejecución sin secretos y corregir la promesa pública si la retención es distinta.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
