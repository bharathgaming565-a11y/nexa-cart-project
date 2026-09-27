const express = require('express');
const {
    getCategories,
    createCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.route('/categories').get(getCategories);
router.route('/category').post(createCategory);
router.route('/category/:id').delete(deleteCategory);

module.exports = router;
