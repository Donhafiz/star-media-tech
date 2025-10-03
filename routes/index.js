const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Service = require('../models/Service');
const Branch = require('../models/Branch');

// Home page
router.get('/', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).limit(4);
        const featuredServices = await Service.find({ isFeatured: true }).limit(3);
        res.render('index', { 
            user: req.session.user,
            featuredProducts,
            featuredServices
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { user: req.session.user });
});

// Branches page
router.get('/branches', async (req, res) => {
    try {
        const branches = await Branch.find();
        res.render('branches', { user: req.session.user, branches });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Services page
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.render('services', { user: req.session.user, services });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Shopping page
router.get('/shop', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('shop', { user: req.session.user, products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;