const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', 'config.env') });
const mongoose = require('mongoose');
const Order = require('../models/orderModel');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { maxPoolSize: 10 });
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50).lean();
    console.log(JSON.stringify(orders, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
