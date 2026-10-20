# FLOT-02 — Fallas mecánicas y bloqueo de flota

**Fuente:** HU4.3 y regla de inhabilitación automática. **Actores:** Instructor y Administrador CEA.

## Criterios de aceptación

1. Un instructor reporta una falla y el vehículo queda inmediatamente no disponible para agendamiento.
2. El reporte guarda una nota y permanece asociado al tenant.
3. Solo el administrador puede marcar la falla como reparada; al desbloquear, la disponibilidad vuelve a considerar SOAT y tecnomecánica.
4. Un vehículo de otro tenant se comporta como inexistente.

La validación de severidad, workflow de mantenimiento y notificaciones se deja para el módulo de mantenimiento.
