import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Users, Mail, Phone, User, MessageSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { reservationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';

const TIME_SLOTS = [
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
];

export default function BookTable() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guest_name: user?.name || '',
    guest_email: user?.email || '',
    guest_phone: user?.phone || '',
    date: '',
    time: '',
    party_size: '2',
    special_requests: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.guest_name.trim()) errs.guest_name = 'Name is required.';
    if (!form.guest_email.trim() || !/\S+@\S+\.\S+/.test(form.guest_email)) errs.guest_email = 'Valid email is required.';
    if (!form.guest_phone.trim()) errs.guest_phone = 'Phone number is required.';
    if (!form.date) errs.date = 'Date is required.';
    if (!form.time) errs.time = 'Time slot is required.';
    if (Number(form.party_size) <= 0) errs.party_size = 'Party size must be positive.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to book a table.');
      navigate('/login');
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      // API expects 24h format or time string like "12:00:00"
      // Convert "12:00 PM" -> "12:00:00", "9:00 PM" -> "21:00:00"
      const [hourMin, ampm] = form.time.split(' ');
      let [hours, minutes] = hourMin.split(':');
      if (ampm === 'PM' && hours !== '12') hours = String(Number(hours) + 12);
      if (ampm === 'AM' && hours === '12') hours = '00';
      const time24 = `${hours}:${minutes}:00`;

      const payload = {
        ...form,
        time: time24
      };

      const { data } = await reservationsAPI.create(payload);
      if (data.success) {
        setSuccess(true);
        setBookingDetails(data.booking);
        toast.success('Table reserved successfully!');
      } else {
        toast.error(data.message || 'Failed to book table.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Selected slot is fully booked. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  if (success && bookingDetails) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', maxWidth: 500, padding: '3rem var(--sp-6)', background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--clr-border)' }} className="fade-in">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={44} color="var(--clr-success)" />
          </div>
          <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Table Reserved!</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: '1.5rem' }}>
            Your table reservation has been confirmed. A confirmation has been sent to your email.
          </p>
          
          <div style={{ background: 'var(--clr-bg)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left', border: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Guest Name:</span>
              <span>{bookingDetails.guest_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Date & Time:</span>
              <span>{bookingDetails.reservation_date} at {form.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Party Size:</span>
              <span>{bookingDetails.party_size} People</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Assigned Table:</span>
              <span style={{ color: 'var(--clr-primary)', fontWeight: 700 }}>{bookingDetails.table_number || 'T-Auto'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">Return Home</Link>
            <Link to="/menu" className="btn btn-outline">Browse Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container section-sm" style={{ maxWidth: 900 }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return Home
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800 }}>Book A Table</h1>
          <p style={{ color: 'var(--clr-text-muted)' }}>Experience gourmet dining at SaveurEats. Reserve your table today.</p>
          <div className="divider" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Reservation Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.5rem' }}>
                Contact Info
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label"><User size={14} style={{ display: 'inline', marginRight: '4px' }} />Your Name *</label>
                  <input
                    type="text"
                    name="guest_name"
                    className={`form-input ${errors.guest_name ? 'error' : ''}`}
                    value={form.guest_name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    id="booking-name"
                  />
                  {errors.guest_name && <span className="form-error">{errors.guest_name}</span>}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label"><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />Email Address *</label>
                    <input
                      type="email"
                      name="guest_email"
                      className={`form-input ${errors.guest_email ? 'error' : ''}`}
                      value={form.guest_email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      id="booking-email"
                    />
                    {errors.guest_email && <span className="form-error">{errors.guest_email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />Phone Number *</label>
                    <input
                      type="tel"
                      name="guest_phone"
                      className={`form-input ${errors.guest_phone ? 'error' : ''}`}
                      value={form.guest_phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      id="booking-phone"
                    />
                    {errors.guest_phone && <span className="form-error">{errors.guest_phone}</span>}
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginTop: '2rem', marginBottom: '1.5rem', color: 'var(--clr-primary)', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.5rem' }}>
                Booking Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label"><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />Reservation Date *</label>
                    <input
                      type="date"
                      name="date"
                      className={`form-input ${errors.date ? 'error' : ''}`}
                      value={form.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                      id="booking-date"
                    />
                    {errors.date && <span className="form-error">{errors.date}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Users size={14} style={{ display: 'inline', marginRight: '4px' }} />Guests *</label>
                    <select
                      name="party_size"
                      className="form-select"
                      value={form.party_size}
                      onChange={handleChange}
                      id="booking-guests"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />Available Time Slots *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {TIME_SLOTS.map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setForm(p => ({ ...p, time: t }))}
                        style={{
                          padding: '0.6rem 0.25rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          border: form.time === t ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)',
                          background: form.time === t ? 'rgba(139,0,0,0.08)' : 'white',
                          color: form.time === t ? 'var(--clr-primary)' : 'var(--clr-text)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.time && <span className="form-error">{errors.time}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label"><MessageSquare size={14} style={{ display: 'inline', marginRight: '4px' }} />Special Requests (optional)</label>
                  <textarea
                    name="special_requests"
                    className="form-input form-textarea"
                    value={form.special_requests}
                    onChange={handleChange}
                    placeholder="e.g. Birthday celebration, wheelchair access, high chair needed..."
                    rows={3}
                    id="booking-notes"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="confirm-booking-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Confirming Reservation...' : 'Confirm Table Reservation'}
            </button>
          </form>

          {/* Guidelines Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem', background: 'var(--clr-primary)', color: 'white' }}>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 800, marginBottom: '1rem', color: 'var(--clr-gold)' }}>Reservation Policies</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                <li>⏱️ We hold reservations for a maximum of 15 minutes past the booking time.</li>
                <li>👨‍👩‍👧‍👦 For larger group reservations (&gt; 16 people), please call us directly.</li>
                <li>🧼 Cleanliness, safety, and top-tier dining guidelines are fully enforced.</li>
                <li>📧 An email receipt with table info will be generated upon confirmation.</li>
              </ul>
            </div>
            
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: 'var(--fs-md)', fontWeight: 700, marginBottom: '1rem' }}>Opening Hours</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Mon - Fri</span>
                  <span style={{ fontWeight: 600 }}>12:00 PM - 10:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'between' }}>
                  <span>Sat - Sun</span>
                  <span style={{ fontWeight: 600 }}>11:00 AM - 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
