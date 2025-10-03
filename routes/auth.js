const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login page
router.get('/login', (req, res) => {
    res.render('auth', { mode: 'login', user: req.session.user });
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth', { mode: 'register', user: req.session.user });
});

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = new User({ username, email, password, phone });
        await newUser.save();

        // Set session
        req.session.user = { id: newUser._id, username, email, role: newUser.role };
        res.json({ message: 'Registration successful', user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ $or: [{ email: username }, { username }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.correctPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Set session
        req.session.user = { id: user._id, username: user.username, email: user.email, role: user.role };
        res.json({ message: 'Login successful', user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;