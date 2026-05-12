DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'workouts'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'workouts'
              AND column_name = 'instructions'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'workouts'
              AND column_name = 'description'
        ) THEN
            ALTER TABLE workouts RENAME COLUMN instructions TO description;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'workouts'
              AND column_name = 'duration_minutes'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'workouts'
              AND column_name = 'duration_seconds'
        ) THEN
            ALTER TABLE workouts RENAME COLUMN duration_minutes TO duration_seconds;
        END IF;
    END IF;
END $$;

