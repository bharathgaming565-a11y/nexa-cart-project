const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDatabase = require('./config/connectDatabase');
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const products = require('./routes/product');
const orders   = require('./routes/order');
const admin    = require('./routes/admin');
const auth     = require('./routes/auth');

connectDatabase();

app.use(express.json());
app.use(cors());

app.use('/api/v1/', products);
app.use('/api/v1/', orders);
app.use('/api/v1/', admin);
app.use('/api/v1/', auth);

// Serve product images (works in both dev and production)
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'public', 'images')));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'));
    });
}

app.listen(process.env.PORT, () => {
    console.log(`Server listening on Port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});
