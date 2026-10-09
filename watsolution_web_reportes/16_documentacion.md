# Documentación

Fecha: 5 de octubre de 2026. Alcance: watsolution_web local.

README raíz y servidor son en gran parte plantillas en inglés. OpenAPI se genera desde decoradores pero hay contratos obsoletos: meterId marcado opcional aunque generación lo exige; phone documentado como contraseña; documentación Swagger estática busca /v3/api-docs y tokens en storage antiguo, mientras Nest publica /api/v2/api-docs.

No existe AGENTS.md aplicable encontrado en el proyecto/ancestros comprobados. No se aplicaron instrucciones de otros repositorios. No se halló guía de operación propia para esquema inicial, seguridad, invitaciones, pagos, conciliación o respuesta a incidentes. Las configuraciones .jhipster solo describen parte del dominio actual; regenerar sin plan puede sobrescribir lógica nueva.

Para onboarding debe existir una secuencia reproducible: runtime y npm exactos → secretos de ejemplo sin valores → PostgreSQL y extensiones → migración explícita revisada → alta del administrador → tests → build → verificación de salud. Agregar procedimientos de restore/rollback con responsables y criterios de parada.

### [WS-045] Los README y contratos describen un arranque obsoleto
- **Categoría:** Documentación
- **Severidad:** Baja
- **Ubicación:** README.md:35
- **Evidencia:**

```text
35:             # This token must be encoded using Base64 and be at least 256 bits long (you can type `openssl rand -base64 64` on your command line to generate a 512 bits one)
36:             base64-secret: {yourSecret}
37:             # Token is valid 24 hours
38:             token-validity-in-seconds: 86400
39:             token-validity-in-seconds-for-remember-me: 2592000
40: ```
41: 
42: You can use the default secret created from the app, or change it.
43: So to get a token, you have to pass a POST request on the _api/authenticate_ url with **UserLoginDTO** as body.
```

- **Impacto:** README recomienda secreto por defecto, expiraciones de 24h/30d y comandos inexistentes como start:app/mvnw. server/README dice que migra automáticamente, pero producción lo desactiva. Falta guía operativa comprobada para invitaciones, variables, respaldo, restauración y conciliación.
- **Recomendación:** Escribir guía en español con variables sin valores, topologías admitidas, preparación/migración explícita, pruebas, rotación, rollback y RPO/RTO acordados; mantener contrato OpenAPI acorde al código.
- **Esfuerzo estimado:** Medio


## Límites de verificación

Auditoría del estado local del 5 de octubre de 2026 (America/Bogota), incluidos cambios preexistentes. Las conclusiones son estáticas salvo pruebas expresamente descritas. No se arrancó Nest ni se conectó a PostgreSQL, Railway, S3 o Bold; no se instalaron paquetes ni se ejecutaron migraciones. No se validaron datos reales, cabeceras desplegadas, TLS, IAM, backups/restauración, carga, Core Web Vitals, contraste o navegación con lector de pantalla. No se certifica ausencia de vulnerabilidades. La consulta online de npm fue bloqueada por la revisión automática por el envío de metadatos; CVE actuales y versiones más recientes: **No verificado**. Las consultas web realizadas fueron genéricas a fuentes oficiales de privacidad y accesibilidad, sin enviar código ni inventarios.
