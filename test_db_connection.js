const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Testing database connection...');
console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('Testing simple query...');
        const { data, error } = await supabase
            .from('bookings')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Database error:', error);
        } else {
            console.log('Database connection successful!');
            console.log('Sample query result:', data);
        }
    } catch (error) {
        console.error('Connection test failed:', error.message);
    }
}

testConnection();
