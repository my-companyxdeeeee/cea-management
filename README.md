# CEA Management API

Base modular monolith para una plataforma SaaS multitenant de CEAs, con Clean Architecture por módulo. La división hacia servicios independientes se hará cuando haya métricas que lo justifiquen, sin sacrificar transacciones de agendamiento.

## Inicio

1. Copie `.env.example` a `.env` y establezca secretos reales.
2. Ejecute `docker compose up -d`.
3. Instale dependencias con `npm install`, cree el rol de ejecución con `npm run db:provision-runtime` y aplique `npm run db:migrate`.
4. Inicie con `npm run dev`.

La API usa `DATABASE_URL` con un rol que **no** es propietario ni superusuario y no tiene `BYPASSRLS`; las migraciones usan `DATABASE_MIGRATOR_URL`. Esta separación hace que PostgreSQL aplique las políticas incluso si se omite accidentalmente un filtro en el código.

## Estructura

```text
src/
  modules/<bounded-context>/{domain,application,infrastructure,interfaces}
  shared/domain                 # contratos y errores transversales
  infrastructure/{config,database}
```

El primer incremento de producto es `identity-access`: inicio de sesión, refresco/revocación de tokens, RBAC y auditoría. Es el prerrequisito de HU1.1–HU1.3 y fija el `tenantId` que nunca debe venir del body o query string. El siguiente incremento es agendamiento (HU3.1–HU3.3); ya incluye el caso de uso y la protección de base de datos para conflictos concurrentes.

## Garantías de agendamiento

`appointments` utiliza restricciones de exclusión GiST independientes para estudiante, instructor y vehículo. PostgreSQL rechaza el solapamiento al confirmar, incluso cuando dos peticiones pasan validaciones previas simultáneamente. La aplicación convierte `23P01` en `SCHEDULE_CONFLICT`.

Además, todas las referencias de una reserva son claves foráneas compuestas por `(tenant_id, id)`: no se puede asociar una reserva de un CEA con un estudiante, instructor o vehículo de otro, aun si alguien conoce un UUID válido.

## Calidad y entrega

El workflow [CI](.github/workflows/ci.yml) se ejecuta para cada pull request contra `master`: compila el proyecto, ejecuta las pruebas unitarias y levanta PostgreSQL 16 para ejecutar la migración y las pruebas de aislamiento RLS de TEN-01.

## Alcance pendiente de decisión

- La semántica exacta de cartera vencida no se equipara al límite de crédito (HU6.3).
- Para bloquear un vehículo debe definirse qué ocurre con reservas vigentes; por defecto se propone conservarlas y marcarlas para reprogramación, nunca cancelarlas automáticamente.
- La fuente de kilometraje al cerrar una práctica debe ser lectura final validada por instructor, pendiente de aprobación.
- RUNT, SICOV, biometría y facturación se modelarán como adaptadores; faltan contratos, credenciales y disponibilidad real.
- Las cifras de <500 ms, 500 usuarios/tenant y 99.9% siguen pendientes de percentil, perfil de carga, ventana/exclusiones y RPO/RTO.
