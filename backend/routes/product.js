const express = require('express');
const {
    getProducts,
    getSingleProduct,
    createProduct,
    deleteProduct,
    upload
} = require('../controllers/productController');

const router = express.Router();

router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct).delete(deleteProduct);
router.route('/product').post(upload.single('image'), createProduct);

module.exports = router;
