import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminCategories.css';

const API = process.env.REACT_APP_API_URL;

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
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="ac-profile" ref={ref}>
            <button className="ac-profile-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <span className="ac-profile-avatar">{initial}</span>
                <div className="ac-profile-info">
                    <span className="ac-profile-role">Administrator</span>
                    <span className="ac-profile-email">{email}</span>
                </div>
                <span className="ac-profile-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="ac-profile-dropdown">
                    <div className="ac-profile-dropdown-header">
                        <span className="ac-profile-dropdown-avatar">{initial}</span>
                        <div>
                            <div className="ac-profile-dropdown-role">Administrator</div>
                            <div className="ac-profile-dropdown-email">{email}</div>
                        </div>
                    </div>
                    <hr className="ac-profile-divider" />
                    <button className="ac-profile-dropdown-logout" onClick={onLogout}>
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AdminCategories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [newName, setNewName]       = useState('');
    const [adding, setAdding]         = useState(false);
    const [deleting, setDeleting]     = useState(null);
    const [alert, setAlert]           = useState(null); // { type: 'success'|'error', msg }

    // Guard: redirect if not admin
    useEffect(() => {
        if (!sessionStorage.getItem('adminToken')) navigate('/admin/login');
    }, [navigate]);

    const fetchCategories = () => {
        setLoading(true);
        fetch(API + '/categories')
            .then(r => r.json())
            .then(d => setCategories(d.categories || []))
            .catch(() => setCategories([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCategories(); }, []);

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert(null), 3500);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;

        setAdding(true);
        try {
            const res  = await fetch(API + '/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.success) {
                setCategories(prev => [...prev, data.category]);
                setNewName('');
                showAlert('success', `"${data.category.name}" added successfully.`);
            } else {
                showAlert('error', data.message || 'Failed to add category.');
            }
        } catch {
            showAlert('error', 'Cannot reach server. Make sure the backend is running.');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"?\nProducts in this category won't be affected.`)) return;
        setDeleting(id);
        try {
            const res  = await fetch(API + '/category/' + id, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setCategories(prev => prev.filter(c => c._id !== id));
                showAlert('success', `"${name}" deleted.`);
            } else {
                showAlert('error', data.message || 'Delete failed.');
            }
        } catch {
            showAlert('error', 'Server error while deleting.');
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="ac-layout">
            {/* ── Sidebar ─────────────────────────── */}
            <aside className="ac-sidebar">
                <div className="ac-sidebar-brand">
                    <img src="/logo011.png" alt="Nexa Cart" />
                    <span>Nexa Cart</span>
                </div>

                <nav className="ac-nav">
                    <div className="ac-nav-label">Menu</div>
                    <Link to="/admin/dashboard" className="ac-nav-item">
                        <span>🏠</span> Dashboard
                    </Link>
                    <Link to="/admin/add-product" className="ac-nav-item">
                        <span>➕</span> Add Product
                    </Link>
                    <Link to="/admin/categories" className="ac-nav-item active">
                        <span>🏷️</span> Categories
                    </Link>
                    <Link to="/" className="ac-nav-item">
                        <span>🛒</span> View Store
                    </Link>
                </nav>

                <AdminProfile onLogout={handleLogout} />
            </aside>

            {/* ── Main content ─────────────────────── */}
            <main className="ac-main">
                <div className="ac-topbar">
                    <h1 className="ac-page-title">Manage Categories</h1>
                </div>

                {/* Alert */}
                {alert && (
                    <div className={`ac-alert ac-alert--${alert.type}`}>
                        {alert.type === 'success' ? '✅' : '❌'} {alert.msg}
                    </div>
                )}

                {/* Add category form */}
                <div className="ac-card">
                    <h2 className="ac-card-title">Add New Category</h2>
                    <form className="ac-add-form" onSubmit={handleAdd}>
                        <input
                            className="ac-input"
                            type="text"
                            placeholder="e.g. Gaming, Home Appliances, Laptops, Home decrotion…"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            disabled={adding}
                            maxLength={60}
                        />
                        <button className="ac-add-btn" type="submit" disabled={adding || !newName.trim()}>
                            {adding ? 'Adding…' : '+ Add Category'}
                        </button>
                    </form>
                    <p className="ac-hint">
                        The name you type here will appear in the storefront Categories dropdown and in the Add Product form.
                    </p>
                </div>

                {/* Categories list */}
                <div className="ac-card">
                    <h2 className="ac-card-title">
                        All Categories
                        <span className="ac-count">{categories.length}</span>
                    </h2>

                    {loading ? (
                        <div className="ac-empty">Loading categories…</div>
                    ) : categories.length === 0 ? (
                        <div className="ac-empty">No categories yet. Add one above.</div>
                    ) : (
                        <ul className="ac-list">
                            {categories.map(cat => (
                                <li key={cat._id} className="ac-list-item">
                                    <span className="ac-badge">🏷️</span>
                                    <span className="ac-cat-name">{cat.name}</span>
                                    <button
                                        className="ac-del-btn"
                                        onClick={() => handleDelete(cat._id, cat.name)}
                                        disabled={deleting === cat._id}
                                        aria-label={`Delete ${cat.name}`}
                                    >
                                        {deleting === cat._id ? '…' : '🗑 Delete'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}
