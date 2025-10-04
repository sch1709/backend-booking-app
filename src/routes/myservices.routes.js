const express = require('express');
const router = express.Router();
const db = require('../connection/db');
const { auth, staff } = require('../middlewares');

// Route to get services for a specific barber (public endpoint for frontend)
// Method: GET /barber/:barberId
router.get('/barber/:barberId', async (req, res) => {
    try {
        const barberId = req.params.barberId;
        
        if (!barberId) {
            return res.status(400).json({
                success: false,
                error: 'Barber ID is required'
            });
        }
        
        const { data: barberServices, error } = await db
            .from('my_services')
            .select(`
                id,
                service_id,
                services (
                    id,
                    name,
                    price,
                    duration,
                    description
                )
            `)
            .eq('user_id', barberId);

        if (error) {
            console.error('Error fetching barber services:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch barber services',
                details: error.message
            });
        }

        // Return empty array if no services found
        const servicesData = barberServices || [];
        
        // Flatten the response to match frontend expectations
        const flattenedServices = servicesData.map(item => ({
            id: item.services.id,
            name: item.services.name,
            price: item.services.price,
            duration: item.services.duration,
            description: item.services.description
        }));

        res.status(200).json({
            success: true,
            data: flattenedServices
        });
    } catch (error) {
        console.error('Error fetching barber services:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to get user's selected services
// Method: GET
// PROTECTED ROUTE - User can only see their own services
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        
        const userId = req.user.userId;
        
        const { data: myServices, error } = await db
            .from('my_services')
            .select(`
                id,
                service_id,
                services (
                    id,
                    name,
                    price,
                    duration,
                    description
                )
            `)
            .eq('user_id', userId);

        console.log('Database query result:', { data: myServices, error });

        if (error) {
            console.error('Error fetching user services:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch user services',
                details: error.message
            });
        }

        // Return empty array if no services found
        const servicesData = myServices || [];
        
        // Flatten the response to match frontend expectations
        const flattenedServices = servicesData.map(item => ({
            service_id: item.service_id,
            id: item.services?.id || item.service_id,
            name: item.services?.name || 'Unknown Service',
            price: item.services?.price || 0,
            duration: item.services?.duration || 0,
            description: item.services?.description || ''
        }));

        console.log('Flattened services data:', flattenedServices);

        res.status(200).json({
            success: true,
            data: flattenedServices
        });
    } catch (error) {
        console.error('Error fetching user services:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to add a service to user's list
// Method: POST
// Body: { service_id }
// PROTECTED ROUTE - User can only add to their own services
router.post('/', auth, async (req, res) => {
    try {
        const { service_id } = req.body;
        const userId = req.user.userId;

        console.log('=== ADD SERVICE ===');
        console.log('User ID:', userId);
        console.log('Service ID:', service_id);
        console.log('Request body:', req.body);

        if (!service_id) {
            return res.status(400).json({
                success: false,
                error: 'Service ID is required'
            });
        }

        // Check if service already exists for this user
        const { data: existing, error: existingError } = await db
            .from('my_services')
            .select('id')
            .eq('user_id', userId)
            .eq('service_id', service_id)
            .single();

        console.log('Existing check result:', { data: existing, error: existingError });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Service already added to your list'
            });
        }

        // Add service to user's list
        const { data: newService, error } = await db
            .from('my_services')
            .insert([{
                user_id: userId,
                service_id: service_id
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding service to user list:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to add service',
                details: error.message
            });
        }

        res.status(201).json({
            success: true,
            data: newService
        });
    } catch (error) {
        console.error('Error adding service to user list:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to remove a service from user's list
// Method: DELETE
// Params: { service_id }
// PROTECTED ROUTE - User can only remove from their own services
router.delete('/:service_id', auth, async (req, res) => {
    try {
        const { service_id } = req.params;
        const userId = req.user.userId;

        const { data: deletedService, error } = await db
            .from('my_services')
            .delete()
            .eq('user_id', userId)
            .eq('service_id', service_id)
            .select()
            .single();

        if (error) {
            console.error('Error removing service from user list:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to remove service',
                details: error.message
            });
        }

        if (!deletedService) {
            return res.status(404).json({
                success: false,
                error: 'Service not found in your list'
            });
        }

        res.status(200).json({
            success: true,
            data: deletedService
        });
    } catch (error) {
        console.error('Error removing service from user list:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;
