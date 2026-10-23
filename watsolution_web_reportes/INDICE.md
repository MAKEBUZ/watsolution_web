# Auditoría integral de watsolution_web

Fecha: 5 de octubre de 2026. 47 hallazgos únicos. {"Crítica":0,"Alta":10,"Media":30,"Baja":7,"Informativa":0}.

Comenzar por [resumen ejecutivo](01_resumen_ejecutivo.md) y [plan de remediación](17_plan_de_remediacion.md).

## Archivos solicitados

- [00_cobertura.md](00_cobertura.md)
- [01_resumen_ejecutivo.md](01_resumen_ejecutivo.md)
- [02_arquitectura.md](02_arquitectura.md)
- [03_seguridad.md](03_seguridad.md)
- [04_backend_api.md](04_backend_api.md)
- [05_base_de_datos.md](05_base_de_datos.md)
- [06_frontend_ui_ux.md](06_frontend_ui_ux.md)
- [07_accesibilidad.md](07_accesibilidad.md)
- [08_rendimiento.md](08_rendimiento.md)
- [09_seo_y_metadatos.md](09_seo_y_metadatos.md)
- [10_calidad_de_codigo.md](10_calidad_de_codigo.md)
- [11_pruebas_testing.md](11_pruebas_testing.md)
- [12_dependencias_licencias.md](12_dependencias_licencias.md)
- [13_devops_infra_cicd.md](13_devops_infra_cicd.md)
- [14_privacidad_legal.md](14_privacidad_legal.md)
- [15_observabilidad_errores.md](15_observabilidad_errores.md)
- [16_documentacion.md](16_documentacion.md)
- [17_plan_de_remediacion.md](17_plan_de_remediacion.md)
- [18_hallazgos.csv](18_hallazgos.csv)

## Evidencias principales

- [Inventario y hashes iniciales](evidencias/inventario-inicial.json)
- [Análisis por archivo](evidencias/analisis-por-archivo.json)
- [80 rutas API](evidencias/rutas-api.md)
- [Dependencias completas](evidencias/dependencias-lock.csv)
- [Pruebas sintéticas](evidencias/probes-resultados.json)
- [Jest](evidencias/jest.log), [Vitest](evidencias/frontend.log), [build](evidencias/build.log), [lint](evidencias/lint-resumen.json)
- [Secretos históricos enmascarados](evidencias/secretos-confirmados.json)
- [Verificación final de integridad](evidencias/verificacion-final.json)

Los scripts auxiliares y todos sus resultados viven en evidencias/. No ejecutar el runner de dependencias sin autorización para enviar metadata a npm; el permiso fue rechazado automáticamente.
