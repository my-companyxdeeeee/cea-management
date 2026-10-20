CREATE TABLE instructor_availability (tenant_id uuid NOT NULL REFERENCES tenants(id), instructor_id uuid NOT NULL, weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6), starts_at time NOT NULL, ends_at time NOT NULL, PRIMARY KEY (tenant_id, instructor_id, weekday, starts_at), FOREIGN KEY (tenant_id, instructor_id) REFERENCES instructors(tenant_id,id), CHECK (ends_at > starts_at));
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY; ALTER TABLE instructor_availability FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_instructor_availability ON instructor_availability USING (tenant_id=app_current_tenant()) WITH CHECK (tenant_id=app_current_tenant());
GRANT SELECT, INSERT, UPDATE, DELETE ON instructor_availability TO cea_app;
