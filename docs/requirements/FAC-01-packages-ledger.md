# FAC-01 — Paquetes y libro mayor

**Fuente:** HU6.1 y HU6.2. **Actor:** Administrador, Recepción y Estudiante.

## Criterios de aceptación

1. Administrador/Recepción puede crear paquetes y registrar abonos por estudiante dentro del tenant.
2. Cada movimiento queda asociado a `tenant_id` y `student_id`, con método y referencia opcional.
3. El saldo se calcula como cargos menos pagos; cartera vencida y límite de crédito no se consideran equivalentes.
4. Las tablas financieras aplican RLS y claves foráneas compuestas para evitar cruces de tenants.

Facturación electrónica, conciliación de webhooks y la regla de impedir prácticas por límite de crédito requieren incrementos posteriores.
