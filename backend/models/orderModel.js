const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    cartItems: Array,
    amount: Number,
    status: String,
    paymentMethod: String,
    paymentDetails: Object,
    customer: {
        name: String,
        phone: String,
        address: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    trackingId: String,
    history: Array,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;