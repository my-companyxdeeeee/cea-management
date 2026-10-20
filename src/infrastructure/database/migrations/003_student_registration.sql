ALTER TABLE students ADD COLUMN license_category text NOT NULL DEFAULT 'B1';
ALTER TABLE students ADD COLUMN runt_status text NOT NULL DEFAULT 'PENDING' CHECK (runt_status IN ('PENDING', 'VALID', 'BLOCKED', 'UNAVAILABLE'));
