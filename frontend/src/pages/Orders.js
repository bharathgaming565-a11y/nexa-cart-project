import { useEffect, useState, useRef } from 'react';

import './Orders.css';
import formatCurrency from '../utils/formatCurrency';

const STEPS = ['Order Placed', 'shipped', 'out for delivery', 'delivered'];

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const polling = useRef(null);
    const prevIds = useRef(new Set());

    const fetchOrders = () => {
        fetch(process.env.REACT_APP_API_URL + '/orders')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const list = data.orders.map(o => ({ ...o, isNew: !prevIds.current.has(o._id) }));
                    setOrders(list);
                    prevIds.current = new Set(data.orders.map(o => o._id));
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        fetchOrders();
        polling.current = setInterval(fetchOrders, 10000);
        return () => clearInterval(polling.current);
    }, []);

    // Delivery is reflected from DB `isCompleted` flag; UI does not allow marking delivered.

    function deleteOrder(id) {
        if (!window.confirm('Delete this order? This cannot be undone.')) return;
        fetch(process.env.REACT_APP_API_URL + '/order/' + id, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setOrders(o => o.filter(x => x._id !== id));
            })
            .catch(() => {});
    }

    function currentStepIndex(order) {
        const last = order.history && order.history.length ? order.history[order.history.length - 1].status : order.status;
        return Math.max(0, STEPS.findIndex(s => s.toLowerCase() === (last || '').toString().toLowerCase()));
    }

    return (
        <div className="orders-page">
            <h2>Orders</h2>
            <div className="orders-list">
                {orders.map(order => {
                    const idx = currentStepIndex(order);
                    return (
                        <div key={order._id} className={`order-card ${order.isNew ? 'fade-in' : ''}`}>
                            <div className="order-head">
                                <div><strong>{order.trackingId}</strong></div>
                                <div>{order.customer?.name} • {order.customer?.phone}</div>
                                <div>{formatCurrency(order.amount)}</div>
                            </div>

                            <div className="stepper">
                                {STEPS.map((step, i) => (
                                    <div key={step} className={`step ${i <= idx ? 'done' : i === idx + 1 ? 'current' : ''}`}>
                                        <div className="step-dot" />
                                        <div className="step-label">{step}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-meta">
                                <div><strong>Customer:</strong> {order.customer?.name}</div>
                                <div><strong>Phone:</strong> {order.customer?.phone}</div>
                                <div><strong>Address:</strong> {order.customer?.address || order.shippingInfo?.address || order.customerInfo?.address}</div>
                                <div><strong>Payment:</strong> {order.paymentMethod || order.paymentMethod === 'COD' ? order.paymentMethod : 'N/A'}</div>
                                {order.isCompleted && <div className="completed-badge">Completed</div>}
                            </div>

                            <div className="order-history">
                                {order.history && order.history.map((h, i) => (
                                    <div key={i} className="history-row">
                                        <div className="h-status">{h.status}</div>
                                        <div className="h-date">{new Date(h.date).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-actions">
                                {/* Delivery is controlled by MongoDB; no client-side complete action */}
                                <button className="danger" onClick={() => deleteOrder(order._id)}>Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
