import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddProduct.css';

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
        <div className="ap-profile" ref={ref}>
            <button className="ap-profile-btn" onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <span className="ap-profile-avatar">{initial}</span>
                <div className="ap-profile-info">
                    <span className="ap-profile-role">Administrator</span>
                    <span className="ap-profile-email">{email}</span>
                </div>
                <span className="ap-profile-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="ap-profile-dropdown">
                    <div className="ap-profile-dropdown-header">
                        <span className="ap-profile-dropdown-avatar">{initial}</span>
                        <div>
                            <div className="ap-profile-dropdown-role">Administrator</div>
                            <div className="ap-profile-dropdown-email">{email}</div>
                        </div>
                    </div>
                    <hr className="ap-profile-divider" />
                    <button className="ap-profile-dropdown-logout" onClick={onLogout}>
                        🚪 Logout
                    </button>
                </div>
            )}
        </div>
    );
}

const EMPTY = {
    name: '', price: '', description: '',
    category: '', seller: '', stock: '', ratings: ''
};

export default function AddProduct() {
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [form, setForm]       = useState(EMPTY);
    const [image, setImage]     = useState(null);      // File object
    const [preview, setPreview] = useState(null);      // Data URL for preview
    const [status, setStatus]   = useState(null);      // {type:'success'|'error', msg}
    const [loading, setLoading] = useState(false);

    // Guard: redirect if not admin
    useEffect(() => {
        if (!sessionStorage.getItem('adminToken')) navigate('/admin/login');
    }, [navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        if (!image) {
            setStatus({ type: 'error', msg: 'Please select a product image.' });
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
            fd.append('image', image);

            const res = await fetch(
                process.env.REACT_APP_API_URL + '/product',
                { method: 'POST', body: fd }
            );
            const data = await res.json();

            if (data.success) {
                setStatus({ type: 'success', msg: `"${data.product.name}" added successfully!` });
                setForm(EMPTY);
                setImage(null);
                setPreview(null);
                if (fileRef.current) fileRef.current.value = '';
            } else {
                setStatus({ type: 'error', msg: data.message || 'Failed to add product.' });
            }
        } catch {
            setStatus({ type: 'error', msg: 'Cannot reach server. Make sure the backend is running.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="ap-layout">
            {/* ── Sidebar ─────────────────────── */}
            <aside className="ap-sidebar">
                <div className="ap-sidebar-brand">
                    <img src="/logo011.png" alt="Nexa Cart" />
                    <span>Nexa Cart</span>
                </div>
                <nav className="ap-nav">
                    <div className="ap-nav-label">Menu</div>
                    <Link to="/admin/dashboard" className="ap-nav-item">
                        <span>🏠</span> Dashboard
                    </Link>
                    <Link to="/admin/add-product" className="ap-nav-item active">
                        <span>➕</span> Add Product
                    </Link>
                    <Link to="/" className="ap-nav-item">
                        <span>🛒</span> View Store
                    </Link>
                </nav>
                <AdminProfile onLogout={handleLogout} />
            </aside>

            {/* ── Main form ───────────────────── */}
            <main className="ap-main">
                <div className="ap-topbar">
                    <h1 className="ap-page-title">Add New Product</h1>
                    <Link to="/admin/dashboard" className="ap-back-btn">← Back to Dashboard</Link>
                </div>

                {status && (
                    <div className={`ap-alert ap-alert--${status.type}`}>
                        {status.type === 'success' ? '✅' : '❌'} {status.msg}
                        {status.type === 'success' && (
                            <button className="ap-view-dash" onClick={() => navigate('/admin/dashboard')}>
                                View Dashboard →
                            </button>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ap-form" encType="multipart/form-data">
                    <div className="ap-form-body">

                        {/* ── Left column: fields ── */}
                        <div className="ap-fields">
                            <div className="ap-group ap-full">
                                <label>Product Name <span className="ap-req">*</span></label>
                                <input
                                    name="name" value={form.name} onChange={handleChange}
                                    placeholder="e.g. Samsung Galaxy S24"
                                    required
                                />
                            </div>

                            <div className="ap-group ap-full">
                                <label>Description</label>
                                <textarea
                                    name="description" value={form.description} onChange={handleChange}
                                    placeholder="Describe the product…"
                                    rows={4}
                                />
                            </div>

                            <div className="ap-row">
                                <div className="ap-group">
                                    <label>Price (USD) <span className="ap-req">*</span></label>
                                    <input
                                        type="number" name="price" value={form.price}
                                        onChange={handleChange} placeholder="e.g. 299.99"
                                        step="0.01" min="0" required
                                    />
                                </div>
                                <div className="ap-group">
                                    <label>Stock Quantity <span className="ap-req">*</span></label>
                                    <input
                                        type="number" name="stock" value={form.stock}
                                        onChange={handleChange} placeholder="e.g. 10"
                                        min="0" required
                                    />
                                </div>
                            </div>

                            <div className="ap-row">
                                <div className="ap-group">
                                    <label>Category <span className="ap-req">*</span></label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        placeholder="Enter category"
                                        required
                                    />
                                </div>
                                <div className="ap-group">
                                    <label>Seller / Brand</label>
                                    <input
                                        name="seller" value={form.seller} onChange={handleChange}
                                        placeholder="e.g. Samsung, Amazon"
                                    />
                                </div>
                            </div>

                            <div className="ap-row">
                                <div className="ap-group">
                                    <label>Initial Rating (0–5)</label>
                                    <input
                                        type="number" name="ratings" value={form.ratings}
                                        onChange={handleChange} placeholder="e.g. 4.5"
                                        step="0.1" min="0" max="5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Right column: image upload ── */}
                        <div className="ap-image-col">
                            <label className="ap-img-label">
                                Product Image <span className="ap-req">*</span>
                            </label>

                            <div
                                className={`ap-drop-zone ${preview ? 'has-preview' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileRef.current.click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="ap-preview-img" />
                                ) : (
                                    <div className="ap-drop-hint">
                                        <div className="ap-drop-icon">📷</div>
                                        <div className="ap-drop-text">Click or drag image here</div>
                                        <div className="ap-drop-sub">JPG, PNG, WEBP — max 5 MB</div>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                className="ap-file-input"
                            />

                            {preview && (
                                <button
                                    type="button"
                                    className="ap-remove-img"
                                    onClick={() => { setImage(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                >
                                    ✕ Remove image
                                </button>
                            )}

                            {image && (
                                <div className="ap-file-name">📎 {image.name}</div>
                            )}
                        </div>

                    </div>{/* end ap-form-body */}

                    <div className="ap-form-footer">
                        <button type="submit" className="ap-submit-btn" disabled={loading}>
                            {loading ? 'Adding Product…' : '✚ Add Product'}
                        </button>
                        <button
                            type="button"
                            className="ap-reset-btn"
                            onClick={() => { setForm(EMPTY); setImage(null); setPreview(null); setStatus(null); if (fileRef.current) fileRef.current.value = ''; }}
                            disabled={loading}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
