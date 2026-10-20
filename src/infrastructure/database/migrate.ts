import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';
import { env } from '../config/env.js';

const pool = new pg.Pool({ connectionString: env.DATABASE_MIGRATOR_URL ?? env.DATABASE_URL });
const directory = new URL('./migrations/', import.meta.url);
await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
for (const name of (await readdir(directory)).filter(n => n.endsWith('.sql')).sort()) {
  const exists = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
  if (exists.rowCount) continue;
  const client = await pool.connect();
  try { await client.query('BEGIN'); await client.query(await readFile(join(directory.pathname, name), 'utf8')); await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]); await client.query('COMMIT'); }
  catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
await pool.end();
