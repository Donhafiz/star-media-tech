const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Branch = require('../models/Branch');
const Chat = require('../models/Chat');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

// Admin dashboard
router.get('/', isAdmin, async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.countDocuments({ role: 'customer' }),
            totalProducts: await Product.countDocuments(),
            totalOrders: await Order.countDocuments(),
            totalServices: await Service.countDocuments(),
            totalBranches: await Branch.countDocuments(),
            recentChats: await Chat.find().sort({ createdAt: -1 }).limit(5)
        };
        res.render('admin', { user: req.session.user, stats });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// User management
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' });
        res.render('admin/users', { user: req.session.user, users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Product management
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { user: req.session.user, products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Order management
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId');
        res.render('admin/orders', { user: req.session.user, orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Service management
router.get('/services', isAdmin, async (req, res) => {
    try {
        const services = await Service.find();
        res.render('admin/services', { user: req.session.user, services });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Branch management
router.get('/branches', isAdmin, async (req, res) => {
    try {
        const branches = await Branch.find();
        res.render('admin/branches', { user: req.session.user, branches });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Chat management
router.get('/chats', isAdmin, async (req, res) => {
    try {
        const chats = await Chat.find().populate('userId');
        res.render('admin/chats', { user: req.session.user, chats });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;