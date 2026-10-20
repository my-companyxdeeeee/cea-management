CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, status text NOT NULL CHECK (status IN ('ACTIVE','SUSPENDED')) DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  email text NOT NULL, password_hash text NOT NULL, role text NOT NULL CHECK (role IN ('SUPERADMIN','CEA_ADMIN','INSTRUCTOR','STUDENT','RECEPTION')),
  is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid UNIQUE REFERENCES users(id), document_number text NOT NULL, full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (tenant_id, document_number), UNIQUE (tenant_id, id)
);
CREATE TABLE instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id), credential_expires_at date, is_active boolean NOT NULL DEFAULT true,
  UNIQUE (tenant_id, id)
);
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  plate text NOT NULL, is_available boolean NOT NULL DEFAULT true, soat_expires_at date, tecnomecanica_expires_at date,
  UNIQUE (tenant_id, plate), UNIQUE (tenant_id, id)
);
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
  student_id uuid NOT NULL, instructor_id uuid, vehicle_id uuid,
  kind text NOT NULL CHECK (kind IN ('THEORY','PRACTICAL')), status text NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED')),
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  slot tstzrange GENERATED ALWAYS AS (tstzrange(starts_at, ends_at, '[)')) STORED,
  CHECK (ends_at > starts_at)
);
-- Las claves compuestas impiden referencias cruzadas entre CEAs, incluso con UUID válidos.
ALTER TABLE appointments ADD CONSTRAINT appointment_student_same_tenant FOREIGN KEY (tenant_id, student_id) REFERENCES students (tenant_id, id);
ALTER TABLE appointments ADD CONSTRAINT appointment_instructor_same_tenant FOREIGN KEY (tenant_id, instructor_id) REFERENCES instructors (tenant_id, id);
ALTER TABLE appointments ADD CONSTRAINT appointment_vehicle_same_tenant FOREIGN KEY (tenant_id, vehicle_id) REFERENCES vehicles (tenant_id, id);
CREATE INDEX appointments_tenant_time_idx ON appointments (tenant_id, starts_at);
CREATE INDEX appointments_student_slot_gist ON appointments USING gist (tenant_id, student_id, slot) WHERE status = 'SCHEDULED';
ALTER TABLE appointments ADD CONSTRAINT no_student_overlap EXCLUDE USING gist (tenant_id WITH =, student_id WITH =, slot WITH &&) WHERE (status = 'SCHEDULED');
ALTER TABLE appointments ADD CONSTRAINT no_instructor_overlap EXCLUDE USING gist (tenant_id WITH =, instructor_id WITH =, slot WITH &&) WHERE (status = 'SCHEDULED' AND instructor_id IS NOT NULL);
ALTER TABLE appointments ADD CONSTRAINT no_vehicle_overlap EXCLUDE USING gist (tenant_id WITH =, vehicle_id WITH =, slot WITH &&) WHERE (status = 'SCHEDULED' AND vehicle_id IS NOT NULL);

CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid
$$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY; ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY; ALTER TABLE students FORCE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY; ALTER TABLE instructors FORCE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY; ALTER TABLE vehicles FORCE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY; ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_users ON users USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY tenant_students ON students USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY tenant_instructors ON instructors USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY tenant_vehicles ON vehicles USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
CREATE POLICY tenant_appointments ON appointments USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
