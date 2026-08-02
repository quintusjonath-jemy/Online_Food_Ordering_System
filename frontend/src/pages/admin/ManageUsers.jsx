import { useState, useEffect } from 'react';
import { Users, Trash2, Search, ShoppingBag, Eye, X } from 'lucide-react';
import { usersAPI, ordersAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageUsers() {
  const toast = useToast();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const load = () => {
    setLoading(true);
    usersAPI.getAll().then((r) => setUsers(r.data.users ?? [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const viewOrders = (user) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    ordersAPI.getMyOrders({ user_id: user.id })
      .then((r) => {
        setUserOrders(r.data.orders ?? []);
      })
      .catch(() => toast.error('Failed to load user orders.'))
      .finally(() => setLoadingOrders(false));
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This will also delete their orders.`)) return;
    try {
      const { data } = await usersAPI.delete(user.id);
      toast[data.success ? 'success' : 'error'](data.message);
      if (data.success) load();
    } catch { toast.error('Delete failed.'); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Manage Customers</h1>
            <p>{users.filter((u) => u.role === 'customer').length} customers</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)', padding: '1rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} id="admin-user-search" />
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? <LoadingSpinner /> : (
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                          {user.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)' }}>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: user.role === 'admin' ? 'rgba(212,175,55,0.15)' : 'rgba(34,197,94,0.1)', color: user.role === 'admin' ? '#92400E' : '#166534' }}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.role !== 'admin' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => viewOrders(user)} id={`view-orders-${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShoppingBag size={14} /> Orders
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)} id={`delete-user-${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* User Orders Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Orders for {selectedUser.name}</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {loadingOrders ? <LoadingSpinner /> : userOrders.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-muted)' }}>This customer has not placed any orders yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {userOrders.map((order) => (
                    <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>Order #{order.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                          {new Date(order.order_date).toLocaleString()} | {order.item_count} items
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          Status: <span className={`badge badge-${order.status}`} style={{ display: 'inline-block', padding: '1px 6px', fontSize: '0.65rem' }}>{order.status}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--clr-primary)', marginBottom: '0.5rem' }}>Rs. {Number(order.total_price).toFixed(2)}</div>
                        <a href={`/orders/${order.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          View Details <Eye size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
