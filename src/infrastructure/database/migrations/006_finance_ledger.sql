CREATE TABLE packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL, total_classes integer NOT NULL CHECK (total_classes > 0), price numeric(14,2) NOT NULL CHECK (price >= 0),
  is_active boolean NOT NULL DEFAULT true, UNIQUE (tenant_id, name), UNIQUE (tenant_id, id)
);
CREATE TABLE student_ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), student_id uuid NOT NULL,
  package_id uuid, entry_type text NOT NULL CHECK (entry_type IN ('CHARGE', 'PAYMENT')), amount numeric(14,2) NOT NULL CHECK (amount > 0),
  payment_method text, external_reference text, occurred_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, student_id) REFERENCES students (tenant_id, id),
  FOREIGN KEY (tenant_id, package_id) REFERENCES packages (tenant_id, id)
);
CREATE INDEX student_ledgers_balance_idx ON student_ledgers (tenant_id, student_id, occurred_at);
ALTER TABLE packages ENABLE ROW LEVEL SECURITY; ALTER TABLE packages FORCE ROW LEVEL SECURITY;
ALTER TABLE student_ledgers ENABLE ROW LEVEL SECURITY; ALTER TABLE student_ledgers FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_packages ON packages USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY tenant_student_ledgers ON student_ledgers USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
GRANT SELECT, INSERT, UPDATE, DELETE ON packages, student_ledgers TO cea_app;
