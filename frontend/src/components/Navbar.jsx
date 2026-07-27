import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, UtensilsCrossed, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const navigate  = useNavigate();

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <UtensilsCrossed size={26} />
          Saveur<span>Eats</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/menu">Menu</NavLink></li>
          <li><NavLink to="/book-table">Book Table</NavLink></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="navbar-icon-btn" title="Cart" id="navbar-cart-btn">
            <ShoppingCart size={18} />
            {count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}
          </Link>

          {/* Profile / Auth */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="navbar-icon-btn"
                id="navbar-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                title="Profile"
              >
                <User size={18} />
              </button>
              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '48px',
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-xl)',
                  minWidth: '200px', overflow: 'hidden', zIndex: 200,
                  animation: 'slideUp 0.2s ease',
                }}>
                  {/* User info */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-bg)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-text)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
                          color: 'var(--clr-primary)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background='var(--clr-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
                        color: 'var(--clr-text)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background='var(--clr-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
                        color: 'var(--clr-text)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background='var(--clr-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
                    >
                      <ShoppingCart size={16} /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem',
                        width: '100%', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
                        color: 'var(--clr-error)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background='#FEE2E2'}
                      onMouseLeave={(e) => e.currentTarget.style.background='transparent'}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="navbar-login-btn">
              Login
            </Link>
          )}

          {/* Mobile toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} id="navbar-mobile-toggle">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '70px', left: 0, right: 0,
          background: 'white', borderTop: '1px solid var(--clr-border)',
          padding: '1rem', boxShadow: 'var(--shadow-lg)', zIndex: 999,
          animation: 'slideUp 0.2s ease',
        }}>
          {[['/', 'Home'], ['/menu', 'Menu'], ['/book-table', 'Book Table'], ['/cart', 'Cart'], ['/orders', 'My Orders'], ['/profile', 'Profile']].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem', fontWeight: 500, color: 'var(--clr-text)' }}
            >
              {label}
            </NavLink>
          ))}
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => setMobileOpen(false)}>
              Login / Register
            </Link>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
