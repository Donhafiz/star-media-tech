const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add to cart
router.post('/cart/add', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Please login' });
    }

    try {
        const { productId, quantity } = req.body;
        // In a real application, you would update the user's cart in the database
        // For now, we'll use session
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItem = req.session.cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            req.session.cart.push({ productId, quantity });
        }

        res.json({ message: 'Product added to cart', cart: req.session.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Checkout
router.post('/checkout', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Please login' });
    }

    try {
        const { shippingAddress, paymentMethod } = req.body;
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total
        let totalAmount = 0;
        const items = [];
        for (const item of cart) {
            const product = await Product.findById(item.productId);
            if (product) {
                totalAmount += product.price * item.quantity;
                items.push({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity
                });
            }
        }

        // Create order
        const order = new Order({
            userId: req.session.user.id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        });
        await order.save();

        // Clear cart
        req.session.cart = [];

        res.json({ message: 'Order placed successfully', orderId: order._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;