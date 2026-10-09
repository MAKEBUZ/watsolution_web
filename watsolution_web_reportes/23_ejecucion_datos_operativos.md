# Ejecución: procedencia de actividad y telemetría

Fecha: 2026-10-05. Continúa [el lote financiero](22_ejecucion_contencion_financiera.md). Tarea T-013 / hallazgo WS-025.

## Cambio implementado

Rama `fix/verified-operational-data`, desde `integration/remediation-phase-1`. Commit de implementación: `629f9edf84ec2548bf5e35cd1554c0f99f59e8f0`.

Actividad deja de mostrar cinco eventos fijos con nombres, facturas, importes y antigüedades inventadas. Consulta `GET api/admin/activity?limit=50`, endpoint existente restringido a ADMIN. La vista informa carga, respuesta vacía y error por separado; muestra fuente y momento de consulta, fecha del registro, descripción, referencia e importe, incluido cero. Al actualizar elimina la lista anterior para no presentar datos obsoletos tras un fallo. Rechaza respuestas sin estructura mínima. El listener de tamaño de pantalla se elimina al desmontar la vista.

El tablero ya no presenta presión de 85%, calidad de agua de 99% ni nivel inicial de tanque de 75%. Muestra «Sin datos verificados», fuente de sensores no integrada, última medición no disponible y calidad no verificada. No abre una conexión de tanque para aparentar actividad en vivo.

El gateway deja de programar temporizadores y generar niveles aleatorios en todos los entornos. Si un cliente conecta directamente al namespace `/tank`, recibe únicamente `tank-status` con estado `unavailable`, calidad `unverified` y fuente, nivel y fecha de medición nulos. No se emite `tank-level` ni una alerta operacional simulada. No se ha agregado una fuente real de sensores.

La portada y su componente hero identifican los gráficos numéricos como demostraciones visuales. Se retiran afirmaciones de monitoreo disponible y se marca pendiente la integración de sensores. Los ejemplos de testimonios quedan identificados como ficticios; no acreditan clientes ni resultados reales.

## Decisión de alcance

La contención elimina la simulación operacional, en lugar de mantener un perfil que pudiera habilitarse accidentalmente en producción. Solo permanecen ilustraciones explícitas de presentación. Esto conserva el carácter de prototipo del trabajo de grado. Una futura integración necesita fuente autenticada, unidades, calidad, fecha de medición y criterio de caducidad antes de mostrar porcentajes o «En vivo». La aprobación de negocio y la selección del sensor siguen pendientes; este commit no las sustituye.

## Verificaciones y límites

- Backend: 112 pruebas en 16 suites. El caso nuevo del gateway exige un único estado sin medición y ausencia de emisiones adicionales o temporizadores después de avanzar un minuto simulado.
- Frontend: 203 pruebas en 41 archivos. Los casos nuevos montan las vistas y verifican actividad desde API, importe cero, procedencia, estado vacío, error al actualizar y ausencia de porcentajes ficticios ante fallo de API.
- TypeScript del servidor aprobado. Build frontend aprobado, con la advertencia existente de chunks mayores de 500 kB.
- Jest encontró inicialmente un error EPERM al resolver el temporal del sandbox; la ejecución con permisos ampliados terminó correctamente. No se contabiliza aquel fallo de infraestructura como regresión funcional.

Evidencias locales: [backend](ejecucion/2026-10-05-lote-06/backend.log), [frontend](ejecucion/2026-10-05-lote-06/frontend.log), [TypeScript](ejecucion/2026-10-05-lote-06/typescript.log), [build](ejecucion/2026-10-05-lote-06/build.log).

Las pruebas de componentes simulan la API; el caso del gateway invoca su manejador directamente, no certifica transporte Socket.IO por Nginx. La actividad procede de registros de la aplicación, lo que no convierte esos registros en una auditoría completa o una medición de sensores verificada. No se alteran registros históricos ni se certifica su procedencia histórica. La cobertura de escritura de eventos sigue siendo una tarea posterior.

Primera ejecución CI: [GitHub Actions 37406942953](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37406942953), SHA `629f9ed`. PostgreSQL aprobó 13 casos. El job validate se detuvo en npm audit antes de ejecutar TypeScript, pruebas y build: 4 dependencias con severidad alta y 1 crítica (incluidas propagaciones). Se conserva el resultado en ci-inicial.json y el diagnóstico en audit.json. Los resultados locales anteriores no se atribuyen a aquel job fallido.

