import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';
import formatCurrency from '../../utils/formatCurrency';

const API = process.env.REACT_APP_API_URL;
const IMG_BASE = API ? API.replace('/api/v1', '') : 'http://localhost:8000';

function getAdminEmail() {
    try {
        const token = sessionStorage.getItem('adminToken');
        if (!token) return 'Admin';
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email || payload.sub || 'Admin';
    } catch {
        return 'Admin';
    }
}

function AdminProfile({ onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const email = getAdminEmail();
    const initial = email[0].toUpperCase();

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="ad-profile" ref={ref}>
            <button className="ad-profile-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <span className="ad-profile-avatar">{initial}</span>
                <div className="ad-profile-info">
                    <span className="ad-profile-role">Administrator</span>
                    <span className="ad-profile-email">{email}</span>
                </div>
                <span className="ad-profile-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="ad-profile-dropdown">
                    <div className="ad-profile-dropdown-header">
                        <span className="ad-profile-dropdown-avatar">{initial}</span>
                        <div>
                            <div className="ad-profile-dropdown-role">Administrator</div>
                            <div className="ad-profile-dropdown-email">{email}</div>
                        </div>
                    </div>
                    <hr className="ad-profile-divider" />
                    <button className="ad-profile-dropdown-logout" onClick={onLogout}>
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    // Guard: redirect if not admin
    useEffect(() => {
        if (!sessionStorage.getItem('adminToken')) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Load all products
    const fetchProducts = () => {
        setLoading(true);
        fetch(API + '/products')
            .then(r => r.json())
            .then(d => setProducts(d.products || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        setDeleting(id);
        try {
            const res = await fetch(API + '/product/' + id, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.filter(p => p._id !== id));
            } else {
                alert('Delete failed: ' + data.message);
            }
        } catch {
            alert('Server error while deleting.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="ad-layout">
            {/* ── Sidebar ─────────────────────────── */}
            <aside className="ad-sidebar">
                <div className="ad-sidebar-brand">
                    <img src="/logo011.png" alt="Nexa Cart" />
                    <span>Nexa Cart</span>
                </div>

                <nav className="ad-nav">
                    <div className="ad-nav-label">Menu</div>
                    <Link to="/admin/dashboard" className="ad-nav-item active">
                        <span>🏠</span> Dashboard
                    </Link>
                    <Link to="/admin/add-product" className="ad-nav-item">
                        <span>➕</span> Add Product
                    </Link>
                    <Link to="/" className="ad-nav-item">
                        <span>🛒</span> View Store
                    </Link>
                </nav>

                <AdminProfile onLogout={handleLogout} />
            </aside>

            {/* ── Main content ─────────────────────── */}
            <main className="ad-main">
                <div className="ad-topbar">
                    <h1 className="ad-page-title">Dashboard</h1>
                    <Link to="/admin/add-product" className="ad-add-btn">
                        + Add New Product
                    </Link>
                </div>

                {/* Stats row */}
                <div className="ad-stats">
                    <div className="ad-stat-card">
                        <div className="ad-stat-num">{products.length}</div>
                        <div className="ad-stat-label">Total Products</div>
                    </div>
                    <div className="ad-stat-card">
                        <div className="ad-stat-num">
                            {products.filter(p => Number(p.stock) > 0).length}
                        </div>
                        <div className="ad-stat-label">In Stock</div>
                    </div>
                    <div className="ad-stat-card">
                        <div className="ad-stat-num">
                            {products.filter(p => Number(p.stock) === 0).length}
                        </div>
                        <div className="ad-stat-label">Out of Stock</div>
                    </div>
                </div>

                {/* Products table */}
                <div className="ad-table-wrap">
                    <h2 className="ad-section-title">All Products</h2>

                    {loading ? (
                        <div className="ad-loading">Loading products…</div>
                    ) : products.length === 0 ? (
                        <div className="ad-empty">No products found. <Link to="/admin/add-product">Add one →</Link></div>
                    ) : (
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p._id}>
                                        <td>
                                            <img
                                                className="ad-thumb"
                                                src={
                                                    p.images && p.images[0]
                                                        ? (p.images[0].image.startsWith('http')
                                                            ? p.images[0].image
                                                            : IMG_BASE + p.images[0].image)
                                                        : '/images/logo.png'
                                                }
                                                alt={p.name}
                                            />
                                        </td>
                                        <td className="ad-name">{p.name}</td>
                                        <td><span className="ad-badge">{p.category}</span></td>
                                        <td className="ad-price">{formatCurrency(p.price)}</td>
                                        <td>
                                            <span className={Number(p.stock) > 0 ? 'ad-in-stock' : 'ad-out-stock'}>
                                                {Number(p.stock) > 0 ? p.stock : 'Out'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="ad-del-btn"
                                                onClick={() => handleDelete(p._id)}
                                                disabled={deleting === p._id}
                                            >
                                                {deleting === p._id ? '…' : '🗑 Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
