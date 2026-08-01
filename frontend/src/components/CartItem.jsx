import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

import { IMAGE_BASE_URL as IMAGE_BASE } from '../config';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=150&q=60';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const toast = useToast();

  const handleQty = async (newQty) => {
    if (newQty < 1) return handleRemove();
    await updateQuantity(item.id, newQty);
  };

  const handleRemove = async () => {
    await removeItem(item.id);
    toast.info(`${item.name} removed from cart.`);
  };

  const imgSrc = item.image
    ? (item.image.startsWith('http') ? item.image : IMAGE_BASE + item.image)
    : FALLBACK;

  return (
    <div className="cart-item fade-in" id={`cart-item-${item.id}`}>
      <img
        src={imgSrc}
        alt={item.name}
        className="cart-item-image"
        onError={(e) => { e.target.src = FALLBACK; }}
      />
      <div className="cart-item-details">
        <div className="cart-item-name">{item.name}</div>
        {item.selected_addons && item.selected_addons.length > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--clr-primary)', fontWeight: 600, margin: '2px 0 6px 0' }}>
            + {item.selected_addons.map(x => x.name).join(', ')}
          </div>
        )}
        <div className="cart-item-price">${Number(item.price).toFixed(2)} each</div>
        <div className="qty-controls">
          <button className="qty-btn" onClick={() => handleQty(item.quantity - 1)} id={`qty-minus-${item.id}`}>
            <Minus size={12} />
          </button>
          <span className="qty-value">{item.quantity}</span>
          <button className="qty-btn" onClick={() => handleQty(item.quantity + 1)} id={`qty-plus-${item.id}`}>
            <Plus size={12} />
          </button>
          <button
            onClick={handleRemove}
            title="Remove"
            style={{ marginLeft: '0.5rem', color: 'var(--clr-error)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
            id={`remove-item-${item.id}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="cart-item-subtotal">
        ${Number(item.subtotal).toFixed(2)}
      </div>
    </div>
  );
}
