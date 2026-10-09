# Dependencias y licencias

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

Se procesaron todas las 1.933 entradas de packages del package-lock.json. Incluyen workspaces y enlaces; por ello no equivalen a paquetes únicos. Inventario transitivo completo: [dependencias-lock.csv](evidencias/dependencias-lock.csv) y JSON. Se incluye al final la tabla de dependencias directas por workspace y tipo. Versiones instaladas pueden diferir de rangos; se usaron resoluciones del lock para describir stack.

El lock contiene 27 entradas deprecated, con duplicados por árbol. No se tomó el texto deprecation como prueba de CVE explotable. **Versiones más recientes, paquetes abandonados sin aviso local y vulnerabilidades vigentes: No verificado** por bloqueo de consulta de npm. No se ejecutó audit fix, npm install ni npm update.

Licencias: metadata local, no verificación jurídica de todos los textos/licencias de assets. MIT/ISC/Apache/BSD predominan; hay CC-BY para iconos/datos y LGPL en scanner de desarrollo. Licencia no declarada en lock no equivale a ausencia de licencia; enlaces internos deben resolverse al workspace. No se concluye que GPL/LGPL prohíban uso comercial.

### [WS-034] El lock conserva componentes marcados como no mantenidos
- **Categoría:** Dependencias
- **Severidad:** Media
- **Ubicación:** package-lock.json:1
- **Evidencia:**

```text
1: {
2:   "name": "watsolution",
3:   "version": "0.0.0",
4:   "lockfileVersion": 3,
5:   "requires": true,
6:   "packages": {
7:     "": {
```

Inventario completo: evidencias/dependencias-lock.csv (1.933 entradas de lock, incluyendo workspaces/enlaces; no 1.933 paquetes únicos).

- **Impacto:** El propio lock marca Bootstrap 4.6.2, Vue 2.7.16 transitivo y otras dependencias como deprecated. No se concluye que cada una sea explotable. La auditoría vigente de CVE no se completó porque la consulta a npm fue rechazada.
- **Recomendación:** Planificar migración desde BootstrapVue/compat y revisar cadenas transitivas; autorizar un escaneo actualizado y priorizar vulnerabilidades realmente alcanzables, separando runtime y desarrollo.
- **Esfuerzo estimado:** Alto

### [WS-035] Licencias del producto inconsistentes y atribuciones sin consolidar
- **Categoría:** Licencias
- **Severidad:** Baja
- **Ubicación:** server/package.json:2
- **Evidencia:**

```text
2:   "name": "watsolution-server",
3:   "version": "0.0.1",
4:   "description": "",
5:   "license": "MIT",
6:   "author": "",
7:   "type": "commonjs",
```

- **Impacto:** Servidor declara MIT, raíz y cliente UNLICENSED; no aparece archivo LICENSE del producto en inventario. El lock incluye LGPL-3.0-only en herramienta de desarrollo, CC-BY y entradas sin licencia declarada. Eso no demuestra incompatibilidad comercial por sí solo.
- **Recomendación:** Definir la licencia propia; recopilar textos de licencias y avisos de dependencias distribuidas, distinguiendo herramientas y enlaces de workspace. Revisar obligaciones según forma de distribución con asesoría competente.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.

## Dependencias directas declaradas

