const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: String,
    phone: { type: String, unique: false },
    address: String,
    orders: [
        {
            orderId: mongoose.Schema.Types.ObjectId,
            trackingId: String,
            amount: Number,
            status: String,
            createdAt: Date
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const customerModel = mongoose.model('Customer', customerSchema);
module.exports = customerModel;
