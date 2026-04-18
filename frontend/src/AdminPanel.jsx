import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = ({ API }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    initialStock: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setError('');
    
    try {
      // 1. Create Product
      const productPayload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url
      };
      
      const productRes = await axios.post(`${API}/products`, productPayload);
      const newProductId = productRes.data.id;

      // 2. Add Stock to Inventory
      if (formData.initialStock && parseInt(formData.initialStock) > 0) {
         await axios.post(`${API}/inventory/stock`, {
             product_id: newProductId,
             quantity: parseInt(formData.initialStock)
         });
      }

      setMsg(`Success! Product created with ID: ${newProductId}`);
      setFormData({ title: '', description: '', price: '', category: '', image_url: '', initialStock: '' });
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
      <h2 className="title" style={{ marginTop: 0, marginBottom: '20px' }}>Admin Dashboard</h2>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Add new products to the catalog and inventory database.</p>
      
      {msg && <div style={{ background: 'rgba(74, 222, 128, 0.2)', padding: '15px', borderRadius: '8px', color: '#86efac', marginBottom: '20px' }}>{msg}</div>}
      {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '15px', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="title" placeholder="Product Title" required value={formData.title} onChange={handleChange}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
          
        <textarea name="description" placeholder="Product Description" required value={formData.description} onChange={handleChange} rows={3}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
          
        <div style={{ display: 'flex', gap: '15px' }}>
            <input type="number" step="0.01" name="price" placeholder="Price ($)" required value={formData.price} onChange={handleChange}
            style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
            
            <input type="text" name="category" placeholder="Category" required value={formData.category} onChange={handleChange}
            style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
        </div>

        <input type="url" name="image_url" placeholder="Image URL (e.g. AWS S3 link)" value={formData.image_url} onChange={handleChange}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />
          
        <input type="number" name="initialStock" placeholder="Initial Stock Quantity" required value={formData.initialStock} onChange={handleChange}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white' }} />

        <button type="submit" className="btn" disabled={loading} style={{ background: 'var(--accent)', color: 'black', marginTop: '10px' }}>
          {loading ? 'Processing...' : 'Publish Product & Add Stock'}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
