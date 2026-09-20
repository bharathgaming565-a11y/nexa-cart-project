import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

export default function AdminLogin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(
                process.env.REACT_APP_API_URL + '/admin/login',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                }
            );
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem('adminToken', data.token);
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch {
            setError('Cannot reach server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="al-page">
            <div className="al-card">
                {/* Brand */}
                <div className="al-brand">
                    <img src="/logo011.png" alt="Nexa Cart" className="al-logo" />
                    <span className="al-brand-name">Nexa Cart</span>
                </div>

                <h2 className="al-title">Admin Login</h2>
                <p className="al-sub">Access the admin dashboard</p>

                {error && <div className="al-error">{error}</div>}

                <form onSubmit={handleSubmit} className="al-form">
                    <div className="al-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="admin@nexacart.com"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="al-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button className="al-btn" type="submit" disabled={loading}>
                        {loading ? 'Logging in…' : 'Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
