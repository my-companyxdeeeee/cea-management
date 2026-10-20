ALTER TABLE users ADD CONSTRAINT users_tenant_id_id_unique UNIQUE (tenant_id, id);

CREATE TABLE refresh_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id), user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, user_id) REFERENCES users (tenant_id, id)
);
CREATE INDEX refresh_sessions_active_idx ON refresh_sessions (tenant_id, token_hash) WHERE revoked_at IS NULL;
ALTER TABLE refresh_sessions ENABLE ROW LEVEL SECURITY; ALTER TABLE refresh_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_refresh_sessions ON refresh_sessions USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
GRANT SELECT, INSERT, UPDATE, DELETE ON refresh_sessions TO cea_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cea_app;
