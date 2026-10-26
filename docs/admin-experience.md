# Administración, facturación y recorridos

La web incorpora acceso administrativo al portal, notificaciones con lectura y eliminación, informe PDF, actividad y usuarios paginados, búsqueda en el servidor, noticias completas y administración de testimonios. La facturación en punto físico envía la misma operación atómica que Flutter: lectura anterior confirmada, nueva lectura, tarifa y cálculo del consumo. Los reintentos conservan el identificador de la operación para evitar duplicados.

## Base de datos y despliegue

Antes de publicar las nuevas versiones, aplicar `AdminExperience1792882800000` sobre PostgreSQL. Crea `testimonial` y amplía `address.latitude` y `address.longitude` de dos a siete decimales. Las coordenadas antiguas conservan su precisión original; pueden revisarse desde el mapa. No se crean testimonios ficticios.

La migración está registrada en `server/src/secure-migration.ts`, junto a las migraciones aditivas de seguridad existentes. Después de compilar el servidor, configurar `MIGRATION_DATABASE_URL` para el destino revisado y `MIGRATION_TLS=required` cuando corresponda:

```sh
node server/dist/secure-migration.js
```

Ese comando solo comprueba conexión y esquema. Para aplicar, revisar el respaldo, establecer `MIGRATION_BACKUP_REVIEWED=yes` y ejecutar:

```sh
node server/dist/secure-migration.js --apply
```

El historial usa `watsolution_security_migrations`. No utilizar sincronización automática en producción ni redondear nuevamente las coordenadas para revertir. Publicar servidor y cliente compatibles y distribuir la aplicación móvil actualizada. No se ha ejecutado esta migración sobre una base de producción durante el desarrollo.

## Mapa de administración

La web usa el componente oficial [mapcn](https://www.mapcn.dev/) con su licencia MIT en `client/src/app/components/mapcn/LICENSE`, integrado mediante React en Vue. MapLibre y su worker se empaquetan localmente. Flutter usa MapLibre nativo y los mismos endpoints; mapcn es un componente React.

En `/admin/recorridos`, buscar suscriptores, pulsar **Ubicar**, comprobar y confirmar la coincidencia o introducir coordenadas. Seleccionar entre 2 y 25 viviendas y ajustar el inicio y el destino con las flechas. OSRM ordena las paradas intermedias y devuelve la ruta por vías, distancia y tiempo estimado de conducción. Requiere internet; no incluye tráfico en tiempo real ni duración de las visitas. En Flutter: **Cuenta → Mapa y recorridos**.

El acceso está restringido a `ROLE_ADMIN` en interfaz y API. Nominatim recibe únicamente la dirección; OSRM recibe coordenadas. No se envían nombres, documentos ni facturación a esos proveedores. Esta integración fue autorizada expresamente por el responsable del proyecto.

Variables opcionales del servidor:

| Variable | Valor predeterminado | Uso |
| --- | --- | --- |
| `GEOCODING_URL` | `https://nominatim.openstreetmap.org/search` | Endpoint HTTPS compatible con Nominatim |
| `ROUTING_URL` | `https://router.project-osrm.org` | Origen HTTPS compatible con OSRM Trip |

La geocodificación es manual, con caché de 24 horas y límite de una consulta cada 1,1 segundos por proceso. No hay búsqueda automática mientras se escribe ni geocodificación masiva. Para varias instancias, centralizar la limitación y caché o configurar un proveedor propio acorde con la [política de Nominatim](https://operations.osmfoundation.org/policies/nominatim/). Los proveedores públicos pueden limitar el servicio; la interfaz muestra el error y permite revisar las ubicaciones. CARTO y OpenStreetMap se acreditan en ambos mapas.

## Comprobaciones

Se probaron permisos de administrador y aislamiento entre usuarios, notificaciones privadas, publicación de testimonios, cálculo y reintentos de facturación, paginación, contrato de recorridos y contenido enviado a proveedores. Las pruebas de navegador usan datos ficticios y verifican diez flujos, incluida la descarga real del PDF, la vista móvil y el asistente. Los domicilios reales no se utilizaron en pruebas.

Para Android, `maplibre_gl 0.27` requiere un compilador compatible con Java 21. Usar JDK 21 con la versión de Gradle del proyecto al configurar el entorno de compilación.
