import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Tag, ShoppingBag,
  Users, BarChart2, LogOut, X, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/foods',      icon: UtensilsCrossed, label: 'Foods' },
  { to: '/admin/categories', icon: Tag,             label: 'Categories' },
  { to: '/admin/orders',     icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/reservations', icon: Calendar,        label: 'Reservations' },
  { to: '/admin/users',      icon: Users,           label: 'Customers' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar-logo-text">
            Saveur<span>Eats</span>
          </div>
          {mobileOpen && (
            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Admin profile mini */}
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'var(--clr-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: '#222', marginBottom: '0.5rem',
          }}>
            {user?.name?.charAt(0)}
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Administrator</div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
              id={`sidebar-${label.toLowerCase()}`}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Account</div>
          <button
            className="sidebar-item"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            id="sidebar-logout"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
