import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Pool } from 'pg';
import type { inTenantTransaction as Transaction, tenantQuery as TenantQuery } from './tenant-transaction.js';

const enabled = Boolean(process.env.DATABASE_URL);
const integration = enabled ? describe : describe.skip;
let pool: Pool;
let inTenantTransaction: typeof Transaction;
let tenantQuery: typeof TenantQuery;

integration('TEN-01: aislamiento de tenant mediante RLS', () => {
  beforeAll(async () => {
    ({ pool } = await import('./pool.js'));
    ({ inTenantTransaction, tenantQuery } = await import('./tenant-transaction.js'));
  });
  afterAll(async () => { await pool.end(); });

  it('impide consultar o crear datos de otro tenant sin depender del filtro de la aplicación', async () => {
    const tenantA = randomUUID();
    const tenantB = randomUUID();
    const studentA = randomUUID();

    await pool.query('INSERT INTO tenants (id, name) VALUES ($1, $2), ($3, $4)', [tenantA, 'CEA A', tenantB, 'CEA B']);
    await inTenantTransaction(pool, tenantA, client => client.query(
      'INSERT INTO students (id, tenant_id, document_number, full_name) VALUES ($1, $2, $3, $4)',
      [studentA, tenantA, `DOC-${studentA}`, 'Estudiante de CEA A']
    ));

    const visibleForB = await tenantQuery<{ id: string }>(pool, tenantB, 'SELECT id FROM students');
    expect(visibleForB.rows).toEqual([]);

    // Sin contexto de tenant, FORCE RLS niega también al propietario de las tablas.
    const withoutContext = await pool.query('SELECT id FROM students WHERE id = $1', [studentA]);
    expect(withoutContext.rows).toEqual([]);

    await expect(inTenantTransaction(pool, tenantB, client => client.query(
      'INSERT INTO students (tenant_id, document_number, full_name) VALUES ($1, $2, $3)',
      [tenantA, `ATTEMPT-${tenantA}`, 'Intento entre CEAs']
    ))).rejects.toMatchObject({ code: '42501' });
  });
});
