# INS-01 — Registro de instructores

**Fuente:** HU5.1 y regla de vigencia de credenciales. **Actor:** Administrador CEA.

## Criterios de aceptación

1. El administrador asocia un usuario del mismo tenant con nombre, número de credencial, categorías y fecha de vencimiento.
2. Una credencial vencida se registra inactiva y no podrá seleccionarse en el agendamiento.
3. Un usuario inexistente o perteneciente a otro tenant no puede asociarse.
4. Solo `CEA_ADMIN` puede crear instructores.

La verificación contra Ministerio de Transporte y la disponibilidad semanal quedan como integraciones/modelos posteriores.
