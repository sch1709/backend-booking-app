const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migration to separate datetime into date and time columns...');
    
    try {
        // First, let's see what data we have
        console.log('Checking existing data...');
        const { data: existingBookings, error: fetchError } = await supabase
            .from('bookings')
            .select('id, datetime')
            .limit(5);
            
        if (fetchError) {
            console.error('Error fetching existing bookings:', fetchError);
            return;
        }
        
        console.log('Sample existing bookings:', existingBookings);
        
        if (existingBookings.length === 0) {
            console.log('No existing bookings found. Migration not needed.');
            return;
        }
        
        // For now, let's manually run the migration steps through the Supabase dashboard
        console.log('Please run the following SQL in your Supabase dashboard:');
        console.log(`
-- Step 1: Add new columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_date DATE,
ADD COLUMN IF NOT EXISTS booking_time TIME;

-- Step 2: Migrate existing data
UPDATE bookings 
SET 
    booking_date = (datetime::timestamp)::date,
    booking_time = (datetime::timestamp)::time
WHERE datetime IS NOT NULL AND booking_date IS NULL;

-- Step 3: Make columns NOT NULL (after verifying data)
-- ALTER TABLE bookings 
-- ALTER COLUMN booking_date SET NOT NULL,
-- ALTER COLUMN booking_time SET NOT NULL;

-- Step 4: Drop old column (after verifying everything works)
-- ALTER TABLE bookings DROP COLUMN datetime;
        `);
        
    } catch (error) {
        console.error('Migration check failed:', error);
    }
}

runMigration();
