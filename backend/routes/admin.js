const express = require('express');
const { adminLogin } = require('../controllers/adminController');
const router = express.Router();

router.route('/admin/login').post(adminLogin);

module.exports = router;
