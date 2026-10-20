ALTER TABLE appointments ADD CONSTRAINT appointments_tenant_id_unique UNIQUE (tenant_id, id);
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id), appointment_id uuid NOT NULL,
  check_in timestamptz NOT NULL, check_out timestamptz NOT NULL, verification_method text NOT NULL CHECK (verification_method IN ('DIGITAL', 'BIOMETRIC')),
  ending_mileage_km integer CHECK (ending_mileage_km IS NULL OR ending_mileage_km >= 0), created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, appointment_id), FOREIGN KEY (tenant_id, appointment_id) REFERENCES appointments (tenant_id, id), CHECK (check_out > check_in)
);
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY; ALTER TABLE attendance_records FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_attendance ON attendance_records USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
GRANT SELECT, INSERT, UPDATE ON attendance_records TO cea_app;
