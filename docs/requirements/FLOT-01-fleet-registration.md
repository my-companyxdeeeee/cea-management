# FLOT-01 — Registro de vehículos

**Fuente:** HU4.1 y regla de inhabilitación de HU4.2. **Actor:** Administrador CEA.

## Criterios de aceptación

1. El administrador registra placa, marca, modelo, categoría y kilometraje dentro de su tenant.
2. La placa se normaliza a mayúsculas y es única por CEA.
3. Un vehículo nuevo queda disponible solo si SOAT y tecnomecánica no están vencidos; una fecha ausente queda pendiente de política de obligatoriedad.
4. Instructor, recepción y otros tenants no pueden usar este endpoint.

La actualización de kilometraje al cerrar prácticas, alertas y bloqueo por falla mecánica pertenecen a incrementos posteriores.
