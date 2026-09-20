const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const customerModel = require('../models/customerModel');

//Create Order - /api/v1/order 
exports.createOrder = async (req, res, next) => {
    try {
        let { cartItems, customer, paymentMethod, paymentDetails } = req.body || {};

        // Support legacy/alternate keys from various clients
        customer = customer || req.body.customerInfo || req.body.shippingInfo || req.body.customerData || {};

        // Validate customer details presence
        if (!customer || !customer.name || !customer.phone || !customer.address) {
            console.warn('createOrder: missing customer details in payload:', JSON.stringify(req.body).slice(0, 200));
            return res.status(400).json({ success: false, message: 'Customer name, phone and address are required' });
        }

        // Normalize cartItems if client sent the body differently
        if (!Array.isArray(cartItems) && Array.isArray(req.body)) {
            cartItems = req.body;
        }

        // Log cartItems info for debugging issues where arrays appear truncated
        try {
            console.log('createOrder: cartItems length=', Array.isArray(cartItems) ? cartItems.length : 'not-array');
            if (Array.isArray(cartItems)) console.log('createOrder: sample items=', JSON.stringify(cartItems.slice(0,5)).slice(0,1000));
        } catch (e) { console.warn('createOrder: failed to log cartItems', e); }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const amount = Number(cartItems.reduce((acc, item) => (acc + (item.product?.price || 0) * (item.qty || 0)), 0)).toFixed(2);

        const status = paymentMethod === 'upi' ? 'paid' : 'pending';

        const trackingId = 'ORD' + Date.now();

        const history = [{ status: 'Order Placed', date: new Date() }];

        const orderData = {
            cartItems,
            amount: Number(amount),
            status,
            paymentMethod,
            paymentDetails: paymentDetails || {},
            customer: customer || {},
            trackingId,
            history
        };

        const order = await orderModel.create(orderData);

        // Upsert customer document and append order summary
        try {
            const summary = { orderId: order._id, trackingId: order.trackingId, amount: order.amount, status: order.status, createdAt: order.createdAt };
            await customerModel.findOneAndUpdate(
                { phone: customer.phone },
                { $set: { name: customer.name, address: customer.address }, $push: { orders: summary } },
                { upsert: true, new: true }
            );
        } catch (e) {
            console.error('Failed to upsert customer:', e);
        }

        // Updating product stock
        cartItems.forEach(async (item) => {
            const product = await productModel.findById(item.product._id);
            if (product) {
                product.stock = Math.max(0, product.stock - item.qty);
                await product.save();
            }
        })

        res.json({ success: true, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Get all orders - admin/user view
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await orderModel.find().sort({ createdAt: -1 });
        // Map isCompleted -> delivered for clients that read directly from DB
        const mapped = orders.map(o => {
            const obj = o.toObject ? o.toObject() : o;
            if (obj.isCompleted && (obj.status || '').toString().toLowerCase() !== 'delivered') {
                obj.status = 'delivered';
            }
            return obj;
        });
        res.json({ success: true, orders: mapped });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Update order status / add history entry
exports.updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const order = await orderModel.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (status) {
            order.status = status;
            order.history = order.history || [];
            order.history.push({ status, note: note || '', date: new Date() });
            // mark as completed when status is 'completed', 'complete', or 'delivered'
            const stLower = status.toString().toLowerCase();
            if (stLower === 'completed' || stLower === 'complete' || stLower === 'delivered') {
                // require admin token when marking delivered
                if (stLower === 'delivered') {
                    const adminToken = process.env.ADMIN_TOKEN || 'secret123';
                    const provided = (req.headers['x-admin-token'] || '').toString();
                    if (provided !== adminToken) {
                        return res.status(403).json({ success: false, message: 'Admin token required to mark delivered' });
                    }
                }
                order.isCompleted = true;
                order.completedAt = new Date();
            }
        }

        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Delete an order
exports.deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await orderModel.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        await orderModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Get customers list (from orders)
exports.getCustomers = async (req, res, next) => {
    try {
        const orders = await orderModel.find().sort({ createdAt: -1 });
        const customers = orders.map(o => ({
            orderId: o._id,
            trackingId: o.trackingId,
            name: o.customer?.name || '',
            phone: o.customer?.phone || '',
            address: o.customer?.address || '',
            amount: o.amount,
            createdAt: o.createdAt,
            isCompleted: o.isCompleted || false
        }));
        res.json({ success: true, customers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// Get customers directly from customers collection
exports.getCustomersCollection = async (req, res, next) => {
    try {
        const customers = await customerModel.find().sort({ createdAt: -1 });
        res.json({ success: true, customers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}