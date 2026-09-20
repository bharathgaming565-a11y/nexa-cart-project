import { useEffect, useState, useRef } from 'react';
import './Biller.css';

export default function Biller() {
    const [customers, setCustomers] = useState([]);
    const prevIds = useRef(new Set());

    const fetchCustomers = () => {
        fetch(process.env.REACT_APP_API_URL + '/customers_collection')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // flatten customer documents into one entry per order (so biller shows each placed order)
                    const rows = [];
                    data.customers.forEach(cust => {
                        (cust.orders || []).forEach(o => {
                            rows.push({
                                orderId: o.orderId,
                                trackingId: o.trackingId,
                                name: cust.name,
                                phone: cust.phone,
                                address: cust.address,
                                amount: o.amount,
                                createdAt: o.createdAt,
                                status: o.status
                            });
                        });
                    });
                    // mark new rows
                    const list = rows.map(r => ({ ...r, isNew: !prevIds.current.has(r.orderId) }));
                    setCustomers(list);
                    prevIds.current = new Set(list.map(l => l.orderId));
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        fetchCustomers();
        const t = setInterval(fetchCustomers, 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="biller-page">
            <h2>Mango City Biller</h2>
            <div className="biller-list">
                {customers.map(c => (
                    <div key={c.orderId} className={`biller-row ${c.isNew ? 'fade-in' : ''}`}>
                        <div className="b-left">
                            <div className="b-name">{c.name}</div>
                            <div className="b-phone">{c.phone}</div>
                            <div className="b-address">{c.address}</div>
                        </div>
                        <div className="b-right">
                            <div className="b-amt">₹{c.amount}</div>
                            <div className="b-time">{new Date(c.createdAt).toLocaleString()}</div>
                            <div className="b-track">{c.trackingId}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
