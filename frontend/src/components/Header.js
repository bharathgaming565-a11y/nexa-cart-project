import { Link } from "react-router-dom";
import { useState } from "react";
import Search from "./Search";
import CategoriesDropdown from "./CategoriesDropdown";
import "./Header.css";

function ProfileDropdown({ user, onLogout }) {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen(!open);

    const displayName = user?.name || user?.email || 'Guest';

    return (
        <div className="profile-wrapper">
            <button className="profile-btn" onClick={toggle} aria-expanded={open}>
                <span className="profile-avatar">{(displayName || 'G')[0].toUpperCase()}</span>
            </button>

                {open && (
                <div className="profile-dropdown">
                    <div className="profile-item profile-name">{displayName}</div>
                    <button className="profile-item profile-logout" onClick={onLogout}>Logout</button>
                </div>
            )}
        </div>
    );
}

export default function Header({ cartItems, user, onLogout }) {
    const totalUnits = Array.isArray(cartItems) ? cartItems.reduce((s, i) => s + (i.qty || 0), 0) : 0;
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <ProfileDropdown user={user} onLogout={onLogout} />
                    <div className="navbar-brand">
                        <Link to="/">
                            <img src="/logo011.png" alt="nexa cart" className="brand-logo" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/images/logo.png'}} />
                            <span className="brand-name">nexa cart</span>
                        </Link>
                    </div>
                </div>

                <div className="navbar-center">
                    <Search />
                </div>

                <div className="navbar-right">
                    <CategoriesDropdown />
                    <Link to="/admin/dashboard" className="admin-link">
                        <span className="admin-icon">⚙️</span>
                        <span className="admin-text">Admin</span>
                    </Link>
                    <Link to="/orders" className="orders-link">
                        <span className="orders-icon">📦</span>
                        <span className="orders-text">Orders</span>
                    </Link>
                    <Link to="/cart" className="cart-link">
                        <span className="cart-icon">🛍️</span>
                        <span className="cart-text">Cart</span>
                        <span className="cart-count">{totalUnits}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}