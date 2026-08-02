import { Link } from 'react-router-dom';
import { Star, Heart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useState } from 'react';

import { IMAGE_BASE_URL as IMAGE_BASE } from '../config';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80';

export default function FoodCard({ food }) {
  const { addToCart }      = useCart();
  const { isAuthenticated } = useAuth();
  const toast              = useToast();
  const [fav,     setFav]     = useState(false);
  const [adding,  setAdding]  = useState(false);

  const imageUrl = food.image
    ? (food.image.startsWith('http') ? food.image : IMAGE_BASE + food.image)
    : FALLBACK;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart.');
      return;
    }
    setAdding(true);
    const ok = await addToCart(food.id);
    toast[ok ? 'success' : 'error'](ok ? `${food.name} added to cart!` : 'Failed to add item.');
    setAdding(false);
  };

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFav(!fav);
    toast.info(fav ? 'Removed from favourites' : 'Added to favourites ❤️');
  };

  return (
    <Link to={`/food/${food.id}`} className="food-card" id={`food-card-${food.id}`}>
      <div className="food-card-image-wrapper">
        <img
          src={imageUrl}
          alt={food.name}
          className="food-card-image"
          onError={(e) => { e.target.src = FALLBACK; }}
        />
        {food.is_featured == 1 && (
          <span className="food-card-badge">⭐ Featured</span>
        )}
        <button className={`food-card-fav ${fav ? 'active' : ''}`} onClick={handleFav} title="Favourite" id={`fav-btn-${food.id}`}>
          <Heart size={15} fill={fav ? 'currentColor' : 'none'} color={fav ? '#DC2626' : '#6B7280'} />
        </button>
      </div>

      <div className="food-card-body">
        <div className="food-card-category">{food.category_name}</div>
        <h3 className="food-card-name">{food.name}</h3>
        <p className="food-card-desc">{food.description}</p>
        <div className="food-card-rating">
          <Star size={14} fill="currentColor" />
          <span>{Number(food.rating).toFixed(1)}</span>
          <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>(120+)</span>
        </div>
        <div className="food-card-footer">
          <span className="food-card-price">Rs. {Number(food.price).toFixed(2)}</span>
          <button
            className="food-card-add"
            onClick={handleAdd}
            disabled={adding}
            title="Add to cart"
            id={`add-to-cart-${food.id}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
