CREATE TABLE student_progress (
  tenant_id uuid NOT NULL REFERENCES tenants(id), student_id uuid NOT NULL, theory_hours numeric(6,2) NOT NULL DEFAULT 0 CHECK (theory_hours >= 0), practical_hours numeric(6,2) NOT NULL DEFAULT 0 CHECK (practical_hours >= 0), exams_passed integer NOT NULL DEFAULT 0 CHECK (exams_passed >= 0), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tenant_id, student_id), FOREIGN KEY (tenant_id, student_id) REFERENCES students(tenant_id, id)
);
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY; ALTER TABLE student_progress FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_student_progress ON student_progress USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant());
GRANT SELECT, INSERT, UPDATE ON student_progress TO cea_app;
