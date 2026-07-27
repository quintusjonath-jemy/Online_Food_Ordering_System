import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Heart, CheckCircle } from 'lucide-react';
import { foodsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const IMAGE_BASE = 'http://localhost/uploads/';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80';

export default function FoodDetails() {
  const { id }              = useParams();
  const { addToCart }       = useCart();
  const { isAuthenticated } = useAuth();
  const toast               = useToast();

  const [food,     setFood]     = useState(null);
  const [qty,      setQty]      = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [fav,      setFav]      = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    foodsAPI.getById(id)
      .then((r) => setFood(r.data.food))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddonToggle = (group, item, isRadio) => {
    setSelectedAddons(prev => {
      if (isRadio) {
        const filtered = prev.filter(x => x.group_id !== group.id);
        return [...filtered, { id: item.id, name: item.name, price: Number(item.price), group_id: group.id }];
      } else {
        const exists = prev.some(x => x.id === item.id);
        if (exists) {
          return prev.filter(x => x.id !== item.id);
        } else {
          return [...prev, { id: item.id, name: item.name, price: Number(item.price), group_id: group.id }];
        }
      }
    });
  };

  const handleAdd = async () => {
    if (!isAuthenticated) { toast.info('Please login first.'); return; }
    
    // Validate required groups
    const requiredGroups = food?.addons?.filter(g => g.is_required == 1) ?? [];
    for (const group of requiredGroups) {
      const selectedForGroup = selectedAddons.some(x => x.group_id === group.id);
      if (!selectedForGroup) {
        toast.error(`Please make a selection for: ${group.name}`);
        return;
      }
    }

    setAdding(true);
    const ok = await addToCart(food.id, qty, selectedAddons);
    toast[ok ? 'success' : 'error'](ok ? `${qty}× ${food.name} added to cart!` : 'Failed to add item.');
    setAdding(false);
  };

  if (loading) return <div className="page-wrapper"><LoadingSpinner /></div>;
  if (!food) return (
    <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <h2>Dish not found</h2>
      <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Menu</Link>
    </div>
  );

  const imgSrc = food.image
    ? (food.image.startsWith('http') ? food.image : IMAGE_BASE + food.image)
    : FALLBACK;

  return (
    <div className="page-wrapper">
      <div className="container section-sm">
        <Link to="/menu" className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Menu
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Image */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '4/3', boxShadow: 'var(--shadow-xl)' }}>
            <img src={imgSrc} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = FALLBACK; }} />
            {food.is_featured == 1 && (
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--clr-gold)', color: '#222', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                ⭐ Chef's Pick
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              {food.category_name}
            </div>
            <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>{food.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '2px', color: 'var(--clr-gold)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(food.rating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span style={{ fontWeight: 600 }}>{Number(food.rating).toFixed(1)}</span>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>(120+ reviews)</span>
            </div>

            <p style={{ color: 'var(--clr-text-muted)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>{food.description}</p>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={16} color="var(--clr-success)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--clr-success)', fontWeight: 600 }}>
                {food.stock > 0 ? `In Stock (${food.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Addons Selection */}
            {food.addons && food.addons.length > 0 && (
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.4rem' }}>
                  Customize Your Meal
                </h3>
                {food.addons.map((group) => {
                  const isRadio = group.max_selection === 1;
                  return (
                    <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{group.name}</span>
                        {group.is_required == 1 && (
                          <span style={{ background: 'var(--clr-primary)', color: 'white', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>REQUIRED</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {group.items.map((item) => {
                          const isSelected = selectedAddons.some(x => x.id === item.id);
                          return (
                            <label
                              key={item.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: 'var(--clr-text)',
                                cursor: 'pointer',
                                padding: '0.4rem 0.6rem',
                                background: isSelected ? 'rgba(139,0,0,0.03)' : 'transparent',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid',
                                borderColor: isSelected ? 'var(--clr-primary)' : 'transparent',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type={isRadio ? 'radio' : 'checkbox'}
                                name={`addon-group-${group.id}`}
                                checked={isSelected}
                                onChange={() => handleAddonToggle(group, item, isRadio)}
                                style={{ accentColor: 'var(--clr-primary)', cursor: 'pointer' }}
                              />
                              <span style={{ flex: 1 }}>{item.name}</span>
                              {Number(item.price) > 0 && (
                                <span style={{ fontWeight: 600, color: 'var(--clr-primary)' }}>+${Number(item.price).toFixed(2)}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price */}
            <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 900, color: 'var(--clr-primary)', marginBottom: '2rem' }}>
              ${(Number(food.price) + selectedAddons.reduce((sum, x) => sum + x.price, 0)).toFixed(2)}
            </div>

            {/* Quantity + Add */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--clr-bg)', borderRadius: '999px', padding: '0.5rem 1rem', border: '1.5px solid var(--clr-border)' }}>
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: '1rem' }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAdd}
                disabled={adding || food.stock === 0}
                id="add-to-cart-btn"
                style={{ flex: 1 }}
              >
                <ShoppingCart size={18} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setFav(!fav)}
                style={{ width: 50, height: 50, borderRadius: '50%', border: '1.5px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: fav ? 'var(--clr-error)' : 'var(--clr-text-muted)', transition: 'all 0.2s' }}
              >
                <Heart size={20} fill={fav ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              {['Fresh Ingredients', 'Chef Special', 'Premium Quality'].map((tag) => (
                <span key={tag} style={{ padding: '0.3rem 0.75rem', background: 'rgba(139,0,0,0.07)', color: 'var(--clr-primary)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
