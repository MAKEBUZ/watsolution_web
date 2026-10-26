# Actividad y regreso a administración

Versión publicada y verificada: `activity-portal-20261024-v1`.

## Cambios

- Se reemplaza la vista antigua de actividad por una página que utiliza el contenedor administrativo compartido. Botón de actualización con icono, indicador de carga, resumen del total real, etiquetas por evento, importes y fechas separados, estados vacío/error y paginación de diez registros.
- Se publica `GET /api/admin/activity-page`, restringido al administrador. Orden descendente estable por fecha e identificador, tamaño entre 1 y 100, página entera no negativa. La API anterior permanece disponible.
- El portal muestra a los administradores «Volver al panel» en la parte inferior del menú izquierdo. En móvil se mantiene fijo abajo a la izquierda. El enlace permanece al cambiar de sección y desplazar la página. Los usuarios normales no ven esta opción.
- El mapa tiene código local, pero sigue pendiente de validación y publicación; no forma parte de esta versión.

## Verificación

- Tres pruebas de datos de actividad: respuestas válidas, importe cero, ausencia de registros y fallo al actualizar.
- Dos pruebas de backend: desplazamiento/límite, orden estable, validación de parámetros y roles.
- Compilación TypeScript de la versión acotada y construcción Vite.
- Navegador a 1440 y 390 px: páginas 1–3, última página parcial, actualización fallida y recuperación, regreso al panel visible después de desplazarse, navegación correcta y ausencia del enlace en cuentas de usuario. Sin desbordamiento horizontal ni errores JavaScript.
- Comprobaciones sobre la imagen candidata con datos simulados, sin red ni modificaciones de datos reales.

## Publicación

Fuentes, manifiesto, capturas y herramientas en `tmp/activity-portal-release/`. Se conserva la versión anterior del cliente y se incorporan las dos vistas y el paginador. El backend conserva sus fuentes versionadas y añade únicamente los dos métodos de paginación: no se publican cambios pendientes de facturación, mapas u otros módulos.

La operación crea una copia cifrada y cambia solo las imágenes de cliente y API. No modifica variables, esquema, permisos de base de datos ni configuración del proxy. Registros y resultado en `/opt/watsolution/activity-portal-20261024-v1/`.

Resultado confirmado: rutas públicas disponibles, endpoints privados protegidos y webhook operativo. La consulta paginada se comprobó sobre la base real mediante una transacción de solo lectura. El índice y los archivos publicados coinciden con la versión construida.

- API: `sha256:ab52d588699d811c095b6f4ccf5be3efd8b165d6a82e3b955e09519dfcfeb7b3`.
- Cliente: `sha256:61266cb5506106d8d6530555f017043e83ccddc2605364de6db6e0dc777cf3d1`.
