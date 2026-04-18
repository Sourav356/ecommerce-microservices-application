import { useState, useEffect } from 'react';
import axios from 'axios';
import "./index.css";
import AdminPanel from './AdminPanel';

// In production Docker, this might be a relative path or a specific domain
const API = '/api';

function App() {
  // Global State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('eco-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [viewMode, setViewMode] = useState('store'); // 'store' or 'admin'
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' or 'address'
  const [address, setAddress] = useState({ name: '', street: '', city: '' });

  // Fetch products and inventory on load
  const loadCatalog = async () => {
    setLoading(true);
    try {
      const prodRes = await axios.get(`${API}/products`);
      setProducts(prodRes.data);
      
      const invRes = await axios.get(`${API}/inventory`);
      setInventory(invRes.data);
      
      setError(null);
    } catch (err) {
      setError("Failed to reach APIs. Are all services running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API}/cart`, {
        headers: { 'X-User-Id': user.username }
      });
      setCart(res.data || []);
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      if (authMode === 'register') {
        await axios.post(`${API}/users/register`, { username, password, email: `${username}@ecommerce.com` });
        setSuccessMsg("Registration successful! Please login.");
        setAuthMode('login');
      } else {
        const res = await axios.post(`${API}/users/login`, { username, password });
        setUser(res.data); // contains token and username
        localStorage.setItem('eco-user', JSON.stringify(res.data));
        setShowAuthModal(false);
        setSuccessMsg(`Welcome back, ${res.data.username}!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    try {
      await axios.post(`${API}/cart`, { product_id: productId, quantity: 1 }, {
        headers: { 'X-User-Id': user.username }
      });
      setSuccessMsg("Item added to cart!");
      fetchCart();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setError("Failed to add to cart");
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/orders/checkout`, { username: user.username });
      setSuccessMsg(`🚀 ${res.data.message} (Order #${res.data.order_id}, Total: $${res.data.total_amount.toFixed(2)}) will be shipped to ${address.city}!`);
      setCart([]);
      setCheckoutStep('cart');
      setIsCartOpen(false);
      setAddress({ name: '', street: '', city: '' });
      loadCatalog(); // Refresh global inventory stock!
    } catch (err) {
      setError("Checkout failed! Check the Order Service console logs for details.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get cart details
  const cartDetails = cart.map(item => {
    const p = products.find(prod => prod.id === item.product_id);
    return { ...item, ...p };
  }).filter(item => item.title);

  const cartTotal = cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const isAdmin = user && user.username === 'admin';

  return (
    <div style={{ padding: '40px', width: '100vw', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h1 className="title" style={{ fontSize: '2.5rem', margin: 0, cursor: 'pointer' }} onClick={() => setViewMode('store')}>NexCommerce</h1>
            <p style={{ color: '#cbd5e1', marginTop: '10px' }}>Global Microservices Demo</p>
          </div>
          {isAdmin && (
            <button className="btn" onClick={() => setViewMode(viewMode === 'store' ? 'admin' : 'store')} style={{ background: viewMode === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', fontSize: '0.8rem', padding: '6px 12px' }}>
              {viewMode === 'store' ? 'Go to Admin Dashboard' : 'Back to Storefront'}
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#cbd5e1' }}>Hi, <b style={{ color: 'var(--accent)'}}>{user.username}</b></span>
              <button className="btn" onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.1)' }}>
                🛒 Cart ({cart.length})
              </button>
              <button className="btn" onClick={() => {
                setUser(null);
                localStorage.removeItem('eco-user');
                setViewMode('store');
              }} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.1)' }}>
                Login
              </button>
              <button className="btn" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} style={{ padding: '8px 20px', background: 'var(--accent)', color: 'black' }}>
                Register
              </button>
            </>
          )}
        </div>
      </div>

      {successMsg && <div style={{ background: 'rgba(74, 222, 128, 0.2)', padding: '15px', borderRadius: '8px', color: '#86efac', marginBottom: '30px' }}>{successMsg}</div>}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '15px', borderRadius: '8px', color: '#fca5a5', marginBottom: '30px' }}>{error}</div>}

      {/* Main Content Area */}
      {viewMode === 'admin' && isAdmin ? (
        <AdminPanel API={API} />
      ) : (
        /* Product Grid - Always Visible */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px' }}>
          {loading ? (
            <p style={{ color: '#cbd5e1' }}>Loading catalog securely...</p>
          ) : products.map(p => {
             const stockObj = inventory.find(i => parseInt(i.product_id) === p.id);
             const stockCount = stockObj ? stockObj.quantity : 0;
             const isOutOfStock = stockCount <= 0;

             return (
              <div key={p.id} className="glass-card" style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />}
                
                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h2 style={{ marginTop: 0, color: 'white', marginBottom: '5px' }}>{p.title}</h2>
                    <span style={{ background: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>{p.category}</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', flex: 1 }}>{p.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ color: 'var(--accent)', fontSize: '2rem', margin: '15px 0' }}>${p.price.toFixed(2)}</h3>
                        <span style={{ color: isOutOfStock ? '#fca5a5' : '#86efac', fontWeight: 'bold' }}>
                            {isOutOfStock ? 'Sold Out' : `${stockCount} In Stock`}
                        </span>
                    </div>

                    <button className="btn" disabled={isOutOfStock} onClick={() => addToCart(p.id)} style={{ marginTop: 'auto', background: isOutOfStock ? '#475569' : 'var(--accent)', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}>
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, backdropFilter: 'blur(5px)' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <h2 className="title" style={{ textAlign: 'center', marginBottom: '30px' }}>
              {authMode === 'login' ? 'Account Login' : 'Create Account'}
            </h2>
            
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
              <button type="submit" className="btn" style={{ background: 'var(--accent)', color: 'black' }}>
                {authMode === 'login' ? 'Secure Login' : 'Register Account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Don't have an account? Register here" : "Already have an account? Login here"}
            </p>
          </div>
        </div>
      )}

      {/* Cart & Checkout Sidebar Modal */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', background: 'rgba(15, 23, 42, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '40px', display: 'flex', flexDirection: 'column', zIndex: 100, backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: 'white', margin: 0 }}>
              {checkoutStep === 'cart' ? 'Your Cart' : 'Delivery Details'}
            </h2>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>
          
          {checkoutStep === 'cart' ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cartDetails.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>Your cart is empty.</p>
                ) : (
                  cartDetails.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: 'white' }}>{item.title}</h4>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Qty: {item.quantity}</span>
                      </div>
                      <h4 style={{ margin: 0, color: 'var(--accent)' }}>${(item.price * item.quantity).toFixed(2)}</h4>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'white' }}>Total</h3>
                  <h3 style={{ margin: 0, color: 'var(--accent)' }}>${cartTotal.toFixed(2)}</h3>
                </div>
                <button className="btn" onClick={() => setCheckoutStep('address')} disabled={cart.length === 0} style={{ width: '100%', background: cart.length === 0 ? 'gray' : 'var(--accent)', color: 'black' }}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="text" placeholder="Full Name" required value={address.name} onChange={e => setAddress({...address, name: e.target.value})}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
                <input type="text" placeholder="Street Address" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
                <input type="text" placeholder="City" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
                <button type="button" className="btn" onClick={() => setCheckoutStep('cart')} style={{ flex: 1, background: 'transparent', border: '1px solid #94a3b8', color: 'white' }}>
                  Back
                </button>
                <button type="submit" className="btn" style={{ flex: 2, background: 'var(--accent)', color: 'black' }}>
                  Confirm Order (${cartTotal.toFixed(2)})
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </div>
  );
}

export default App;
