const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', 'config.env') });
const mongoose = require('mongoose');
const Order = require('../models/orderModel');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { maxPoolSize: 10 });
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
    const customers = orders.map(o => ({ orderId: o._id, trackingId: o.trackingId, name: o.customer?.name || '', phone: o.customer?.phone || '', address: o.customer?.address || '', amount: o.amount, createdAt: o.createdAt, isCompleted: o.isCompleted || false }));
    console.log(JSON.stringify(customers, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
