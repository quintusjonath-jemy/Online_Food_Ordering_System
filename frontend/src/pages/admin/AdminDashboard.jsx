import { useState, useEffect } from 'react';
import { UtensilsCrossed, Users, ShoppingBag, DollarSign, TrendingUp, Clock, Menu } from 'lucide-react';
import { statsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_LABELS = {
  pending: 'Pending', preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

const DASH_CARDS = (stats) => [
  { label: 'Total Foods',     value: stats.total_foods,     icon: <UtensilsCrossed size={24} />, color: '#FEF3C7', iconColor: '#92400E' },
  { label: 'Total Customers', value: stats.total_customers, icon: <Users size={24} />,           color: '#DBEAFE', iconColor: '#1E40AF' },
  { label: 'Orders Today',    value: stats.orders_today,    icon: <ShoppingBag size={24} />,     color: '#DCFCE7', iconColor: '#166534' },
  { label: 'Total Revenue',   value: `$${Number(stats.total_revenue ?? 0).toFixed(2)}`, icon: <DollarSign size={24} />, color: '#FEE2E2', iconColor: '#991B1B' },
];

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    statsAPI.getDashboard()
      .then((r) => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-content">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }} className="mobile-menu-trigger">
            <Menu size={22} />
          </button>
          <div>
            <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>Dashboard</h1>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>Welcome back, Administrator! Here's what's happening.</p>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : !stats ? <p>Failed to load stats.</p> : (
          <>
            {/* Stats Cards */}
            <div className="dashboard-cards">
              {DASH_CARDS(stats).map(({ label, value, icon, color, iconColor }) => (
                <div key={label} className="dash-card" id={`dash-${label.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className="dash-card-icon" style={{ background: color, color: iconColor }}>{icon}</div>
                  <div>
                    <div className="dash-card-value">{value}</div>
                    <div className="dash-card-label">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              {/* Recent Orders */}
              <div className="admin-table-wrapper">
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="var(--clr-primary)" />
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h3>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recent_orders ?? []).map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 700 }}>#{order.id}</td>
                        <td>{order.customer_name}</td>
                        <td style={{ fontWeight: 600, color: 'var(--clr-primary)' }}>${Number(order.total_price).toFixed(2)}</td>
                        <td><span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span></td>
                      </tr>
                    ))}
                    {!stats.recent_orders?.length && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '2rem' }}>No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Popular Foods */}
              <div className="admin-table-wrapper">
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--clr-primary)" />
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Popular Items</h3>
                </div>
                <div style={{ padding: '1rem' }}>
                  {(stats.popular_foods ?? []).map((food, i) => (
                    <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < stats.popular_foods.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--clr-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>{food.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{food.total_sold} sold</div>
                    </div>
                  ))}
                  {!stats.popular_foods?.length && (
                    <p style={{ color: 'var(--clr-text-muted)', textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>No sales data yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
