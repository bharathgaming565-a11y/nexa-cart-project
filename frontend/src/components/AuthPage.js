import { useState } from 'react';
import './AuthPage.css';

const API = process.env.REACT_APP_API_URL;

export default function AuthPage({ mode, onModeChange, onAuthSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side confirm-password check before hitting the network
        if (mode === 'register' && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
            const body = mode === 'register'
                ? { name: formData.name, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword }
                : { email: formData.email, password: formData.password };

            const res  = await fetch(API + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.message || 'Something went wrong. Please try again.');
                return;
            }

            // Success — pass user object up and clear the form
            onAuthSuccess(data.user);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });

        } catch {
            setError('Cannot reach the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setError('');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        onModeChange(newMode);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-header">
                    <img
                        src="/logo011.png"
                        alt="Nexa Cart Logo"
                        className="brand-logo"
                    />
                    <span className="brand-name">Nexa Cart</span>
                </div>

                <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                <p className="auth-subtitle">
                    {mode === 'login'
                        ? 'Log in to explore your favorite deals.'
                        : 'Create an account to enjoy fast checkout.'}
                </p>

                <div className="mode-switch">
                    <button
                        className={mode === 'login' ? 'mode-btn active' : 'mode-btn'}
                        onClick={() => switchMode('login')}
                        type="button"
                    >
                        Login
                    </button>
                    <button
                        className={mode === 'register' ? 'mode-btn active' : 'mode-btn'}
                        onClick={() => switchMode('register')}
                        type="button"
                    >
                        Register
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    <button className="primary-btn" type="submit" disabled={loading}>
                        {loading
                            ? (mode === 'login' ? 'Logging in…' : 'Creating account…')
                            : (mode === 'login' ? 'Login to Nexa Cart' : 'Create Account')
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
