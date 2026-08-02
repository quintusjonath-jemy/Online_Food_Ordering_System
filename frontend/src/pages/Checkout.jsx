import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, FileText, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { ordersAPI, couponsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const IMAGE_BASE = 'http://localhost/uploads/';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=60';

export default function Checkout() {
  const { items, total, count, clearCart } = useCart();
  const { user, updateUser }  = useAuth();
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

  // Enterprise additions
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });

  const delivery = 2.99;
  
  // Coupon Discount
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  
  // Points Discount ($1 per 10 points)
  const userPoints = user?.loyalty_points || 0;
  const maxPointsDiscount = userPoints / 10.0;
  const pointsDiscount = redeemPoints ? Math.min(maxPointsDiscount, total - couponDiscount) : 0;
  const pointsDeducted = redeemPoints ? Math.round(pointsDiscount * 10) : 0;

  const totalDiscount = couponDiscount + pointsDiscount;
  const discountedSubtotal = Math.max(0.00, total - totalDiscount);
  const tax = discountedSubtotal * 0.08;
  const grandTotal = discountedSubtotal + delivery + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const { data } = await couponsAPI.validate(couponCode, total);
      if (data.success) {
        setAppliedCoupon(data.coupon);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon code removed.');
  };

  const validate = () => {
    const e = {};
    if (!form.address.trim()) e.address = 'Delivery address is required.';
    if (!form.phone.trim())   e.phone   = 'Phone number is required.';
    
    if (paymentMethod === 'stripe') {
      if (!card.number.replace(/\s+/g, '').match(/^\d{16}$/)) e.cardNumber = 'Valid 16-digit card number is required.';
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.cardExpiry = 'Expiration date (MM/YY) is required.';
      if (!card.cvc.match(/^\d{3}$/)) e.cardCvc = 'CVV (3 digits) is required.';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCard((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (count === 0) { toast.error('Your cart is empty!'); return; }
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        discount_applied: totalDiscount,
        redeem_points: redeemPoints,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'stripe' ? 'paid' : 'unpaid',
        transaction_reference: paymentMethod === 'stripe' ? 'ch_' + Math.random().toString(36).substr(2, 9) : null
      };

      const { data } = await ordersAPI.checkout(payload);
      if (data.success) {
        setSuccess(true);
        setOrderId(data.order_id);
        
        // Update user context loyalty points locally
        const updatedPoints = userPoints + Math.round(discountedSubtotal / 10) - pointsDeducted;
        updateUser({ ...user, loyalty_points: updatedPoints });

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
          <Link to="/orders" className="btn btn-outline">View Orders</Link>
          <Link to="/menu"   className="btn btn-primary">Order More</Link>
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

             {/* Payment Method */}
             <div className="card" style={{ padding: '2rem' }}>
               <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <CreditCard size={20} color="var(--clr-primary)" /> Payment Method
               </h2>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {/* COD Option */}
                 <label 
                   style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '1rem', 
                     padding: '1rem', 
                     border: paymentMethod === 'cod' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', 
                     borderRadius: 'var(--radius-lg)', 
                     background: paymentMethod === 'cod' ? 'rgba(139,0,0,0.04)' : 'transparent',
                     cursor: 'pointer'
                   }}
                 >
                   <input 
                     type="radio" 
                     name="paymentMethod" 
                     value="cod" 
                     checked={paymentMethod === 'cod'} 
                     onChange={() => setPaymentMethod('cod')} 
                     style={{ accentColor: 'var(--clr-primary)' }}
                   />
                   <div>
                     <div style={{ fontWeight: 700 }}>💵 Cash on Delivery</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Pay with cash when your food arrives.</div>
                   </div>
                 </label>

                 {/* Card Option (Stripe Simulator) */}
                 <label 
                   style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '1rem', 
                     padding: '1rem', 
                     border: paymentMethod === 'stripe' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', 
                     borderRadius: 'var(--radius-lg)', 
                     background: paymentMethod === 'stripe' ? 'rgba(139,0,0,0.04)' : 'transparent',
                     cursor: 'pointer'
                   }}
                 >
                   <input 
                     type="radio" 
                     name="paymentMethod" 
                     value="stripe" 
                     checked={paymentMethod === 'stripe'} 
                     onChange={() => setPaymentMethod('stripe')} 
                     style={{ accentColor: 'var(--clr-primary)' }}
                   />
                   <div>
                     <div style={{ fontWeight: 700 }}>💳 Credit Card (Stripe Checkout)</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Secure payment using Stripe card elements.</div>
                   </div>
                 </label>

                 {/* Stripe Card Input Simulator Fields */}
                 {paymentMethod === 'stripe' && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', padding: '1rem', background: 'var(--clr-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }} className="fade-in">
                     <div className="form-group">
                       <label className="form-label" style={{ fontSize: '0.8rem' }}>Card Number</label>
                       <input 
                         type="text" 
                         name="number" 
                         className={`form-input ${errors.cardNumber ? 'error' : ''}`}
                         placeholder="4111 2222 3333 4444" 
                         value={card.number} 
                         onChange={handleCardChange}
                         id="stripe-card-number"
                       />
                       {errors.cardNumber && <span className="form-error" style={{ fontSize: '0.75rem' }}>{errors.cardNumber}</span>}
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div className="form-group">
                         <label className="form-label" style={{ fontSize: '0.8rem' }}>Expiration Date</label>
                         <input 
                           type="text" 
                           name="expiry" 
                           className={`form-input ${errors.cardExpiry ? 'error' : ''}`}
                           placeholder="MM/YY" 
                           value={card.expiry} 
                           onChange={handleCardChange}
                           id="stripe-card-expiry"
                         />
                         {errors.cardExpiry && <span className="form-error" style={{ fontSize: '0.75rem' }}>{errors.cardExpiry}</span>}
                       </div>
                       <div className="form-group">
                         <label className="form-label" style={{ fontSize: '0.8rem' }}>CVC / CVV</label>
                         <input 
                           type="password" 
                           name="cvc" 
                           className={`form-input ${errors.cardCvc ? 'error' : ''}`}
                           placeholder="123" 
                           value={card.cvc} 
                           onChange={handleCardChange}
                           id="stripe-card-cvc"
                         />
                         {errors.cardCvc && <span className="form-error" style={{ fontSize: '0.75rem' }}>{errors.cardCvc}</span>}
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             <button
               type="submit"
               className="btn btn-primary btn-lg"
               disabled={submitting}
               id="place-order-btn"
               style={{ width: '100%', justifyContent: 'center' }}
             >
               {submitting ? '⏳ Processing payment...' : '🎉 Confirm & Place Order'}
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
                       {item.selected_addons && item.selected_addons.length > 0 && (
                         <div style={{ fontSize: '0.7rem', color: 'var(--clr-primary)' }}>
                           + {item.selected_addons.map(x => x.name).join(', ')}
                         </div>
                       )}
                       <div style={{ color: 'var(--clr-text-muted)' }}>×{item.quantity}</div>
                     </div>
                     <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Rs. {Number(item.subtotal).toFixed(2)}</div>
                   </div>
                 );
               })}
             </div>

             {/* Coupons entry */}
             <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--clr-border)' }}>
               <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Apply Coupon Code</label>
               {appliedCoupon ? (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '0.4rem 0.75rem', background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--clr-success)' }}>
                   <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-success)' }}>
                     🎟️ {appliedCoupon.code} Applied
                   </span>
                   <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--clr-error)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                     Remove
                   </button>
                 </div>
               ) : (
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <input 
                     type="text" 
                     className="form-input" 
                     style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', textTransform: 'uppercase' }} 
                     placeholder="e.g. SUMMER20" 
                     value={couponCode} 
                     onChange={(e) => setCouponCode(e.target.value)} 
                     id="coupon-input"
                   />
                   <button 
                     type="button" 
                     onClick={handleApplyCoupon} 
                     disabled={checkingCoupon || !couponCode.trim()} 
                     className="btn btn-outline" 
                     style={{ padding: '0 1rem', fontSize: '0.8rem', minWidth: 'auto' }}
                     id="apply-coupon-btn"
                   >
                     {checkingCoupon ? '...' : 'Apply'}
                   </button>
                 </div>
               )}
             </div>

             {/* Loyalty Points Redemption */}
             {userPoints > 0 && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--clr-border)' }}>
                 <input 
                   type="checkbox" 
                   id="redeem-points-cb" 
                   checked={redeemPoints} 
                   onChange={(e) => setRedeemPoints(e.target.checked)} 
                   style={{ accentColor: 'var(--clr-primary)', cursor: 'pointer', width: 16, height: 16 }}
                 />
                 <label htmlFor="redeem-points-cb" style={{ fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>
                   Redeem <strong>{userPoints} Loyalty Points</strong> (Save Rs. {Math.min(maxPointsDiscount, total - couponDiscount).toFixed(2)})
                 </label>
               </div>
             )}

             <div className="summary-row"><span>Subtotal</span><span>Rs. {Number(total).toFixed(2)}</span></div>
             {couponDiscount > 0 && (
               <div className="summary-row" style={{ color: 'var(--clr-success)', fontWeight: 600 }}>
                 <span>Coupon Discount</span>
                 <span>-Rs. {couponDiscount.toFixed(2)}</span>
               </div>
             )}
             {pointsDiscount > 0 && (
               <div className="summary-row" style={{ color: 'var(--clr-success)', fontWeight: 600 }}>
                 <span>Loyalty Discount</span>
                 <span>-Rs. {pointsDiscount.toFixed(2)}</span>
               </div>
             )}
             <div className="summary-row"><span>Delivery</span><span>Rs. {delivery.toFixed(2)}</span></div>
             <div className="summary-row"><span>Tax (8%)</span><span>Rs. {tax.toFixed(2)}</span></div>
             <div className="summary-row summary-total"><span>Grand Total</span><span>Rs. {grandTotal.toFixed(2)}</span></div>
           </div>
         </div>
       </div>
     </div>
  );
}