## Cierre y continuidad

T-013 queda implementada como contención, pendiente de inspección visual autenticada y validación del despliegue. T-034 conserva los ensayos de transporte/reconexión y proxy. T-014 conserva navegador HTTPS, autenticación persistida y staging. No se declara terminado el planning de 77 tareas.

Los commits usan MAKEBUZ, sin coautoría del asistente. Se preservan cambios locales anteriores y los reportes históricos. No se despliega ni se promueven main/develop. Un despliegue posterior debe reconstruir los assets: los archivos compilados locales previos pueden conservar el comportamiento antiguo.

Rollback operativo: mantener la telemetría como no disponible; no restaurar porcentajes aleatorios ni eventos fijos. Si falla la consulta de actividad, conservar el mensaje de error y reparar la fuente/API.

## Corrección del bloqueo de dependencias

La auditoría vigente detectó avisos en @vue/server-renderer (propagados a Vue/compat), proxy-addr y source-map-js. Se actualizan Vue y compat dentro de la línea 3.5 y las dependencias transitivas compatibles; no se baja el umbral high ni se acepta un downgrade de Bootstrap-Vue. La actualización se registra en un commit separado y exige una nueva ejecución completa.

Commit de dependencias: `ae0e322`. Vue/compat y sus paquetes asociados pasan de 3.5.13 a 3.5.43; proxy-addr de 2.0.7 a 2.0.8 y source-map-js de 1.2.1 a 1.2.2. El lockfile también actualiza dependencias de compilación de Vue (Babel/entities). Se revisó el diff; no hay modificación del package.json raíz ni scripts de instalación ejecutados.

La auditoría de producción final termina con código 0: cero altas/críticas, tres bajas y dos moderadas. Evidencia: [audit-final.json](ejecucion/2026-10-05-lote-06/audit-final.json). Permanecen avisos bajos en la cadena Bootstrap-Vue/Vue 2 y moderados en js-yaml/Swagger. La auditoría completa que incluye herramientas de desarrollo conserva avisos adicionales; este lote no equivale al cierre integral de dependencias.

Segunda ejecución: [37407529270](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37407529270), SHA `ae0e322`. Pasaron auditoría, TypeScript, backend, frontend y PostgreSQL, pero falló el build. El nuevo árbol instala compat dentro del workspace client; un alias relativo de Vite no lo resolvía desde Pinia ubicado en la raíz. Se corrigió el alias mediante `fileURLToPath(import.meta.resolve(...))`, sin asumir dónde npm coloca el paquete. Evidencia histórica: ci-dependencias.json.

## Resultado final de CI e integración

[GitHub Actions 37407868375](https://github.com/MAKEBUZ/watsolution_web/actions/runs/37407868375), commit `18c3bede4d514ff884e734af3c25c5353fe2c7c8`: los jobs `validate` y `postgres-sessions` finalizaron en success. Pasaron instalación, auditoría de producción con umbral high, TypeScript, 112 pruebas backend, 203 frontend, 13 casos PostgreSQL y build. Evidencia final: [ci.json](ejecucion/2026-10-05-lote-06/ci.json). El frontend local se volvió a ejecutar con Vue actualizado: [frontend-final.log](ejecucion/2026-10-05-lote-06/frontend-final.log). El build corregido pasó: [build-final.log](ejecucion/2026-10-05-lote-06/build-final.log).

Integración publicada: `f66b6900bdfd2f38606b9a98e69728616bc31d15` en `integration/remediation-phase-1`. Su árbol es idéntico al commit probado. La rama `fix/verified-operational-data` apunta a `18c3bed`. Las referencias remotas se comprobaron; main/develop permanecen en `95606e1` / `595a7b6`.

Seguimiento: [77 tareas](ejecucion/2026-10-05-lote-06/estado-tareas.json), [verificación](ejecucion/2026-10-05-lote-06/verificacion.json), [manifiesto SHA-256](ejecucion/2026-10-05-lote-06/manifest.json). T-013 tiene contención implementada y regresión aprobada; mantiene sus verificaciones operativas pendientes. Siguiente bloque recomendado del planning: ampliar T-014 para reducir la dependencia de identidad simulada en los recorridos HTTP, sin declarar completo HTTPS/staging.
