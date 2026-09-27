const Category = require('../models/categoryModel');

// GET /api/v1/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/v1/category  (admin)
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        // Generate a value slug from the name (lowercase, spaces kept for compatibility)
        const value = name.trim();

        // Check for duplicate (case-insensitive)
        const existing = await Category.findOne({ value: { $regex: `^${value}$`, $options: 'i' } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Category already exists' });
        }

        const category = await Category.create({ name: name.trim(), value });
        res.status(201).json({ success: true, category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/v1/category/:id  (admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
