import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';

const STATUS_LABELS = {
  pending:          'Pending',
  preparing:        'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

import { IMAGE_BASE_URL as IMAGE_BASE } from '../config';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=60';

export default function OrderCard({ order }) {
  const date = new Date(order.order_date).toLocaleDateString('en-US', {
    year: 'month', month: 'short', day: 'numeric',
  });

  return (
    <div className="card fade-in" style={{ padding: 'var(--sp-5)' }} id={`order-card-${order.id}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div style={{
            width: 42, height: 42, background: 'var(--clr-bg)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={20} color="var(--clr-primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>Order #{order.id}</div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--clr-text-muted)' }}>{date}</div>
          </div>
        </div>
        <span className={`badge badge-${order.status}`}>{STATUS_LABELS[order.status]}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--clr-text-muted)' }}>
          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <span style={{ fontWeight: 800, fontSize: 'var(--fs-lg)', color: 'var(--clr-primary)' }}>
            ${Number(order.total_price).toFixed(2)}
          </span>
          <Link
            to={`/orders/${order.id}`}
            className="btn btn-ghost btn-sm"
            id={`view-order-${order.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Details <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
