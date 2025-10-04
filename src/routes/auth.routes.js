const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../connection/db');
const { auth } = require('../middlewares');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, first_name, last_name, password, phone, role } = req.body;

    // Validate required fields
    if (!email || !first_name || !last_name || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, last name and phone are required'
      });
    }

    // Check if user already exists (only check email since no username)
    const { data: existingUser } = await db
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error } = await db
      .from('users')
      .insert([{
        email,
        first_name,
        last_name,
        password: hashedPassword,
        phone,
        role
      }])
      .select('id, email, first_name, last_name, phone, role, is_active, created_at')
      .single();

    if (error) {
      console.error('User creation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user',
        details: error.message
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, email, first_name, last_name, phone, role, is_active, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Get current user
    const { data: user } = await db
      .from('users')
      .select('password')
      .eq('id', req.user.userId)
      .single();

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error } = await db
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', req.user.userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update password',
        details: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
