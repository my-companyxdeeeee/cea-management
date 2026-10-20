import { createHash, randomBytes } from 'node:crypto';
import type { Pool } from 'pg';
import { inTenantTransaction } from '../../../infrastructure/database/tenant-transaction.js';
import { DomainError } from '../../../shared/domain/errors.js';
import type { Role } from '../../../shared/domain/roles.js';
import { verifyPassword } from './password.js';
const refreshHash = (value: string) => createHash('sha256').update(value).digest('base64url');
export type Identity = { id: string; tenantId: string; role: Role; email: string };

export async function authenticate(pool: Pool, tenantId: string, email: string, password: string): Promise<Identity> {
  const result = await inTenantTransaction(pool, tenantId, client => client.query<Identity & { password_hash: string }>(
    'SELECT id, tenant_id AS "tenantId", role, email, password_hash FROM users WHERE lower(email) = lower($1) AND is_active = true', [email]
  ));
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) throw new DomainError('Credenciales inválidas.', 'INVALID_CREDENTIALS');
  return { id: user.id, tenantId: user.tenantId, role: user.role, email: user.email };
}
export async function createRefreshSession(pool: Pool, identity: Identity) {
  const token = randomBytes(48).toString('base64url');
  await inTenantTransaction(pool, identity.tenantId, client => client.query(
    "INSERT INTO refresh_sessions (tenant_id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, now() + interval '30 days')",
    [identity.tenantId, identity.id, refreshHash(token)]
  ));
  return token;
}
