# AGEN-01 — Reserva con recursos habilitados

**Fuente:** HU3.1, HU3.2 y reglas de HU4.2/HU5.1. **Actor:** Recepción o Administrador CEA.

## Criterios de aceptación

1. Antes de una práctica se verifica, dentro de la transacción y del tenant, que estudiante, instructor y vehículo existen.
2. El instructor debe estar activo y con credencial vigente cuando tenga fecha de vencimiento.
3. El vehículo debe estar disponible y no tener SOAT o tecnomecánica vencidos cuando existan esas fechas.
4. PostgreSQL mantiene las restricciones GiST como defensa final ante solapamientos concurrentes.

**Pendiente:** disponibilidad semanal, bloqueos por falla mecánica y jornada máxima requieren sus respectivos modelos de dominio.
