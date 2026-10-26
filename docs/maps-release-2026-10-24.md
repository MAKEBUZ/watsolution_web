# Mapa y recorridos — 24 de octubre de 2026

Publicado en https://watsolution.online/admin/recorridos, accesible desde los menús administrativos. Solo ROLE_ADMIN puede entrar y usar las API.

## Funcionamiento

1. Buscar un suscriptor por nombre, documento o número de suscriptor.
2. Usar **Ubicar** para consultar su dirección. Confirmar una coincidencia o introducir latitud y longitud manualmente. Revisar las ubicaciones antiguas antes del primer recorrido: ampliar la precisión de la columna no recupera decimales ya perdidos.
3. Seleccionar entre 2 y 25 viviendas con ubicación guardada.
4. Ordenar la primera y última parada; generar el recorrido. OSRM ordena las paradas intermedias. Se muestran trazado, distancia, tiempo estimado de conducción y lista ordenada. No incluye tráfico en tiempo real ni tiempo de visitas.

La búsqueda de direcciones y el cálculo de rutas requieren internet. No se geocodifica automáticamente toda la base ni se usa autocompletado del proveedor.

## Publicación

- API: `watsolution-server:maps-20261024-v1`, SHA256 `f14faab541003056d890c680d12c3eb40568eba8de8f2c66346fed2115ee51ad`.
- Web inicial: `watsolution-client:maps-20261024-v1`, SHA256 `8ee80a2185f31e1319cd06e276b11c54172890b7cd206aa5ebe4cd20c98d3c17`.
- Web final con acceso en menú móvil y APK: `watsolution-client:maps-20261024-android-v1`, SHA256 `41049f7294b95d0e87e85459763c1d2c52b66b78cc1ccaf5e875b5e3120ce912`.
- APK Android publicado: https://watsolution.online/descargas/watsolution-mapas-20261024.apk. Versión 1.0.1 / código 20261025, 118704143 bytes, SHA256 `2c981b7f377e0d7d3729f683edf79c68f9d21516684a6099031c579cfbe2767c`. Firma verificada igual a la actualización anterior; release no depurable y sin archivos .env/almacenes de claves. Instalar como actualización sin desinstalar.
- Manifiesto público: https://watsolution.online/descargas/android.json. Se verificaron el tamaño servido por HTTPS, el manifiesto y el hash dentro de la imagen. Evidencia y rollback de esta última actualización en `/opt/watsolution/maps-20261024-android-v1`.
- Respaldo cifrado previo. Coordenadas de `address` migradas a numeric(10,7), sin borrar datos.
- CSP permite los recursos de CARTO y el worker local de MapLibre. No agrega unsafe-eval.
- Se conservan las páginas y recursos previamente publicados, incluido WhatsApp, condiciones del servicio y acceso al portal.
- Fuentes y pruebas del despliegue en `tmp/maps-release`; evidencia remota privada en `/opt/watsolution/maps-20261024-v1`.
- Reversión: restaurar `compose.rollback.yaml` y el Caddyfile de `baseline.json`, recargar Caddy y levantar API/client anteriores. La ampliación de precisión se conserva: es compatible con la versión anterior y revertirla perdería decimales.

## Validación

- 26 comprobaciones del código compilado: permisos, coordenadas precisas, límites de paradas, inicio/destino, orden intermedio, respuestas inválidas y minimización de datos al proveedor.
- 9 pruebas Jest de experiencia administrativa.
- Prueba real desde AWS con dos lugares públicos de Bogotá: Nominatim y OSRM disponibles, recorrido de 3,005 km. No se enviaron datos de clientes en esa prueba.
- Navegador a 1440 y 390 px con frontend publicado y respuestas de cuenta/datos sintéticas: capas reales, CSP, guardar ubicación, generar recorrido, restricción a administradores y ausencia de desbordamiento horizontal.
- Consulta de producción en transacción de solo lectura: relaciones persona/dirección y precisión de siete decimales correctas.
- Flutter: análisis estático sin incidencias; suite completa con 91 pruebas aprobadas y una omitida preexistente. No había dispositivo Android conectado para una prueba física.

## Proveedores

Actualización posterior en tablet: APK 1.0.1 instalado correctamente sobre la versión anterior en Lenovo TB351FU, conservando la instalación y reconociendo la jornada guardada. La prueba del mapa en el dispositivo permanece pendiente del desbloqueo de identidad por el usuario.

- Web: mapcn/MapLibre; Flutter: MapLibre nativo; mapa base CARTO/OpenStreetMap.
- Nominatim: solo dirección, caché de 24 horas y límite global en el proceso de una solicitud cada 1,1 segundos. Cambiable con `GEOCODING_URL`.
- OSRM: solo coordenadas, hasta 25 paradas, búsqueda de vía limitada a 500 metros, una solicitud cada 1,1 segundos. Cambiable con `ROUTING_URL`.
- El límite es por proceso: antes de replicar el backend, centralizarlo o usar un proveedor propio/contratado.
- Políticas y referencia: https://operations.osmfoundation.org/policies/nominatim/ y https://project-osrm.org/docs/v5.24.0/api/#trip-service.
