const { supabase } = require('./src/connection/db');

async function checkMyServicesTable() {
  try {
    console.log('Checking my_services table...');
    
    const { data, error } = await supabase
      .from('my_services')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Table does not exist. Please create it manually in Supabase dashboard.');
      console.log('SQL to create table:');
      console.log(`
CREATE TABLE my_services (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

CREATE INDEX idx_my_services_user_id ON my_services(user_id);
CREATE INDEX idx_my_services_service_id ON my_services(service_id);
      `);
    } else {
      console.log('Table my_services already exists and is accessible');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

checkMyServicesTable();
