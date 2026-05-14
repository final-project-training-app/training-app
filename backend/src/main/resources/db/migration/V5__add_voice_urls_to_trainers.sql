-- Ensure voice column exists (stores voice type/id, not URL)
ALTER TABLE trainers
    ADD COLUMN IF NOT EXISTS voice VARCHAR(2048);

-- Column already has voice type data from entity relationships
-- Note: The intro field contains the actual playable audio URLs

