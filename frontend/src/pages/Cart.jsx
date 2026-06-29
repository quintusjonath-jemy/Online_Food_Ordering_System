import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const { items, total, count, loading, clearCart } = useCart();

  if (loading) return <div className="page-wrapper"><LoadingSpinner /></div>;

  const delivery = 2.99;
  const tax      = total * 0.08;
  const grandTotal = total + delivery + tax;

  return (
    <div className="page-wrapper">
      <div className="container section-sm">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>
              <ShoppingBag size={28} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--clr-primary)' }} />
              My Cart
            </h1>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {count} item{count !== 1 ? 's' : ''}
            </p>
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--clr-error)' }}>
              <Trash2 size={15} /> Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious dishes to get started.</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Browse Menu <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {items.map((item) => <CartItem key={item.id} item={item} />)}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({count} items)</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>${delivery.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'var(--sp-5)', justifyContent: 'center' }}
                id="proceed-checkout-btn"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link
                to="/menu"
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: 'var(--sp-3)', justifyContent: 'center', fontSize: '0.875rem' }}
              >
                ← Continue Shopping
              </Link>

              {/* Badges */}
              <div style={{ marginTop: 'var(--sp-5)', padding: 'var(--sp-4)', background: 'var(--clr-bg)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['🔒 Secure checkout', '🚀 30-min delivery', '💵 Cash on delivery'].map((t) => (
                  <div key={t} style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
