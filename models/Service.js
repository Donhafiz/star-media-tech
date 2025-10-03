const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: String,
    isFeatured: { type: Boolean, default: false },
    imageUrl: String
});

module.exports = mongoose.model('Service', serviceSchema);