const path = require('path');
const multer = require('multer');
const ProductModel = require('../models/productModel');

// ── Multer storage: save to frontend/public/images/products ──────────────────
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'products'));
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, unique + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── GET /api/v1/products ──────────────────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
    const query = {};

    if (req.query.keyword) {
        query.name = { $regex: req.query.keyword, $options: 'i' };
    }

    if (req.query.category && req.query.category.trim()) {
        const requestedCategory = req.query.category.trim();

        // Keep category filtering compatible with products already stored
        // using older spellings/capitalization.
        const categoryAliases = {
            'Home Appliances': [
                'Home Appliances', 'Home Appliance',
                'home appliances', 'home appliance'
            ],
            'Computer Products': [
                'Computer Products', 'computer products',
                'computer product', 'Computer Product', 'Laptops', 'laptops'
            ],
            'Gaming Products': [
                'Gaming Products', 'Gaming Product',
                'gaming products', 'gaming product',
                'Gaming', 'gaming'
            ],
            'Home Decoration': [
                'Home Decoration', 'home decoration'
            ],
            'Dress': [
                'Dress', 'dress'
            ],
            'Sports Product': [
                'Sports Product', 'Sports Products',
                'sports product', 'sports products',
                'Sports', 'sports'
            ]
        };

        const aliases = categoryAliases[requestedCategory] || [requestedCategory];

        query.category = {
            $in: aliases.map(value => new RegExp(
                '^' + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
                'i'
            ))
        };
    }

    const products = await ProductModel.find(query);
    res.json({ success: true, products });
};

// ── GET /api/v1/product/:id ───────────────────────────────────────────────────
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        res.json({ success: true, product });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Unable to get Product with that ID' });
    }
};

// ── POST /api/v1/product (Admin only) ────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
    try {
        const { name, price, description, category, seller, stock, ratings } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: 'Name, price and category are required' });
        }

        // Build images array from uploaded file
        const images = [];
        if (req.file) {
            images.push({ image: '/images/products/' + req.file.filename });
        }

        const product = await ProductModel.create({
            name,
            price: String(price),
            description: description || '',
            ratings: ratings ? String(ratings) : '0',
            images,
            category,
            seller: seller || '',
            stock: stock ? String(stock) : '0',
            numOfReviews: '0',
            createdAt: new Date()
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// ── DELETE /api/v1/product/:id (Admin only) ───────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
