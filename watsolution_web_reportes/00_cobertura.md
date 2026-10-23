# Inventario y cobertura

Fecha: 5 de octubre de 2026. Raíz: C:/Users/macab/Desktop/WATSOLUTION/watsolution_web.

**455 archivos, 93 directorios. Estados finales: {"revisado":354,"parcial":101,"no revisado":0}. Cero elementos pendientes de clasificación.** «Revisado» significa análisis estático indicado, no garantía de ausencia de defectos ni revisión semántica manual de cada rama. «Parcial» conserva explícitamente límites visuales, de ejecución, terceros o binarios. No se presenta cobertura estática como certificación operativa.

Inventario inicial con SHA-256 de cada archivo: [evidencias/inventario-inicial.json](evidencias/inventario-inicial.json). Hallazgos y probes: [evidencias/hallazgos.json](evidencias/hallazgos.json), [evidencias/probes-resultados.json](evidencias/probes-resultados.json).

## Exclusiones y estado inicial

Excluidos de revisión fuente: .git, client/node_modules, node_modules, server/dist, server/node_modules. Son dependencias instaladas, metadatos Git y build previo; node_modules se usó para ejecutar herramientas locales, no para afirmar auditoría de código de terceros. Git se revisó separadamente para estado e historial/secretos (66 commits, 427 blobs candidatos). vendor no existe en este árbol; client/src/content/scss/vendor.scss sí está incluido. Reportes se excluyen de su propio inventario. tmp se conservó en inventario para no ocultar resultados previos.

El árbol ya contenía modificaciones, archivos nuevos y eliminaciones antes de comenzar: [git-status-inicial.txt](evidencias/git-status-inicial.txt). No se restauraron, editaron ni confirmaron. El cierre compara hashes y rutas; no basta con que Git muestre un árbol sucio.

## Fases realizadas

0. Inventario completo y huellas.
1. Arquitectura, configuración, módulos y rutas.
2. Seguridad, identidad, permisos, pagos e historial local.
3. Backend, contratos y probes sintéticos.
4. Entidades, migraciones y consistencia (sin ejecutar BD).
5. Frontend, UI y accesibilidad estática.
6. Build/tamaños y patrones de consultas.
7. SEO y recursos del build.
8. Calidad, AST, lint y 224 pruebas unitarias.
9. Dependencias/licencias del lock; online bloqueado.
10. Docker/Railway/CI e infraestructura declarada.
11. Política, datos, retención y fuentes oficiales.
12. Logging, documentación y plan.

## Registro por archivo

