import { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_OPTIONS = [
  { value: 'pending',          label: 'Pending',          color: '#F59E0B' },
  { value: 'preparing',        label: 'Preparing',        color: '#3B82F6' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#8B5CF6' },
  { value: 'delivered',        label: 'Delivered',        color: '#22C55E' },
  { value: 'cancelled',        label: 'Cancelled',        color: '#EF4444' },
];

const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost/uploads/';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=60';

export default function ManageOrders() {
  const toast = useToast();
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('');
  const [detail,     setDetail]     = useState(null); // order for detail modal
  const [detailLoading, setDetailLoading] = useState(false);

  const load = (status = '') => {
    setLoading(true);
    ordersAPI.getMyOrders({ status }).then((r) => setOrders(r.data.orders ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await ordersAPI.updateStatus(orderId, status);
      toast[data.success ? 'success' : 'error'](data.message);
      if (data.success) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
        if (detail?.id === orderId) setDetail((prev) => ({ ...prev, status }));
      }
    } catch { toast.error('Update failed.'); }
  };

  const viewDetail = async (order) => {
    setDetailLoading(true);
    setDetail(order);
    try {
      const { data } = await ordersAPI.getById(order.id);
      if (data.success) setDetail(data.order);
    } finally { setDetailLoading(false); }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Manage Orders</h1>
            <p>{orders.length} orders</p>
          </div>
          {/* Status filter */}
          <select className="form-select" style={{ width: 'auto', minWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)} id="orders-status-filter">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="admin-table-wrapper">
          {loading ? <LoadingSpinner /> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>#{order.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{order.customer_email}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>Rs. {Number(order.total_price).toFixed(2)}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: 150, padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        id={`order-status-${order.id}`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(order)} id={`view-order-${order.id}`}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>No orders found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {detail && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
            <div className="modal" style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h2 className="modal-title">Order #{detail.id}</h2>
                <button className="modal-close" onClick={() => setDetail(null)}><X size={16} /></button>
              </div>
              {detailLoading ? <LoadingSpinner /> : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Customer', value: detail.customer_name },
                      { label: 'Status',   value: <span className={`badge badge-${detail.status}`}>{detail.status}</span> },
                      { label: 'Phone',    value: detail.phone },
                      { label: 'Total',    value: <strong style={{ color: 'var(--clr-primary)' }}>Rs. {Number(detail.total_price).toFixed(2)}</strong> },
                      { label: 'Address',  value: detail.delivery_address },
                      { label: 'Notes',    value: detail.notes || '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
                        <div style={{ fontSize: '0.875rem' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Items Ordered</h3>
                  {(detail.items ?? []).map((item) => {
                    const img = item.image ? (item.image.startsWith('http') ? item.image : IMAGE_BASE + item.image) : FALLBACK;
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--clr-border)', alignItems: 'center' }}>
                        <img src={img} alt={item.food_name} style={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK; }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.food_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>×{item.quantity} @ Rs. {Number(item.price).toFixed(2)}</div>
                        </div>
                        <div style={{ fontWeight: 700 }}>Rs. {(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
