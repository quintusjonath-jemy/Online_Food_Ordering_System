import { useState, useEffect } from 'react';
import { Calendar, Users, Phone, Mail, Check, X, FileText, Menu, Clock } from 'lucide-react';
import { reservationsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'seated', label: 'Seated' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function ManageReservations() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await reservationsAPI.getAll({
        date: filterDate,
        status: filterStatus
      });
      setBookings(data.reservations ?? []);
    } catch {
      toast.error('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filterDate, filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await reservationsAPI.updateStatus(id, status);
      if (data.success) {
        toast.success(data.message);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to update reservation status.');
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-content">
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }} className="mobile-menu-trigger">
              <Menu size={22} />
            </button>
            <div>
              <h1>Manage Reservations</h1>
              <p>{bookings.length} reservations found</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Date Filter */}
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', minWidth: 150, padding: '0.5rem 1rem' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              id="admin-reservation-date"
            />
            {/* Status Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 150, padding: '0.5rem 1.5rem 0.5rem 1rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="admin-reservation-status"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {(filterDate || filterStatus) && (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => { setFilterDate(''); setFilterStatus(''); }}
                style={{ fontSize: '0.8rem' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <LoadingSpinner message="Loading reservation database..." />
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No reservations found</h3>
              <p>Try modifying your date or status filters.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer / Contact</th>
                  <th>Schedule</th>
                  <th>Party Size</th>
                  <th>Table</th>
                  <th>Status</th>
                  <th>Requests</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} id={`booking-row-${booking.id}`}>
                    <td style={{ fontWeight: 700 }}>#{booking.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{booking.guest_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', flexDirection: 'column' }}>
                        <span><Phone size={10} style={{ display: 'inline', marginRight: 2 }} />{booking.guest_phone}</span>
                        <span><Mail size={10} style={{ display: 'inline', marginRight: 2 }} />{booking.guest_email}</span>
                      </div>
                      {booking.ordered_foods && booking.ordered_foods.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--clr-primary)', display: 'block', marginBottom: '2px' }}>
                            Recent Orders:
                          </span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {booking.ordered_foods.map(f => (
                              <span key={f} style={{ background: 'var(--clr-bg)', color: 'var(--clr-text)', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--clr-border)' }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{booking.reservation_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />
                        {booking.reservation_time}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <Users size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                      {booking.party_size} People
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>
                      {booking.table_number || 'T-Auto'}
                    </td>
                    <td>
                      <span className={`badge badge-${booking.status}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td style={{ maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={booking.special_requests}>
                      {booking.special_requests ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                          <FileText size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          {booking.special_requests}
                        </span>
                      ) : (
                        <span style={{ color: '#ccc' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {booking.status === 'pending' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', background: 'var(--clr-success)', borderColor: 'var(--clr-success)', minWidth: 'auto' }}
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            title="Confirm Booking"
                            id={`confirm-booking-${booking.id}`}
                          >
                            <Check size={12} />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', background: 'var(--clr-primary)', borderColor: 'var(--clr-primary)', minWidth: 'auto' }}
                            onClick={() => handleStatusChange(booking.id, 'seated')}
                            title="Seat Guests"
                            id={`seat-booking-${booking.id}`}
                          >
                            Seated
                          </button>
                        )}
                        {booking.status === 'seated' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', background: 'var(--clr-gold)', borderColor: 'var(--clr-gold)', color: '#222', minWidth: 'auto' }}
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            title="Complete Booking"
                            id={`complete-booking-${booking.id}`}
                          >
                            Finish
                          </button>
                        )}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', minWidth: 'auto' }}
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            title="Cancel Booking"
                            id={`cancel-booking-${booking.id}`}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
