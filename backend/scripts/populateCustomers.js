const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', 'config.env') });
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { maxPoolSize: 10 });
    const orders = await Order.find().lean();
    for (const o of orders) {
      const summary = { orderId: o._id, trackingId: o.trackingId, amount: o.amount, status: o.status, createdAt: o.createdAt };
      await Customer.findOneAndUpdate(
        { phone: o.customer?.phone },
        { $set: { name: o.customer?.name || '', address: o.customer?.address || '' }, $push: { orders: summary } },
        { upsert: true, new: true }
      );
    }
    const docs = await Customer.find().lean();
    console.log(JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
