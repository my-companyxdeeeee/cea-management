# TEN-02 — Identidad, JWT y RBAC

**Fuente:** HU1.2 y HU1.3.  
**Actor:** Usuario del sistema.

## Criterios de aceptación

1. Dado un usuario activo y credenciales válidas de su CEA, cuando inicia sesión, entonces recibe un JWT de vida corta con `userId`, `tenantId` y `role` verificados, más una sesión renovable opaca.
2. Dado un email existente en otro tenant o una contraseña inválida, cuando intenta iniciar sesión, entonces recibe el mismo error de credenciales inválidas sin exponer qué dato falló.
3. La sesión renovable queda aislada por RLS, se almacena únicamente como hash y puede revocarse.
4. Los roles reconocidos son `SUPERADMIN`, `CEA_ADMIN`, `INSTRUCTOR`, `STUDENT` y `RECEPTION`; la autorización de cada endpoint se implementará en su módulo consumidor.

**Límite:** no se habilita acceso implícito del Superadmin a datos de estudiantes; requiere una política auditable posterior.
