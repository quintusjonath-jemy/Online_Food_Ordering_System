import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

/**
 * React Context for Shopping Cart Management
 * Provides global state management for cart items, count totals, addon selections, and backend API sync.
 */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch user cart from REST API server
   * Syncs database cart items, item counts, and subtotal metrics for authenticated customer sessions.
   */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); setTotal(0); setCount(0); return; }
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      if (data.success) {
        setItems(data.items  ?? []);
        setTotal(data.total  ?? 0);
        setCount(data.count  ?? 0);
      }
    } catch { /* silent fallback */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // Reload cart whenever authentication state changes
  useEffect(() => { fetchCart(); }, [fetchCart]);

  /**
   * Add food item to cart with selected customizations (toppings/drinks)
   * Sends request to backend API and updates local cart context on success.
   */
  const addToCart = async (foodId, quantity = 1, selectedAddons = null) => {
    if (!isAuthenticated) return false;
    try {
      const { data } = await cartAPI.addItem({ food_id: foodId, quantity, selected_addons: selectedAddons });
      if (data.success) await fetchCart();
      return data.success;
    } catch { return false; }
  };

  /** Update quantity */
  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { data } = await cartAPI.updateQuantity(cartItemId, quantity);
      if (data.success) await fetchCart();
      return data.success;
    } catch { return false; }
  };

  /** Remove single item */
  const removeItem = async (cartItemId) => {
    try {
      const { data } = await cartAPI.removeItem(cartItemId);
      if (data.success) await fetchCart();
      return data.success;
    } catch { return false; }
  };

  /** Clear entire cart */
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setItems([]); setTotal(0); setCount(0);
    } catch { /* silent */ }
  };

  return (
    <CartContext.Provider value={{ items, total, count, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
