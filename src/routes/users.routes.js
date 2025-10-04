const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const supabase = require('../connection/db');

// Route to create users
// Method: POST
// Body: { email, first_name, last_name, password, phone }
router.post('/', async (req, res) => {
    const { email, first_name, last_name, password, phone } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, first_name, last_name, password, phone }])
            .select();

        if (error) {
            console.error('Error creating user:', error);
            return res.status(400).json({ success: false, error: error.message });
        }

        res.status(201).json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Route to fetch all users
// Method: GET
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
            return res.status(400).json({ success: false, error: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Route to fetch a user by id
// Method: GET
// Params: { id }
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Route to update a user
// Method: PUT
// Params: { id }
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { email, first_name, last_name, password, phone } = req.body;

    try {
        // Prepare update data
        let updateData = { email, first_name, last_name, phone };

        // If password is provided, hash it before updating
        if (password && password.trim() !== '') {
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.password = hashedPassword;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating user:', error);
            return res.status(400).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Route to delete a user
// Method: DELETE
// Params: { id }
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error deleting user:', error);
            return res.status(400).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


module.exports = router;