const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const nodemailer = require('nodemailer');

// Initialize chatbot responses
const chatbotResponses = {
    greeting: "Hello! Welcome to STAR MEDIA TECH. How can I assist you today?",
    services: "We offer a wide range of services including media production, tech solutions, and equipment sales. You can view our services on the services page.",
    pricing: "For pricing information, please visit our services page or contact us directly.",
    branches: "We have multiple branches. Check our branches page for locations and contact details.",
    products: "We sell various tech products and media equipment. Visit our shop to see our products.",
    support: "For technical support, please call us at +233505957381 or email starmedia381@gmail.com",
    default: "I'm sorry, I didn't understand that. Please contact us directly for more assistance."
};

// Start a chat session
router.post('/start', async (req, res) => {
    try {
        const { userId } = req.body;
        const sessionId = require('crypto').randomBytes(16).toString('hex');

        const chat = new Chat({
            sessionId,
            userId: userId || null,
            messages: [{
                sender: 'bot',
                message: chatbotResponses.greeting
            }]
        });
        await chat.save();

        res.json({ sessionId, message: chatbotResponses.greeting });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/send', async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        let chat = await Chat.findOne({ sessionId });
        if (!chat) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        // Add user message
        chat.messages.push({ sender: 'user', message });
        
        // Generate bot response (simple keyword matching)
        let botResponse = chatbotResponses.default;
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            botResponse = chatbotResponses.greeting;
        } else if (lowerMessage.includes('service')) {
            botResponse = chatbotResponses.services;
        } else if (lowerMessage.includes('price')) {
            botResponse = chatbotResponses.pricing;
        } else if (lowerMessage.includes('branch') || lowerMessage.includes('location')) {
            botResponse = chatbotResponses.branches;
        } else if (lowerMessage.includes('product') || lowerMessage.includes('buy')) {
            botResponse = chatbotResponses.products;
        } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
            botResponse = chatbotResponses.support;
        }

        // Add bot response
        chat.messages.push({ sender: 'bot', message: botResponse });
        await chat.save();

        res.json({ message: botResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send chat transcript via email
router.post('/email', async (req, res) => {
    try {
        const { sessionId } = req.body;

        const chat = await Chat.findOne({ sessionId });
        if (!chat) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        // Configure nodemailer (you need to set up your email in .env)
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let chatTranscript = 'Chat Transcript:\n\n';
        chat.messages.forEach(msg => {
            chatTranscript += `${msg.sender}: ${msg.message}\n`;
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'starmedia381@gmail.com',
            subject: `Chat Transcript - Session ${sessionId}`,
            text: chatTranscript
        };

        await transporter.sendMail(mailOptions);
        chat.emailSent = true;
        await chat.save();

        res.json({ message: 'Chat transcript sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;