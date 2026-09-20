const express = require('express');
const router = express.Router();
const {createOrder, getOrders, updateOrder, deleteOrder, getCustomers } = require('../controllers/orderController');

router.route('/order').post(createOrder);
router.route('/orders').get(getOrders);
router.route('/order/:id')
	.patch(updateOrder)
	.delete(deleteOrder);
router.route('/customers').get(getCustomers);
router.route('/customers_collection').get(require('../controllers/orderController').getCustomersCollection);

module.exports = router;
