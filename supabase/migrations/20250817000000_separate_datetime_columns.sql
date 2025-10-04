-- Migration to separate datetime into date and time columns (using TEXT for simplicity)
-- Add new columns as TEXT
ALTER TABLE bookings 
ADD COLUMN booking_date TEXT,
ADD COLUMN booking_time TEXT;

-- Migrate existing data from ISO datetime strings like "2025-08-18T14:15:00.000Z"
UPDATE bookings 
SET 
    booking_date = SPLIT_PART(datetime, 'T', 1),                    -- Extract date part before 'T'
    booking_time = SUBSTRING(SPLIT_PART(datetime, 'T', 2) FROM 1 FOR 5)  -- Extract HH:MM from time part
WHERE datetime IS NOT NULL AND datetime != '';

-- Make the new columns NOT NULL after data migration
ALTER TABLE bookings 
ALTER COLUMN booking_date SET NOT NULL,
ALTER COLUMN booking_time SET NOT NULL;

-- Drop the old datetime column
ALTER TABLE bookings DROP COLUMN datetime;