| Archivo | Categoría | Estado | Notas |
|---|---|---|---|
| .dockerignore | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .gitattributes | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .github/workflows/security-checks.yml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .gitignore | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .jhipster/Address.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .jhipster/Invoice.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .jhipster/Meter.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .jhipster/Person.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .prettierignore | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .prettierrc | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| .yo-rc.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/.dockerignore | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/.postcssrc.js | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/docker-entrypoint.sh | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/Dockerfile | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/eslint.config.mjs | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/nginx.conf | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-037. |
| client/package.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/railway.toml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/src/404.html | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/account.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/account.service.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/activate/activate.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/activate/activate.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/activate/activate.service.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/activate/activate.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/change-password/change-password.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/change-password/change-password.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/change-password/change-password.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/login-form/login-form.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/login-form/login-form.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/login-form/login-form.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/login.service.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/register/register.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/register/register.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/register/register.service.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/register/register.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/reset-password/finish/reset-password-finish.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/reset-password/finish/reset-password-finish.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/reset-password/finish/reset-password-finish.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/reset-password/init/reset-password-init.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/reset-password/init/reset-password-init.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/reset-password/init/reset-password-init.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/account/settings/settings.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/account/settings/settings.component.ts | Frontend / account | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/account/settings/settings.vue | Frontend / account | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-011. |
| client/src/app/admin/docs/docs.component.ts | Frontend / admin | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/admin/docs/docs.vue | Frontend / admin | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/admin/user-management/user-management-edit.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/admin/user-management/user-management-edit.component.ts | Frontend / admin | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/admin/user-management/user-management-edit.vue | Frontend / admin | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/admin/user-management/user-management-view.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/admin/user-management/user-management-view.component.ts | Frontend / admin | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/admin/user-management/user-management-view.vue | Frontend / admin | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/admin/user-management/user-management.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/admin/user-management/user-management.component.ts | Frontend / admin | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/admin/user-management/user-management.service.ts | Frontend / admin | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/admin/user-management/user-management.vue | Frontend / admin | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/app.component.ts | Frontend / app.component.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/app.vue | Frontend / app.vue | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/composables/useNotifications.ts | Frontend / composables | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/constants.ts | Frontend / constants.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/core/chatbot/chatbot.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-006. |
| client/src/app/core/error/error.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/core/error/error.component.ts | Frontend / core | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/core/error/error.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/home/features.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/home/hero.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/home/home.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/core/home/home.component.ts | Frontend / core | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/core/home/home.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/jhi-footer/jhi-footer.component.ts | Frontend / core | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/core/jhi-footer/jhi-footer.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/jhi-navbar/jhi-navbar.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/core/jhi-navbar/jhi-navbar.component.ts | Frontend / core | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/core/jhi-navbar/jhi-navbar.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/layout/footer.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/layout/header.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/notifications/notification-bell.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/core/ribbon/ribbon.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/core/ribbon/ribbon.component.ts | Frontend / core | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/core/ribbon/ribbon.vue | Frontend / core | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/declarations.d.ts | Frontend / declarations.d.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/address/address-details.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/address/address-details.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/address/address-details.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/address/address-update.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/address/address-update.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/address/address-update.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/address/address.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/address/address.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/address/address.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/address/address.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/address/address.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/entities-menu.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/entities-menu.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/entities.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/entities.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/invoice/invoice-details.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/invoice/invoice-details.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/invoice/invoice-details.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/invoice/invoice-payment-result.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/invoice/invoice-payment-result.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/invoice/invoice-update.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/invoice/invoice-update.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/invoice/invoice-update.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/invoice/invoice.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/invoice/invoice.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/invoice/invoice.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/invoice/invoice.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/invoice/invoice.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/meter/meter-details.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/meter/meter-details.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/meter/meter-details.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/meter/meter-update.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/meter/meter-update.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/meter/meter-update.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/meter/meter.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/meter/meter.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/meter/meter.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/meter/meter.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/meter/meter.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/noticia/noticia.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/person/person-details.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/person/person-details.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/person/person-details.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/person/person-update.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/person/person-update.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/person/person-update.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/person/person.component.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/person/person.component.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/person/person.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/entities/person/person.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/person/person.vue | Frontend / entities | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/entities/reporte/reporte.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/entities/user/user.service.ts | Frontend / entities | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/locale/translation.service.ts | Frontend / locale | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/main.ts | Frontend / main.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Hallazgos: WS-033. |
| client/src/app/router/account.ts | Frontend / router | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/router/admin.ts | Frontend / router | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/router/entities.ts | Frontend / router | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Hallazgos: WS-027. |
| client/src/app/router/index.ts | Frontend / router | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/router/pages.ts | Frontend / router | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/router/watsolution.ts | Frontend / router | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/services/admin.service.ts | Frontend / services | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/services/portal.service.ts | Frontend / services | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/alert/alert.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/shared/alert/alert.service.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/composables/date-format.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/composables/index.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/composables/validation.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/computables/arrays.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/computables/index.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/axios-interceptor.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/shared/config/axios-interceptor.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/config-bootstrap-vue.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/config.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/dayjs.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/languages.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/store/account-store.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Hallazgos: WS-007. |
| client/src/app/shared/config/store/news-store.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/store/translation-store.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/config/web-session.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/shared/config/web-session.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/data/data-utils.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/shared/data/data-utils.service.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/jhi-item-count.component.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/jhi-item-count.vue | Frontend / shared | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/shared/model/activity-log.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/address.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/activity-action.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/invoice-status.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/noticia-category.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/noticia-status.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/person-status.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/reporte-status.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/enumerations/reporte-type.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/invoice.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/meter.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/noticia.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/person.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/portal-data.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/reporte.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/model/user.model.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/security/authority.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/sort/jhi-sort-indicator.component.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shared/sort/jhi-sort-indicator.vue | Frontend / shared | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/shared/sort/sorts.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| client/src/app/shared/sort/sorts.ts | Frontend / shared | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/shims-vue.d.ts | Frontend / shims-vue.d.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/store.ts | Frontend / store.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/test-setup.ts | Frontend / test-setup.ts | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-actividad.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-actividad.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-025. |
| client/src/app/views/admin/admin-facturacion.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-facturacion.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-024, WS-026. |
| client/src/app/views/admin/admin-noticias.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-noticias.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/admin/admin-panel.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-panel.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/admin/admin-portal.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/admin/admin-resumen.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-resumen.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/admin/admin-usuarios.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/admin/admin-usuarios.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-028, WS-029. |
| client/src/app/views/login/login.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/login/login.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-040. |
| client/src/app/views/noticias/centro-noticias.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/noticias/centro-noticias.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/pagos/pagos.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Hallazgos: WS-046. |
| client/src/app/views/pagos/pagos.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/politica/politica-privacidad.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-039. |
| client/src/app/views/portal/mi-consumo.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/app/views/portal/mis-facturas.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-047. |
| client/src/app/views/portal/portal-dashboard.component.ts | Frontend / views | revisado | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. |
| client/src/app/views/portal/portal-dashboard.vue | Frontend / views | parcial | Análisis estático AST/señales, lint y grafo de rutas; compilación validada. Lectura manual concentrada en flujos de identidad, pagos y vistas activas. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-030. |
| client/src/content/css/loading.css | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/images/jhipster_family_member_0_head-192.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_0_head-256.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_0_head-384.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_0_head-512.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_0.svg | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_1_head-192.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_1_head-256.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_1_head-384.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_1_head-512.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_1.svg | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_2_head-192.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_2_head-256.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_2_head-384.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_2_head-512.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_2.svg | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_3_head-192.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_3_head-256.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_3_head-384.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_3_head-512.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/jhipster_family_member_3.svg | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/images/logo-jhipster.png | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/content/scss/_bootstrap-variables.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/_mixins.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/_variables.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/_watsolution-mixins.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/_watsolution-variables.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/global.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/main.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/content/scss/vendor.scss | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/favicon.ico | Asset gráfico | parcial | Tamaño/hash/formato y referencias inventariados; SVG inspeccionado para script/enlaces. Sin evaluación visual ni autoría/licencia del gráfico. |
| client/src/i18n/es/activate.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/address.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/error.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/es.js | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/global.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/home.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/invoice.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/invoiceStatus.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/login.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/meter.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/password.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/person.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/personStatus.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/register.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/reset.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/sessions.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/settings.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/i18n/es/user-management.json | Internacionalización | revisado | Todos los JSON parseados y claves/señales revisadas; contraste puntual con vistas y validación de interpolación HTML. Traducción lingüística integral no certificada. |
| client/src/index.html | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. Hallazgos: WS-032. |
| client/src/manifest.webapp | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/src/robots.txt | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/src/swagger-ui/index.html | Configuración / documentación | parcial | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Marcado/scripts/estilos inspeccionados estáticamente; apariencia, teclado, contraste y responsive no verificados en navegador. |
| client/src/WEB-INF/web.xml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/tsconfig.app.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/tsconfig.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/tsconfig.node.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/tsconfig.vitest.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| client/vite.config.mts | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-031. |
| client/vitest.config.mts | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| docker/app.yml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-038. |
| docker/postgresql.yml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| docker/prometheus/prometheus.yml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-042. |
| docker/services.yml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| docker/sonar.yml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| Dockerfile | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-036. |
| package-lock.json | Dependencias | parcial | Todas las 1.933 entradas analizadas: versiones, licencias, deprecated e integridad declarada. CVE actuales bloqueados por revisión automática de envío a npm. Hallazgos: WS-034. |
| package.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| README.md | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-045. |
| server/.dockerignore | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/.env | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/Dockerfile | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/e2e/account.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. Hallazgos: WS-043. |
| server/e2e/address.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/app.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/invoice.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/jest.e2e.config.json | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/meter.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/person.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/setup.test.js | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/e2e/user.e2e-spec.ts | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| server/eslint.config.mjs | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/nest-cli.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/ormconfig.ts | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/package.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. Hallazgos: WS-035. |
| server/railway.toml | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/README.md | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/scripts/copy-resources.ts | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/scripts/entrypoint.sh | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/sonar-project.properties | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/src/app.module.ts | Backend / app.module.ts | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/client/header-util.ts | Backend / client | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-023. |
| server/src/client/interceptors/logging.interceptor.ts | Backend / client | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/client/request.ts | Backend / client | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/config.ts | Backend / config.ts | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/config/application-dev.yml | Backend / config | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/config/application-prod.yml | Backend / config | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/config/application-test.yml | Backend / config | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/config/application.yml | Backend / config | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/activity-log.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/address.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/auth-session.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/authority.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/base/base.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/base/pagination.entity.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/domain/base/pagination.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-022. |
| server/src/domain/enumeration/activity-action.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/enumeration/invoice-status.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/enumeration/noticia-category.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/enumeration/noticia-status.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/enumeration/person-status.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/enumeration/reporte-status.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/enumeration/reporte-type.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/invoice.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-016. |
| server/src/domain/meter.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/mobile-operation.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/noticia.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/notification.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/person.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-015. |
| server/src/domain/reporte.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/domain/user.entity.ts | Backend / domain | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/main.ts | Backend / main.ts | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-012. |
| server/src/migrations/1570200270081-CreateTables.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-014. |
| server/src/migrations/1570200490072-SeedUsersRoles.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-009. |
| server/src/migrations/1747000000000-AddInvoiceRateFields.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/migrations/1747000000001-FixInvoiceColumns.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/migrations/1748000000000-AddBoldFieldsToInvoice.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/migrations/1749000000001-AddDocumentEmbeddings.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/migrations/1749100000000-AddNotifications.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/migrations/1791158400000-SecureMobile.ts | Backend / migrations | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/activity-log.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/address.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/admin.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/ai.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/auth.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/bold.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/invoice.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/meter.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/mobile.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/noticia.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/notification.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/person.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/portal.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/reporte.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/module/user.module.ts | Backend / module | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/orm.config.ts | Backend / orm.config.ts | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/secure-migration.ts | Backend / secure-migration.ts | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/decorators/auth-user.decorator.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/decorators/roles.decorator.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/guards/auth.guard.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/guards/record-access.guard.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/guards/roles.guard.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/index.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/jwt-settings.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/login-rate-limit.service.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-013. |
| server/src/security/passport.jwt.strategy.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/security/passport.jwt.strategy.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/password-policy.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/password-util.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/payload.interface.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/role-type.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/security/security-baseline.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/security/web-session.ts | Backend / security | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/activity-log.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/address.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/admin-stats.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-018. |
| server/src/service/ai.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/auth.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/billing.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/service/billing.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-019. |
| server/src/service/bold.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/service/bold.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-005. |
| server/src/service/bucket.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/activity-log.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/address.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/admin-stats.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/base.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/billing-form.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/create-person-with-account.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/invoice.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-010. |
| server/src/service/dto/meter.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/noticia.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/password-change.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/person.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/portal-data.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/reporte.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/user-login.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/dto/user.dto.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/invoice-pdf.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/invoice.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-008. |
| server/src/service/mapper/activity-log.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/address.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/invoice.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/meter.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/noticia.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/person.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/reporte.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mapper/user.mapper.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/meter.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/mobile.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/service/mobile.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/noticia.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/notification.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-020. |
| server/src/service/person.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/portal.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-001. |
| server/src/service/privacy.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/service/reporte.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/service/session.service.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/src/service/session.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-041. |
| server/src/service/user.service.ts | Backend / service | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/swagger.ts | Backend / swagger.ts | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/account.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/address.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/admin.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/ai.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/bold.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/invoice.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-002, WS-021. |
| server/src/web/rest/management.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/meter.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/mobile.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/noticia.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/notification.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/person.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. Hallazgos: WS-004, WS-017. |
| server/src/web/rest/portal.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/public-noticias.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/public.user.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/reporte.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/session.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/tank-level.gateway.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/user.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/src/web/rest/user.jwt.controller.ts | Backend / web | revisado | Inspección estática, AST y contraste de rutas/servicios/modelo; tsc backend aprobado. Sin BD ni HTTP reales. |
| server/test/admin/management.controller.spec.ts | Pruebas unitarias | revisado | Incluido en suites existentes ejecutadas: 42 backend / 182 frontend, sin porcentaje de cobertura. |
| server/tsconfig.build.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/tsconfig.json | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| server/webpack.server.prod.config.js | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| sonar-project.properties | Configuración / documentación | revisado | Revisión estática de contenido/configuración; ejecución de despliegue no realizada. |
| test/watsolution-test-plan.jmx | Pruebas de integración/carga | parcial | Inspección estática. No ejecutado: inicializa/migra/escribe BD o genera carga; prohibición expresa de migraciones y sin entorno aislado. |
| tmp/.vite-cache/results.json | Resultado/cache preexistente | parcial | Inventariado y preservado; no usado como evidencia de ejecución actual. Resultado generado/caché, sin revisión semántica adicional. |
| tmp/test-results/TESTS-results-vitest.xml | Resultado/cache preexistente | parcial | Inventariado y preservado; no usado como evidencia de ejecución actual. Resultado generado/caché, sin revisión semántica adicional. |

