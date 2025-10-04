const express = require('express');
const router = express.Router();
const db = require('../connection/db');

//Route to create services
// Method: POST
// Body: { name, price, description, duration }
router.post('/', async (req, res) => {
    const { name, price, description, duration } = req.body;
    try {
        const { data, error } = await db
            .from('services')
            .insert([{
                name,
                price,
                description,
                duration
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating service:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create service',
                details: error.message
            });
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to fetch all services
// Method: GET
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Fetching all services from database...');
        
        const { data, error } = await db
            .from('services')
            .select('*');

        console.log('📋 Services query result:', { data, error });
        console.log('📋 Number of services found:', data ? data.length : 0);

        if (error) {
            console.error('❌ Error fetching services:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch services',
                details: error.message
            });
        }

        console.log('✅ Successfully fetched services');
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('💥 Exception while fetching services:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

//Route to fetch a specific service by ID
// Method: GET
// Params: { id }
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await db
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching service:', error);
            return res.status(404).json({
                success: false,
                error: 'Service not found',
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to update a service
// Method: PUT
// Params: { id }
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description, duration } = req.body;
    try {
        const { data, error } = await db
            .from('services')
            .update({
                name,
                price,
                description,
                duration
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating service:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update service',
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to delete a service
// Method: DELETE
// Params: { id }
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await db
            .from('services')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error deleting service:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete service',
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to fetch available services from my_services (services that barbers have selected)
// Method: GET
// Public endpoint for frontend
router.get('/available', async (req, res) => {
    try {
        console.log('🔍 Fetching available services from my_services...');
        
        const { data, error } = await db
            .from('my_services')
            .select(`
                services (
                    id,
                    name,
                    price,
                    duration,
                    description
                )
            `);

        console.log('📋 Available services query result:', { data, error });

        if (error) {
            console.error('❌ Error fetching available services:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch available services',
                details: error.message
            });
        }

        // Extract unique services (remove duplicates)
        const servicesMap = new Map();
        (data || []).forEach(item => {
            if (item.services) {
                servicesMap.set(item.services.id, item.services);
            }
        });

        const uniqueServices = Array.from(servicesMap.values());
        console.log('✅ Successfully fetched available services:', uniqueServices.length);

        res.status(200).json({
            success: true,
            data: uniqueServices
        });
    } catch (error) {
        console.error('💥 Exception while fetching available services:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;
