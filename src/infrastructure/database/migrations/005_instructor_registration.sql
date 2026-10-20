ALTER TABLE instructors ADD COLUMN full_name text NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE instructors ADD COLUMN credential_number text NOT NULL DEFAULT 'PENDING';
ALTER TABLE instructors ADD COLUMN license_categories text[] NOT NULL DEFAULT ARRAY[]::text[];
