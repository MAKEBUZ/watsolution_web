# Frontend, UI y UX

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Se inspeccionaron scripts de las vistas activas, rutas y estado, eventos de formulario, cargas/errores/vacíos y marcado. Rutas activas cargan componentes de manera diferida. Pinia conserva identidad; access token reside en memoria y se eliminan claves antiguas de almacenamiento. Hay estados de carga y errores explícitos en pagos, facturas y portal, pero varias vistas administrativas silencian errores con catch/console.

Flujos críticos: login inline admite id_token del cuerpo; registro/alta quedan afectados por WS-004; pago usa datos firmados del servidor en la vista activa; edición manual de facturas requiere reglas WS-008. Cambiar contraseña permite cuatro caracteres en Vuelidate aunque backend exige doce y máximo 72 bytes: alinear mensajes y validadores. RememberMe se envía, pero servidor siempre crea refresh de siete días; la opción visual no cambia duración.

Responsive: existen media queries y menús móviles; no se realizaron capturas en dispositivos o navegadores ni pruebas Safari/Firefox. Hay mezcla de español e inglés en login y páginas de error. Historial de facturas limita a 50 y lecturas a 100, sin cursor en esos contratos; filtros «todas» no garantizan historial completo. Acciones de trámites/soporte incluyen UI de presentación y no equivalen a API funcional (portal/reportes no existe en inventario).

### [WS-024] La búsqueda de suscriptores solo filtra la primera página
- **Categoría:** Frontend / UX
- **Severidad:** Media
- **Ubicación:** client/src/app/views/admin/admin-facturacion.vue:52
- **Evidencia:**

```text
52: const searchPersons = async () => {
53:   const q = searchQuery.value.trim()
54:   if (!q) { searchResults.value = []; showDropdown.value = false; return }
55:   isSearching.value = true
56:   try {
57:     const res = await axios.get('api/people', { params: { page: 0, size: 20, sort: 'id,asc' } })
58:     const lower = q.toLowerCase()
59:     searchResults.value = (res.data ?? []).filter((p: any) =>
60:       p.fullName?.toLowerCase().includes(lower) || p.documentNumber?.includes(q)
61:     )
```

- **Impacto:** Se descargan los primeros 20 suscriptores y se filtran en memoria. Un suscriptor posterior no aparece aunque exista. Usuarios limita a 200 y noticias a la página por defecto sin navegación completa.
- **Recomendación:** Implementar búsqueda y paginación en servidor, propagar total/cursor y mostrar estado vacío diferente de error. Cancelar solicitudes viejas para evitar sobrescritura de resultados.
- **Esfuerzo estimado:** Medio

### [WS-025] Actividad y telemetría muestran datos simulados como reales
- **Categoría:** Frontend / datos operativos
- **Severidad:** Media
- **Ubicación:** client/src/app/views/admin/admin-actividad.vue:44
- **Evidencia:**

```text
44: const logs = ref([
45:   { id: 1, user: 'Maria Garcia', action: 'Pago de Factura', details: 'FAC-2026-0038', amount: '$45,200', type: 'payment', time: 'Hace 5 min' },
46:   { id: 2, user: 'Juan Perez', action: 'Nueva Lectura', details: '1,265 m³ - Sector Sur', type: 'reading', time: 'Hace 12 min' },
47:   { id: 3, user: 'Sistema', action: 'Nueva Noticia', details: 'Corte programado sector Norte', type: 'news', time: 'Hace 25 min' },
48:   { id: 4, user: 'Carlos Ruiz', action: 'Registro Usuario', details: 'Nuevo suscriptor: ID #104', type: 'user', time: 'Hace 1 hora' },
49:   { id: 5, user: 'Ana Lopez', action: 'Pago de Factura', details: 'FAC-2026-0039', amount: '$32,100', type: 'payment', time: 'Hace 2 horas' }
50: ])
```

- **Impacto:** La vista activa contiene una lista fija de pagos, nombres y tiempos. El gateway de tanque genera Math.random (tank-level.gateway.ts:40–50) mientras el tablero dice En vivo (admin-resumen.vue:333). Puede inducir decisiones operativas sin una fuente real.
- **Recomendación:** Conectar actividad a la API existente; separar demo y producción y etiquetar claramente cualquier simulación. Integrar telemetría autenticada y mostrar antigüedad/calidad del dato.
- **Esfuerzo estimado:** Medio

### [WS-027] La matriz de roles de la UI no coincide con la API
- **Categoría:** Frontend / autorización
- **Severidad:** Media
- **Ubicación:** client/src/app/router/entities.ts:28
- **Evidencia:**

```text
28:       path: 'address',
29:       name: 'Address',
30:       component: Address,
31:       meta: { authorities: [Authority.USER] },
32:     },
33:     {
34:       path: 'address/new',
35:       name: 'AddressCreate',
36:       component: AddressUpdate,
37:       meta: { authorities: [Authority.USER] },
```

- **Impacto:** Las vistas CRUD permiten ROLE_USER, pero listas y mutaciones backend exigen ADMIN. Un administrador con solo ROLE_ADMIN tampoco pasa algunas lecturas de noticias y Bold que piden exclusivamente USER. No hay jerarquía implícita de roles en RolesGuard.
- **Recomendación:** Publicar matriz de permisos única y alinear rutas, menús y API; incluir explícitamente roles permitidos por operación y probar cuentas con solo USER, ADMIN y OPERATOR.
- **Esfuerzo estimado:** Medio

### [WS-047] Fechas sin zona se interpretan como instantes y adelantan mora
- **Categoría:** Frontend / fechas
- **Severidad:** Media
- **Ubicación:** client/src/app/views/portal/mis-facturas.vue:17
- **Evidencia:**

```text
17:   if (inv.status === 'PENDING') {
18:     const due = new Date(inv.dueDate as any)
19:     return due < new Date() ? 'OVERDUE' : 'PENDING'
20:   }
```

Ejemplo ECMAScript a comprobar localmente: new Date(2026-10-05 como cadena ISO de fecha) en America/Bogota corresponde al 4 de octubre a las 19:00. No se afirmó una norma legal de vencimiento.

- **Impacto:** Una fecha YYYY-MM-DD se interpreta en UTC; en America/Bogota puede mostrarse el día anterior. Comparar contra Date.now también declara vencida la factura al inicio UTC del día de vencimiento, si el negocio permite pagar durante ese día.
- **Recomendación:** Tratar fechas de calendario sin conversión UTC y definir hora/zona de vencimiento con negocio; usar el mismo criterio en frontend/backend y probar límites de medianoche.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
