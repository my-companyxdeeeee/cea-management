import pg from 'pg';
import { env } from '../config/env.js';

const pool = new pg.Pool({ connectionString: env.DATABASE_MIGRATOR_URL ?? env.DATABASE_URL });
const identifier = await pool.query<{ sql: string }>(
  "SELECT format('CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT', $1::text, $2::text) AS sql",
  [env.DATABASE_RUNTIME_USER, env.DATABASE_RUNTIME_PASSWORD]
);
try { await pool.query(identifier.rows[0].sql); }
catch (error: any) { if (error.code !== '42710') throw error; }
const database = new URL(env.DATABASE_MIGRATOR_URL ?? env.DATABASE_URL).pathname.slice(1);
const grantDatabase = await pool.query<{ sql: string }>("SELECT format('GRANT CONNECT ON DATABASE %I TO %I', $1::text, $2::text) AS sql", [database, env.DATABASE_RUNTIME_USER]);
const grantSchema = await pool.query<{ sql: string }>("SELECT format('GRANT USAGE ON SCHEMA public TO %I', $1::text) AS sql", [env.DATABASE_RUNTIME_USER]);
await pool.query(grantDatabase.rows[0].sql);
await pool.query(grantSchema.rows[0].sql);
await pool.end();
