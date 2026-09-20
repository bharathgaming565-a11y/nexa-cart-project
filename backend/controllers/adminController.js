// POST /api/v1/admin/login
exports.adminLogin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        return res.json({
            success: true,
            message: 'Admin authenticated',
            token: Buffer.from(`${email}:${password}`).toString('base64')
        });
    }

    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
};
