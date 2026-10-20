# TEN-01 — Aislamiento multitenant

**Fuente:** HU1.1, HU1.2 y regla de aislamiento de datos.  
**Actor:** Administrador CEA, personal autorizado y servicios internos.  
**Necesidad:** operar datos del CEA sin que usuarios o procesos de otro tenant puedan verlos o modificarlos.  
**Beneficio:** confidencialidad e integridad de la información de cada institución.

## Criterios de aceptación

1. **Dado** un usuario autenticado del tenant A, **cuando** consulta o modifica una entidad aislada, **entonces** PostgreSQL permite únicamente filas con `tenant_id = A`.
2. **Dado** una conexión sin contexto de tenant, **cuando** consulta una tabla aislada, **entonces** no recibe filas, incluso si el rol es propietario de la tabla.
3. **Dado** una operación del tenant B que intenta insertar una fila con `tenant_id = A`, **cuando** se confirma, **entonces** PostgreSQL la rechaza.
4. Las relaciones de una reserva incluyen `(tenant_id, id)`, por lo que estudiante, instructor y vehículo pertenecen al mismo CEA.

## Diseño y límites

- El contexto se carga exclusivamente desde el JWT verificado y se fija por transacción mediante `set_config('app.tenant_id', ..., true)`; nunca se toma de la petición HTTP.
- El Superadmin no obtiene acceso implícito a datos de estudiantes. Su alcance debe definirse en una historia posterior antes de crear una vía de elevación controlada y auditable.
- La prueba de integración corre contra PostgreSQL 16 en CI usando un rol de aplicación sin privilegios de superusuario. Localmente se omite si no existe `DATABASE_URL`.
