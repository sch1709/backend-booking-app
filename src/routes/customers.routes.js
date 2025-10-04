const express = require('express');
const router = express.Router();
const db = require('../connection/db');

// Route to create a customer
// Method: POST
// Body: { name, email, phone }
router.post('/', async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        const { data, error } = await db
            .from('customers')
            .insert([{ name, email, phone }])
            .select()
            .single();

        if (error) {
            console.error('Error creating customer:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to create customer',
                details: error.message 
            });
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to fetch all customers
// Method: GET
router.get('/', async (req, res) => {
    try {
        const { data, error } = await db
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch customers',
                details: error.message 
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to fetch a customer by ID
// Method: GET
// Params: id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await db
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ 
                success: false,
                error: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to update a customer
// Method: PUT
// Params: id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    try {
        const { data, error } = await db
            .from('customers')
            .update({ name, email, phone })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(404).json({ 
                success: false,
                error: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Route to delete a customer
// Method: DELETE
// Params: id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await db
            .from('customers')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(404).json({ 
                success: false,
                error: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;