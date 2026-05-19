ALTER TABLE workouts
    ADD COLUMN IF NOT EXISTS dashboard_name        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dashboard_description TEXT;

