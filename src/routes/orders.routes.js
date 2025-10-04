const express = require('express');
const router = express.Router();
const db = require('../connection/db');
const { auth, staff } = require('../middlewares');

// Test route to check database contents (temporary for debugging)
router.get('/debug', async (req, res) => {
    try {
        const { data: allBookings, error } = await db
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false });

        console.log('Debug - All bookings in database:', allBookings?.length || 0);
        
        res.status(200).json({
            success: true,
            total_bookings: allBookings?.length || 0,
            bookings: allBookings || []
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Route to create a booking 
// Method: POST
// Body: { barber, services, datetime, customer, totalPrice }
// PUBLIC ROUTE - No authentication required for customers to book
router.post('/', async (req, res) => {
    const { barber, services, datetime, customer, validation, totalPrice } = req.body;

    // Extract date and time from the datetime - with error handling
    let bookingDate, bookingTime;
    try {
        if (datetime) {
            if (typeof datetime === 'string') {
                // Handle different string formats
                if (datetime.includes('T')) {
                    // Handle format: "2025-08-17T09:00:00" or "2025-08-18T14:15:00.000Z"
                    const parts = datetime.split('T');
                    bookingDate = parts[0]; // "2025-08-17"
                    bookingTime = parts[1] ? parts[1].substring(0, 5) : '00:00'; // "09:00"
                } else {
                    // Handle other formats if needed
                    bookingDate = datetime;
                    bookingTime = '00:00';
                }
            } else {
                // Handle Date object (fallback)
                const dateObj = new Date(datetime);
                bookingDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                bookingTime = dateObj.toISOString().split('T')[1].substring(0, 5); // HH:MM
            }
        }
    } catch (datetimeError) {
        console.error('Error parsing datetime:', datetimeError);
        return res.status(400).json({
            success: false,
            error: 'Invalid datetime format'
        });
    }
    
    console.log('Orders API - Processing booking request (FIXED TIMEZONE):', {
        originalDatetime: datetime,
        extractedDate: bookingDate,
        extractedTime: bookingTime,
        barber: barber
    });

    if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Services must be a non-empty array'
        });
    }
    
    const invalidServices = services.filter(service => !service.id);
    if (invalidServices.length > 0) {
        console.log('Invalid services (missing id):', JSON.stringify(invalidServices, null, 2));
        return res.status(400).json({
            success: false,
            error: 'All services must have an id property',
            invalidServices: invalidServices
        });
    }
    
    try {
        // First, try to find existing customer by phone or email
        let customerData = null;
        const { data: existingCustomer } = await db
            .from('customers')
            .select('*')
            .or(`phone.eq.${customer.phone},email.eq.${customer.email}`)
            .single();

        if (existingCustomer) {
            console.log('Found existing customer:', existingCustomer.id);
            customerData = existingCustomer;
        } else {
            // Create new customer if none exists
            const { data: newCustomer, error: customerError } = await db
                .from('customers')
                .insert([{
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone
                }])
                .select()
                .single();

            if (customerError) {
                console.error('Customer creation error:', customerError);
                return res.status(500).json({ 
                    success: false,
                    error: 'Failed to create customer',
                    details: customerError.message 
                });
            }
            customerData = newCustomer;
            console.log('Created new customer:', customerData.id);
        }
        const { data: bookingData, error: bookingError } = await db
            .from('bookings')
            .insert([{
                barber,
                services: services, 
                booking_date: bookingDate,
                booking_time: bookingTime,
                customer_id: customerData.id, 
                validation,
                totalPrice
            }])
            .select()
            .single();

        if (bookingError) {
            console.error('Booking creation error:', bookingError);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to create booking',
                details: bookingError.message 
            });
        }
        res.status(201).json({
            success: true,
            data: {
                booking: bookingData,
                customer: customerData
            }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Route to fetch all bookings
// Method: GET
// PROTECTED ROUTE - Only staff/admin can view bookings (filtered by user_id for non-superusers)
router.get('/', auth, staff, async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;
        
        console.log('Orders API - User info:', { userRole, userId });
        
        let query = db.from('bookings').select('*');
        
        // If user is not superuser, filter by barber
        if (userRole !== 'superuser') {
            console.log('Orders API - Filtering by barber:', userId);
            query = query.eq('barber', userId);
        } else {
            console.log('Orders API - Superuser, showing all bookings');
        }
        
        const { data: bookings, error } = await query;

        console.log('Orders API - Query result:', { 
            bookingsCount: bookings?.length || 0, 
            error: error?.message,
            bookings: bookings?.slice(0, 2), // Show first 2 for debugging
            allBookingsInDB: 'checking...'
        });

        // Also check total bookings in database for debugging
        const { data: allBookings } = await db.from('bookings').select('id, barber, datetime');
        console.log('Orders API - All bookings in database:', allBookings?.length || 0);
        console.log('Orders API - Sample bookings:', allBookings?.slice(0, 3));

        if (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch bookings',
                details: error.message 
            });
        }

        console.log('Orders API - Sending response:', {
            success: true,
            dataCount: bookings?.length || 0
        });

        res.status(200).json({
            success: true,
            data: bookings || []
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Route to fetch booking availability (public for calendar display)
// Method: GET /availability
// PUBLIC ROUTE - Returns only datetime, duration, barber for conflict checking
router.get('/availability', async (req, res) => {
    try {
        console.log('Availability API - Fetching bookings for conflict detection...');
        
        const { data: bookings, error } = await db
            .from('bookings')
            .select('booking_date, booking_time, services, barber')
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true });

        if (error) {
            console.error('Availability API - Error fetching booking availability:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch booking availability',
                details: error.message 
            });
        }

        console.log('Availability API - Fetched bookings:', bookings?.length || 0);

        // Process bookings to calculate durations - no datetime conversion needed!
        const processedBookings = bookings.map(booking => {
            try {
                console.log('Availability API - Processing booking:', {
                    bookingDate: booking.booking_date,
                    bookingTime: booking.booking_time,
                    barber: booking.barber,
                    services: booking.services,
                    servicesType: typeof booking.services
                });
                
                // Calculate total duration from services
                let totalDuration = 0;
                if (Array.isArray(booking.services)) {
                    totalDuration = booking.services.reduce((total, service) => {
                        console.log('Availability API - Processing service:', {
                            service,
                            duration: service.duration,
                            durationType: typeof service.duration
                        });
                        
                        // Parse duration - handle both number and string formats
                        let serviceDuration = 60; // Default
                        if (typeof service.duration === 'number') {
                            serviceDuration = service.duration;
                        } else if (typeof service.duration === 'string') {
                            // Extract number from strings like "025 mins", "60 minutes", etc.
                            const match = service.duration.match(/\d+/);
                            if (match) {
                                serviceDuration = parseInt(match[0], 10);
                            }
                        }
                        
                        return total + serviceDuration;
                    }, 0);
                } else {
                    console.log('Availability API - Services not array, using default duration');
                    totalDuration = 60; // Default duration
                }

                console.log('Availability API - Calculated total duration:', totalDuration);

                return {
                    booking_date: booking.booking_date,
                    booking_time: booking.booking_time,
                    service_duration: totalDuration, // This should now always be a number
                    barber: booking.barber
                };
            } catch (processError) {
                console.error('Availability API - Error processing booking:', processError, booking);
                // Return a safe default to prevent the whole request from failing
                return {
                    booking_date: '1900-01-01',
                    booking_time: '00:00',
                    service_duration: 60,
                    barber: booking.barber || 'unknown'
                };
            }
        });

        console.log('Availability API - Processed bookings:', processedBookings?.length || 0);

        res.status(200).json({
            success: true,
            data: processedBookings
        });
    } catch (error) {
        console.error('Availability API - Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Route to fetch bookings by date
// Method: GET
// Params: { date }
// PROTECTED ROUTE - Only staff/admin can view bookings by date
router.get('/:date', auth, staff, async (req, res) => {
    const { date } = req.params;
    try {
        const { data: bookings, error } = await db
            .from('bookings')
            .select('*')
            .eq('datetime', date);

        if (error) {
            console.error('Error fetching bookings by date:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch bookings by date',
                details: error.message 
            });
        }

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings by date:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message 
        });
    }
});

module.exports = router;