## Directorios incluidos

- .github
- .github/workflows
- .jhipster
- client
- client/src
- client/src/app
- client/src/app/account
- client/src/app/account/activate
- client/src/app/account/change-password
- client/src/app/account/login-form
- client/src/app/account/register
- client/src/app/account/reset-password
- client/src/app/account/reset-password/finish
- client/src/app/account/reset-password/init
- client/src/app/account/settings
- client/src/app/admin
- client/src/app/admin/docs
- client/src/app/admin/user-management
- client/src/app/composables
- client/src/app/core
- client/src/app/core/chatbot
- client/src/app/core/error
- client/src/app/core/home
- client/src/app/core/jhi-footer
- client/src/app/core/jhi-navbar
- client/src/app/core/layout
- client/src/app/core/notifications
- client/src/app/core/ribbon
- client/src/app/entities
- client/src/app/entities/address
- client/src/app/entities/invoice
- client/src/app/entities/meter
- client/src/app/entities/noticia
- client/src/app/entities/person
- client/src/app/entities/reporte
- client/src/app/entities/user
- client/src/app/locale
- client/src/app/router
- client/src/app/services
- client/src/app/shared
- client/src/app/shared/alert
- client/src/app/shared/composables
- client/src/app/shared/computables
- client/src/app/shared/config
- client/src/app/shared/config/store
- client/src/app/shared/data
- client/src/app/shared/model
- client/src/app/shared/model/enumerations
- client/src/app/shared/security
- client/src/app/shared/sort
- client/src/app/views
- client/src/app/views/admin
- client/src/app/views/login
- client/src/app/views/noticias
- client/src/app/views/pagos
- client/src/app/views/politica
- client/src/app/views/portal
- client/src/content
- client/src/content/css
- client/src/content/images
- client/src/content/scss
- client/src/i18n
- client/src/i18n/es
- client/src/swagger-ui
- client/src/WEB-INF
- docker
- docker/prometheus
- server
- server/e2e
- server/scripts
- server/src
- server/src/client
- server/src/client/interceptors
- server/src/config
- server/src/domain
- server/src/domain/base
- server/src/domain/enumeration
- server/src/migrations
- server/src/module
- server/src/security
- server/src/security/decorators
- server/src/security/guards
- server/src/service
- server/src/service/dto
- server/src/service/mapper
- server/src/web
- server/src/web/rest
- server/test
- server/test/admin
- test
- tmp
- tmp/.vite-cache
- tmp/test-results

## No verificado

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.

## Cierre de integridad

La comparación final de los 455 archivos originales por SHA-256 no detectó modificaciones ni eliminaciones; tampoco hay archivos nuevos fuera de reportes en el inventario ni diferencias adicionales en el estado Git. Existen los 19 entregables obligatorios, los 47 hallazgos aparecen exactamente una vez con su plantilla y no quedan estados pendientes de clasificación. Se mantuvieron 101 revisiones parciales con motivo explícito. El control de valores históricos conocidos no encontró secretos completos en los entregables. Alcance exacto y exclusiones: [verificacion-final.json](evidencias/verificacion-final.json).
