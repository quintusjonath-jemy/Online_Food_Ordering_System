import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, FileText, Clock } from 'lucide-react';
import { ordersAPI } from '../services/api';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_STEPS = ['pending', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  pending:          'Pending',
  preparing:        'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const IMAGE_BASE = 'http://localhost/uploads/';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=60';

function OrderDetail({ orderId }) {
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(orderId).then((r) => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingSpinner />;
  if (!order)  return <p>Order not found.</p>;

  return (
    <div className="slide-up">
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/orders" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> All Orders</Link>
        <h2 style={{ fontWeight: 700, fontSize: 'var(--fs-xl)' }}>Order #{order.id}</h2>
        <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Items */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Ordered Items</h3>
          {order.items?.map((item) => {
            const img = item.image ? (item.image.startsWith('http') ? item.image : IMAGE_BASE + item.image) : FALLBACK;
            return (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--clr-border)' }}>
                <img src={img} alt={item.food_name} style={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.food_name}</div>
                  {item.selected_addons && item.selected_addons.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-primary)', fontWeight: 600, margin: '2px 0' }}>
                      + {item.selected_addons.map(x => x.name).join(', ')}
                    </div>
                  )}
                  <div style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>×{item.quantity} @ Rs. {Number(item.price).toFixed(2)}</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--clr-primary)' }}>Rs. {(item.quantity * item.price).toFixed(2)}</div>
              </div>
            );
          })}
          
          {Number(order.discount_applied) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--clr-success)', fontWeight: 600 }}>
              <span>Total Discount</span>
              <span>-Rs. {Number(order.discount_applied).toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontWeight: 800, fontSize: '1.1rem' }}>
            <span>Final Paid Total</span>
            <span style={{ color: 'var(--clr-primary)' }}>Rs. {Number(order.total_price).toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Delivery & Payment Info</h3>
          {[
            { Icon: MapPin, label: 'Address', value: order.delivery_address },
            { Icon: Phone,  label: 'Phone',   value: order.phone },
            { Icon: FileText, label: 'Notes', value: order.notes || '—' },
            { 
              Icon: Clock, 
              label: 'Payment Details', 
              value: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                  <span>Method: <strong style={{ textTransform: 'uppercase' }}>{order.payment_method}</strong></span>
                  <span>Status: <span className={`badge badge-${order.payment_status}`} style={{ display: 'inline-block', padding: '1px 6px', fontSize: '0.65rem' }}>{order.payment_status}</span></span>
                  {order.transaction_reference && <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>Ref: {order.transaction_reference}</span>}
                </div>
              ) 
            },
          ].map(({ Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon size={18} color="var(--clr-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--clr-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
            Ordered: {new Date(order.order_date).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { id } = useParams();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) { setLoading(false); return; }
    ordersAPI.getMyOrders().then((r) => setOrders(r.data.orders ?? [])).finally(() => setLoading(false));
  }, [id]);

  if (id) return (
    <div className="page-wrapper">
      <div className="container section-sm">
        {loading ? <LoadingSpinner /> : <OrderDetail orderId={id} />}
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container section-sm">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={26} color="var(--clr-primary)" /> My Orders
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Once you place an order, it'll appear here.</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Start Ordering</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}
