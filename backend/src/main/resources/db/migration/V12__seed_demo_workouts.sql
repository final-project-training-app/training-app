-- Demo workouts for admin display
-- These are English-named workouts used to populate the admin workout list.
-- trainer_id is NULL; existing functional workouts are unchanged.

INSERT INTO workouts (
    name,
    dashboard_name,
    level,
    type,
    duration_seconds,
    knee_friendly,
    low_impact,
    seated,
    beginner_friendly,
    workout_image,
    enabled
)
SELECT * FROM (VALUES
    ('Seated Marching',   'Seated Marching',   1, 'CARDIO',    180, true,  true, true,  true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Seated%20Marching.png',        true),
    ('Shoulder Rolls',    'Shoulder Rolls',    1, 'MOBILITY',  120, true,  true, true,  true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Shoulder%20Rolls.png',         true),
    ('Neck Turns',        'Neck Turns',        1, 'MOBILITY',  120, true,  true, true,  true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Wall%20PushUps.png',           true),
    ('Ankle Circles',     'Ankle Circles',     1, 'MOBILITY',  120, true,  true, true,  true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Ankle%20Circles.png',         true),
    ('Chest Opener',      'Chest Opener',      1, 'MOBILITY',  120, true,  true, true,  true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Chest%20Opener.png',          true),
    ('Chair Sit to Stand','Chair Sit to Stand',2, 'STRENGTH',  240, false, true, false, true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Chair%20Sit%20to%20Stand.png', true),
    ('Wall Push-Ups',     'Wall Push-Ups',     2, 'STRENGTH',  180, true,  true, false, true,  'https://mizofvemlvooaycnevys.supabase.co/storage/v1/object/public/audio_files/Wall%20PushUps.png',          true)
) AS new_workouts (name, dashboard_name, level, type, duration_seconds, knee_friendly, low_impact, seated, beginner_friendly, workout_image, enabled)
WHERE NOT EXISTS (
    SELECT 1 FROM workouts w WHERE w.name = new_workouts.name
);

