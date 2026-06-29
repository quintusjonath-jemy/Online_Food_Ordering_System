import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, FileText, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const IMAGE_BASE = 'http://localhost/uploads/';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=60';

export default function Checkout() {
  const { items, total, count, clearCart } = useCart();
  const { user }  = useAuth();
  const toast     = useToast();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    address: user?.address || '',
    phone:   user?.phone   || '',
    notes:   '',
  });
  const [errors,    setErrors]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [orderId,   setOrderId]   = useState(null);

  const delivery   = 2.99;
  const tax        = total * 0.08;
  const grandTotal = total + delivery + tax;

  const validate = () => {
    const e = {};
    if (!form.address.trim()) e.address = 'Delivery address is required.';
    if (!form.phone.trim())   e.phone   = 'Phone number is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (count === 0) { toast.error('Your cart is empty!'); return; }
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const { data } = await ordersAPI.checkout(form);
      if (data.success) {
        setSuccess(true);
        setOrderId(data.order_id);
        await clearCart();
        toast.success('Order placed successfully! 🎉');
      } else {
        toast.error(data.message || 'Failed to place order.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (success) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={44} color="var(--clr-success)" />
        </div>
        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Order Placed! 🎉</h1>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '0.5rem' }}>
          Thank you for your order! Your food is being prepared.
        </p>
        <p style={{ fontWeight: 700, color: 'var(--clr-primary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Order #{orderId}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary">Track Order</Link>
          <Link to="/menu"   className="btn btn-outline">Order More</Link>
        </div>
      </div>
    </div>
  );

  if (count === 0) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Menu</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container section-sm">
        <Link to="/cart" className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, marginBottom: '2rem' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Delivery Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} color="var(--clr-primary)" /> Delivery Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Delivery Address *</label>
                  <textarea
                    name="address"
                    className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
                    placeholder="Enter your full delivery address..."
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    id="checkout-address"
                  />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    id="checkout-phone"
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label"><FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />Special Instructions (optional)</label>
                  <textarea
                    name="notes"
                    className="form-input form-textarea"
                    placeholder="e.g. Ring the doorbell, extra napkins..."
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    id="checkout-notes"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--clr-primary)" /> Payment Method
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px solid var(--clr-primary)', borderRadius: 'var(--radius-lg)', background: 'rgba(139,0,0,0.04)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={14} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>💵 Cash on Delivery</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Pay when your order arrives</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              id="place-order-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? '⏳ Placing Order...' : '🎉 Place Order'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--clr-border)' }}>
              {items.map((item) => {
                const img = item.image ? (item.image.startsWith('http') ? item.image : IMAGE_BASE + item.image) : FALLBACK;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img src={img} alt={item.name} style={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.target.src = FALLBACK; }} />
                    <div style={{ flex: 1, fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: 'var(--clr-text-muted)' }}>×{item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>${Number(item.subtotal).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
            <div className="summary-row"><span>Subtotal</span><span>${Number(total).toFixed(2)}</span></div>
            <div className="summary-row"><span>Delivery</span><span>${delivery.toFixed(2)}</span></div>
            <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row summary-total"><span>Grand Total</span><span>${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
