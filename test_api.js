const axios = require('axios');

async function testAPI() {
    try {
        console.log('Testing availability API...');
        const response = await axios.get('http://localhost:4000/api/orders/availability');
        console.log('Success! Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.data && response.data.data.length > 0) {
            console.log('\nFirst booking example:');
            console.log('Date:', response.data.data[0].booking_date);
            console.log('Time:', response.data.data[0].booking_time);
            console.log('Barber:', response.data.data[0].barber);
        }
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPI();
