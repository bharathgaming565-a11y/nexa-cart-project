const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', 'config.env') });
const mongoose = require('mongoose');
const ProductModel = require('../models/productModel');
const products = require('../data/products.json');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { maxPoolSize: 10 });
    console.log('Connected to MongoDB:', process.env.DB_URL);

    // Delete all existing products
    await ProductModel.deleteMany({});
    console.log('Cleared existing products.');

    // Insert all products from products.json
    const inserted = await ProductModel.insertMany(products);
    console.log(`Successfully inserted ${inserted.length} products.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