| Workspace | Tipo | Paquete | Rango |
|---|---|---|---|
| . | devDependencies | @eslint/js | 9.23.0 |
| . | devDependencies | browser-sync-client | 3.0.4 |
| . | devDependencies | eslint | 9.14.0 |
| . | devDependencies | eslint-config-prettier | 10.1.1 |
| . | devDependencies | generator-jhipster | 8.10.0 |
| . | devDependencies | generator-jhipster-nodejs | 3.2.0 |
| . | devDependencies | globals | 16.0.0 |
| . | devDependencies | prettier | 3.5.3 |
| . | devDependencies | prettier-plugin-packagejson | 2.5.10 |
| . | devDependencies | typescript-eslint | 8.29.0 |
| server | dependencies | @aws-sdk/client-s3 | ^3.1045.0 |
| server | dependencies | @aws-sdk/s3-request-presigner | ^3.1045.0 |
| server | dependencies | @nestjs/common | ^11.2.7 |
| server | dependencies | @nestjs/core | ^11.2.7 |
| server | dependencies | @nestjs/jwt | 11.0.0 |
| server | dependencies | @nestjs/passport | 11.0.5 |
| server | dependencies | @nestjs/platform-express | ^11.2.7 |
| server | dependencies | @nestjs/platform-socket.io | ^11.1.19 |
| server | dependencies | @nestjs/schedule | ^6.1.3 |
| server | dependencies | @nestjs/serve-static | ^5.0.5 |
| server | dependencies | @nestjs/swagger | ^11.4.7 |
| server | dependencies | @nestjs/typeorm | 11.0.0 |
| server | dependencies | @nestjs/websockets | ^11.1.19 |
| server | dependencies | @types/pdfkit | ^0.17.6 |
| server | dependencies | @types/qrcode | ^1.5.6 |
| server | dependencies | bcrypt | ^6.0.0 |
| server | dependencies | class-transformer | 0.5.1 |
| server | dependencies | class-validator | 0.14.1 |
| server | dependencies | dotenv | 16.4.7 |
| server | dependencies | js-yaml | ^4.3.2 |
| server | dependencies | openai | ^6.39.0 |
| server | dependencies | passport | 0.7.0 |
| server | dependencies | passport-jwt | 4.0.1 |
| server | dependencies | pdfkit | ^0.18.0 |
| server | dependencies | pg | 8.14.1 |
| server | dependencies | qrcode | ^1.5.4 |
| server | dependencies | reflect-metadata | 0.2.2 |
| server | dependencies | rxjs | 7.8.2 |
| server | dependencies | socket.io | ^4.8.3 |
| server | dependencies | sqlite3 | ^6.0.1 |
| server | dependencies | swagger-ui-express | 5.0.1 |
| server | dependencies | typeorm | ^0.3.31 |
| server | dependencies | typeorm-encrypted | 0.8.0 |
| server | devDependencies | @jest/globals | 29.7.0 |
| server | devDependencies | @nestjs/testing | 11.0.12 |
| server | devDependencies | @types/bcrypt | 5.0.2 |
| server | devDependencies | @types/express | 5.0.1 |
| server | devDependencies | @types/express-serve-static-core | 5.0.6 |
| server | devDependencies | @types/jest | 29.5.14 |
| server | devDependencies | @types/node | 20.11.25 |
| server | devDependencies | @types/passport-jwt | 4.0.1 |
| server | devDependencies | @types/superagent | 8.1.9 |
| server | devDependencies | @types/supertest | 6.0.3 |
| server | devDependencies | browser-sync-client | 3.0.4 |
| server | devDependencies | eslint | 9.14.0 |
| server | devDependencies | eslint-config-prettier | 10.1.1 |
| server | devDependencies | eslint-plugin-prettier | 5.2.6 |
| server | devDependencies | jest | 29.7.0 |
| server | devDependencies | nodemon | 3.1.9 |
| server | devDependencies | rimraf | 5.0.10 |
| server | devDependencies | sonarqube-scanner | 4.3.0 |
| server | devDependencies | supertest | 7.1.0 |
| server | devDependencies | ts-jest | 29.3.1 |
| server | devDependencies | ts-node | 10.9.2 |
| server | devDependencies | tsc-watch | 6.2.1 |
| server | devDependencies | tsconfig-paths | 4.2.0 |
| server | devDependencies | typescript | 5.8.2 |
| client | dependencies | @fortawesome/fontawesome-svg-core | 6.7.2 |
| client | dependencies | @fortawesome/free-solid-svg-icons | 6.7.2 |
| client | dependencies | @fortawesome/vue-fontawesome | 3.0.8 |
| client | dependencies | @vue/compat | 3.5.13 |
| client | dependencies | @vuelidate/core | 2.0.3 |
| client | dependencies | @vuelidate/validators | 2.0.4 |
| client | dependencies | @vueuse/core | 13.0.0 |
| client | dependencies | axios | ^1.20.0 |
| client | dependencies | bootstrap | 4.6.2 |
| client | dependencies | bootstrap-vue | 2.23.1 |
| client | dependencies | bootswatch | 4.6.2 |
| client | dependencies | chart.js | ^4.5.1 |
| client | dependencies | date-fns | ^4.1.0 |
| client | dependencies | dayjs | 1.11.13 |
| client | dependencies | deepmerge | 4.3.1 |
| client | dependencies | jspdf | ^4.2.1 |
| client | dependencies | jspdf-autotable | ^5.0.7 |
| client | dependencies | lucide-vue-next | ^1.0.0 |
| client | dependencies | pinia | 3.0.1 |
| client | dependencies | socket.io-client | ^4.8.3 |
| client | dependencies | vue | 3.5.13 |
| client | dependencies | vue-chartjs | ^5.3.3 |
| client | dependencies | vue-i18n | ^11.4.13 |
| client | dependencies | vue-router | 4.5.0 |
| client | devDependencies | @eslint/js | 9.23.0 |
| client | devDependencies | @pinia/testing | 1.0.0 |
| client | devDependencies | @tsconfig/node18 | 18.2.4 |
| client | devDependencies | @types/node | 20.11.25 |
| client | devDependencies | @types/sinon | 17.0.4 |
| client | devDependencies | @vitejs/plugin-vue | 5.2.3 |
| client | devDependencies | @vitest/coverage-v8 | 3.0.9 |
| client | devDependencies | @vue/test-utils | 2.4.6 |
| client | devDependencies | @vue/tsconfig | 0.7.0 |
| client | devDependencies | autoprefixer | 10.4.21 |
| client | devDependencies | axios-mock-adapter | 2.1.0 |
| client | devDependencies | concurrently | 9.1.2 |
| client | devDependencies | eslint | 9.23.0 |
| client | devDependencies | eslint-config-prettier | 10.1.1 |
| client | devDependencies | eslint-plugin-prettier | 5.2.5 |
| client | devDependencies | eslint-plugin-vue | 10.0.0 |
| client | devDependencies | flush-promises | 1.0.2 |
| client | devDependencies | happy-dom | 17.4.4 |
| client | devDependencies | numeral | 2.0.6 |
| client | devDependencies | postcss-import | 16.1.0 |
| client | devDependencies | postcss-url | 10.1.3 |
| client | devDependencies | rimraf | 5.0.8 |
| client | devDependencies | sass | 1.64.2 |
| client | devDependencies | sinon | 20.0.0 |
| client | devDependencies | swagger-ui-dist | 5.20.2 |
| client | devDependencies | typescript | 5.8.2 |
| client | devDependencies | typescript-eslint | 8.28.0 |
| client | devDependencies | vite | 6.2.4 |
| client | devDependencies | vite-plugin-static-copy | 2.3.0 |
| client | devDependencies | vitest | 3.0.9 |
| client | devDependencies | vitest-sonar-reporter | 2.0.0 |
| client | devDependencies | wait-on | 8.0.3 |
