ALTER TABLE vehicles ADD COLUMN brand text NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE vehicles ADD COLUMN model text NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE vehicles ADD COLUMN category text NOT NULL DEFAULT 'B1';
ALTER TABLE vehicles ADD COLUMN mileage_km integer NOT NULL DEFAULT 0 CHECK (mileage_km >= 0);
ALTER TABLE vehicles ADD COLUMN mechanical_issue_active boolean NOT NULL DEFAULT false;
