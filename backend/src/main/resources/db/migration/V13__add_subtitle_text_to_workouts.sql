ALTER TABLE workouts
    ADD COLUMN IF NOT EXISTS subtitle_text TEXT;

ALTER TABLE workouts
    ADD COLUMN IF NOT EXISTS instructions_subtitle_text TEXT;