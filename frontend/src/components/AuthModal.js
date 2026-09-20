import { useState } from 'react';
import './AuthModal.css';

export default function AuthModal({ type, onClose, onSwitchType }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`${type} submitted:`, formData);
        // Add authentication logic here
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        onClose();
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                    <h2>{type === 'login' ? 'Login' : 'Register'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {type === 'register' && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {type === 'register' && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        {type === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>

                <div className="auth-switch">
                    {type === 'login' ? (
                        <p>Don't have an account? <button onClick={() => onSwitchType('register')}>Register</button></p>
                    ) : (
                        <p>Already have an account? <button onClick={() => onSwitchType('login')}>Login</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}
