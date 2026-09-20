import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Cart.css';
import formatCurrency from '../utils/formatCurrency';

export default function Cart({ cartItems, setCartItems }) {
    const [complete, setComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [paymentRef, setPaymentRef] = useState('');
    const [order, setOrder] = useState(null);

    function increaseQty(item) {
        if (item.product.stock === item.qty) {
            return;
        }
        const updatedItems = cartItems.map((i) => {
            if (i.product._id === item.product._id) {
                i.qty++;
            }
            return i;
        });
        setCartItems(updatedItems);
    }

    function decreaseQty(item) {
        if (item.qty > 1) {
            const updatedItems = cartItems.map((i) => {
                if (i.product._id === item.product._id) {
                    i.qty--;
                }
                return i;
            });
            setCartItems(updatedItems);
        }
    }

    function removeItem(item) {
        const updatedItems = cartItems.filter((i) => i.product._id !== item.product._id);
        setCartItems(updatedItems);
    }

    function placeOrderHandler() {
        // validate customer details
        if (!customerName || !customerPhone || !customerAddress) {
            toast.error('Please provide name, phone and address for delivery');
            return;
        }

        const payload = {
            cartItems,
            customer: { name: customerName, phone: customerPhone, address: customerAddress },
            paymentMethod,
            paymentDetails: paymentMethod === 'upi' ? { upiRef: paymentRef } : {}
        };

        fetch(process.env.REACT_APP_API_URL + '/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setOrder(data.order);
                    setCartItems([]);
                    setComplete(true);
                    toast.success(`Order placed successfully with ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}!`);
                } else {
                    toast.error(data.message || 'Could not place order');
                }
            })
            .catch(() => toast.error('Network error while placing order'));
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);

    return cartItems.length > 0 ? (
        <Fragment>
            <div className="cart-page">
                <div className="cart-container">
                    <div className="cart-list">
                        <h2>Your Cart <span>{subtotal} items</span></h2>
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.product._id}>
                                <img src={item.product.images[0].image} alt={item.product.name} />
                                <div className="cart-item-info">
                                    <Link to={'/product/' + item.product._id}>{item.product.name}</Link>
                                    <p>{formatCurrency(item.product.price)}</p>
                                </div>
                                <div className="qty-control">
                                    <button onClick={() => decreaseQty(item)}>-</button>
                                    <input type="number" value={item.qty} readOnly />
                                    <button onClick={() => increaseQty(item)}>+</button>
                                </div>
                                <button className="remove-btn" onClick={() => removeItem(item)}>Remove</button>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-panel">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{subtotal} items</span>
                        </div>
                        <div className="summary-row total">
                            <span>Estimated Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>

                        <div className="payment-options">
                            <label className={paymentMethod === 'cod' ? 'payment-option active' : 'payment-option'}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                Cash on Delivery
                            </label>
                            <label className={paymentMethod === 'upi' ? 'payment-option active' : 'payment-option'}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                />
                                UPI Payment
                            </label>
                        </div>

                        <div className="customer-form">
                            <input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                            <input placeholder="Phone number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                            <textarea placeholder="Delivery address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                            {paymentMethod === 'upi' && (
                                <input placeholder="UPI reference / transaction id" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
                            )}
                        </div>

                        <button className="primary-btn place-order-btn" onClick={placeOrderHandler}>
                            Place Order · {paymentMethod === 'cod' ? 'COD' : 'UPI'}
                        </button>
                    </div>
                </div>
            </div>
        </Fragment>
    ) : !complete ? (
        <div className="empty-cart">
            <h2>Your Cart is Empty!</h2>
            <p>Start shopping to fill it with amazing deals.</p>
            <Link to="/" className="primary-btn">Continue Shopping</Link>
        </div>
    ) : order ? (
        <div className="order-tracking">
            <h2>Order {order.trackingId}</h2>
            <p>Recipient: {order.customer?.name} • {order.customer?.phone}</p>
            <div className="tracking-steps">
                {order.history && order.history.map((h, idx) => (
                    <div key={idx} className={`step ${idx === order.history.length - 1 ? 'current' : ''}`}>
                        <div className="step-title">{h.status}</div>
                        <div className="step-date">{new Date(h.date).toLocaleString()}</div>
                    </div>
                ))}
            </div>
            <Link to="/" className="primary-btn">Shop Again</Link>
        </div>
    ) : (
        <div className="order-complete">
            <h2>Order Complete!</h2>
            <p>Your order has been placed successfully.</p>
            <Link to="/" className="primary-btn">Shop Again</Link>
        </div>
    );
}