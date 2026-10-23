# Quick wins

Alto valor por esfuerzo acotado; son candidatos, no autorización de despliegue. Un prerrequisito pendiente impide ejecutar un quick win aunque su código sea pequeño. No se mezclan con formato masivo ni migración de UI.

| Tarea | Riesgo atendido | Horas | Antes de empezar | Prueba que demuestra valor |
|---|---|---:|---|---|
| T-005 Aislar el portal mediante el ID autenticado | WS-001 | 8–16 | T-004, T-014 | Cuenta 99 con login 42 nunca recibe datos del propietario 42 |
| T-006 Persistir únicamente la clave PDF de la factura | WS-002 | 8–12 | T-004, T-014 | PAID y boldTransactionId sobreviven a PDF concurrente en ambos endpoints |
| T-007 Limpiar el chat cuando cambia la sesión | WS-006 | 4–8 | T-004, T-014 | Tras logout/login no hay mensajes ni PII de la sesión anterior |
| T-010 Retirar cuentas de ejemplo y asegurar primer administrador | WS-009 | 8–12 | T-002, T-003, T-014 | No existen cuentas de ejemplo activas o se aporta evidencia de ausencia |
| T-012 Escapar nombres de usuario en las vistas | WS-011 | 4–8 | T-004, T-014 | Cadena HTML se muestra literalmente y no crea elementos activos |
| T-013 Identificar demos y retirar telemetría ficticia de producción | WS-025 | 4–8 | T-004, T-014 | Ningún dato aleatorio o fijo se presenta como actividad o telemetría real |
| T-034 Reenviar Socket.IO y verificar reconexión | WS-037 | 4–8 | T-013, T-031 | Handshake recibe respuesta Engine.IO y upgrade funciona |
| T-040 Acotar listados y corregir enlaces de paginación | WS-022, WS-023 | 8–16 | T-039 | size negativo/excesivo y sort desconocido se rechazan o normalizan según contrato |
| T-054 Liberar listeners y gráficos al desmontar | WS-026 | 4–8 | T-004 | Tras 20 entradas/salidas listeners y gráficos vuelven al conteo inicial |
| T-071 Incluir recursos públicos en el artefacto | WS-031 | 4–8 | T-061 | robots.txt y manifest.webapp existen en build y responden sin fallback HTML |

T-003 (rotación) es urgente aunque su coordinación impida llamarlo cambio trivial. T-008 y T-009 requieren sesiones reales/transacciones y se mantienen dentro de contención con 12–20 h. No considerar la limpieza de historial sustituto de rotar credenciales.

T-054 y T-071 se pueden adelantar cuando haya capacidad frontend y sus dependencias estén listas. Ese adelanto no desplaza aislamiento ni pagos y debe reflejarse en backlog/calendario. La retirada de simulación T-013 cierra el riesgo de información engañosa antes de contratar hardware o nueva telemetría.
