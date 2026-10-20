import type { Pool, PoolClient, QueryResultRow } from 'pg';

/** Runs all tenant work in one transaction. SET LOCAL disappears on COMMIT/ROLLBACK. */
export async function inTenantTransaction<T>(
  pool: Pool, tenantId: string, work: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function tenantQuery<T extends QueryResultRow>(
  pool: Pool, tenantId: string, sql: string, values: unknown[] = []
) {
  return inTenantTransaction(pool, tenantId, client => client.query<T>(sql, values));
}
