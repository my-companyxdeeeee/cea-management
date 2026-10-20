# EST-02 — Validación RUNT desacoplada

**Fuente:** HU2.2. **Actor:** Administrador CEA/Recepción.

## Criterios de aceptación

1. La validación consulta un adaptador `RuntGateway`, sin acoplar el dominio a un proveedor HTTP.
2. Un resultado válido o bloqueado se persiste en el estudiante dentro del tenant.
3. Si RUNT no está disponible, no se inventa un estado: se devuelve `503/RUNT_UNAVAILABLE` y permanece el estado previo.
4. Contratos, credenciales, consentimiento y disponibilidad real quedan pendientes de confirmación externa.
