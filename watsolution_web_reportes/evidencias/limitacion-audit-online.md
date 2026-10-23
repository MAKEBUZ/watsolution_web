# Comprobación online de dependencias

Se intentó npm audit y npm audit --omit=dev sin modificar dependencias. La red restringida impidió completar ambas consultas. La solicitud posterior de ejecución con permisos de red fue rechazada por la revisión automática porque npm audit enviaría metadatos del inventario de dependencias al registro público de npm y no se consideró autorizado ese envío específico. No se eludió el bloqueo ni se obtuvo un resultado de vulnerabilidades válido.

Estado: **No verificado**. Para cerrar esta comprobación se requiere autorización explícita para dicho envío. No es necesario enviar código fuente ni secretos. No ejecutar npm audit fix.
