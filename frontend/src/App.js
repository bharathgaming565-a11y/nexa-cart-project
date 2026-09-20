import './App.css';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductDetail from './pages/ProductDetail';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cart from './pages/Cart';
import AuthPage from './components/AuthPage';
import Orders from './pages/Orders';
import Biller from './pages/Biller';
import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct     from './pages/admin/AddProduct';

function App() {
  const [cartItems, setCartItems]           = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode]             = useState('login');
  const [user, setUser]                     = useState(null);

  const handleAuthSuccess = (userObj) => {
    setIsAuthenticated(true);
    setUser(userObj || null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => { document.title = 'nexa cart'; }, []);

  return (
    <div className="App">
      <Router>
        <div>
          <ToastContainer theme='dark' position='top-center' />
          <Routes>
            {/* ── Admin routes (no main auth required) ── */}
            <Route path="/admin/login"       element={<AdminLogin />} />
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/add-product" element={<AddProduct />} />

            {/* ── Customer routes ── */}
            <Route
              path="*"
              element={
                !isAuthenticated ? (
                  <AuthPage
                    mode={authMode}
                    onModeChange={setAuthMode}
                    onAuthSuccess={handleAuthSuccess}
                  />
                ) : (
                  <>
                    <Header cartItems={cartItems} user={user} onLogout={handleLogout} />
                    <Routes>
                      <Route path="/"           element={<Home />} />
                      <Route path="/search"     element={<Home />} />
                      <Route path="/orders"     element={<Orders />} />
                      <Route path="/biller"     element={<Biller />} />
                      <Route path="/product/:id" element={<ProductDetail cartItems={cartItems} setCartItems={setCartItems} />} />
                      <Route path="/cart"       element={<Cart cartItems={cartItems} setCartItems={setCartItems} />} />
                      <Route path="*"           element={<Navigate to="/" replace />} />
                    </Routes>
                  </>
                )
              }
            />
          </Routes>
        </div>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
