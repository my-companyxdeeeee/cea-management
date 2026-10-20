# FAC-02 — Límite de crédito y bloqueo de prácticas

**Fuente:** HU6.3. **Actor:** Administrador CEA y sistema.

## Criterios de aceptación

1. El Administrador CEA configura un límite de crédito o lo deja sin límite (`null`).
2. Antes de crear una práctica, el sistema calcula el saldo del estudiante como cargos menos pagos dentro del tenant.
3. Si el saldo supera el límite configurado, la reserva se rechaza con `CREDIT_LIMIT_EXCEEDED`.
4. Esta regla no se presenta como equivalente a cartera vencida; el vencimiento requiere datos y política temporal adicionales.

El límite aplica al saldo insoluto agregado; la segmentación por matrícula queda pendiente si el negocio la requiere.
