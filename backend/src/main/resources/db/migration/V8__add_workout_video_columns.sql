ALTER TABLE workouts ADD COLUMN IF NOT EXISTS instructions_video VARCHAR(2048);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS instructions_video_start INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS instructions_video_stop INTEGER;
