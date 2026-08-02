import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Ticket, Calendar, DollarSign, Percent } from 'lucide-react';
import { couponsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const EMPTY_FORM = {
  code: '',
  discount_type: 'fixed',
  discount_value: '',
  min_order_value: '0',
  expiry_date: '',
  active: 1
};

export default function ManageCoupons() {
  const toast = useToast();
  const [coupons,    setCoupons]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState({});

  const loadCoupons = () => {
    setLoading(true);
    couponsAPI.getAll()
      .then((r) => setCoupons(r.data.coupons ?? []))
      .catch(() => toast.error('Failed to load coupons.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCoupons, []);

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 30 days
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const err = {};
    if (!form.code.trim()) err.code = 'Coupon code is required.';
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      err.discount_value = 'Valid discount value is required.';
    }
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) {
      err.discount_value = 'Percentage cannot exceed 100%.';
    }
    if (!form.expiry_date) err.expiry_date = 'Expiry date is required.';
    return err;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value)
      };
      const { data } = await couponsAPI.create(payload);
      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        loadCoupons();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      const { data } = await couponsAPI.delete(coupon.id);
      if (data.success) {
        toast.success(data.message);
        loadCoupons();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Manage Coupons</h1>
            <p>{coupons.length} total coupons configured</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-coupon-btn">
            <Plus size={16} /> Add Coupon
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiry_date) < new Date();
                  const isActive = c.active == 1 && !isExpired;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                        <span style={{ background: 'rgba(139,0,0,0.06)', border: '1px dashed var(--clr-primary)', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                          🎟️ {c.code}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{c.discount_type}</td>
                      <td style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${Number(c.discount_value).toFixed(2)}`}
                      </td>
                      <td>${Number(c.min_order_value).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                          <Calendar size={12} color="var(--clr-text-muted)" />
                          {c.expiry_date}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                          {isActive ? 'Active' : isExpired ? 'Expired' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)} id={`delete-coupon-${c.id}`}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!coupons.length && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>
                      No coupon codes available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">Create New Promo Coupon</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Ticket size={14} /> Coupon Code *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.code ? 'error' : ''}`}
                    placeholder="e.g. SUMMER50"
                    style={{ textTransform: 'uppercase' }}
                    value={form.code}
                    onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))}
                    id="new-coupon-code"
                  />
                  {errors.code && <span className="form-error">{errors.code}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type *</label>
                    <select
                      className="form-select"
                      value={form.discount_type}
                      onChange={(e) => setForm(p => ({ ...p, discount_type: e.target.value }))}
                      id="new-coupon-type"
                    >
                      <option value="fixed">Fixed Cash ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {form.discount_type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      className={`form-input ${errors.discount_value ? 'error' : ''}`}
                      value={form.discount_value}
                      onChange={(e) => setForm(p => ({ ...p, discount_value: e.target.value }))}
                      id="new-coupon-value"
                    />
                    {errors.discount_value && <span className="form-error">{errors.discount_value}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={14} /> Min Order Spend ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={form.min_order_value}
                      onChange={(e) => setForm(p => ({ ...p, min_order_value: e.target.value }))}
                      id="new-coupon-min"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> Expiration Date *
                    </label>
                    <input
                      type="date"
                      className={`form-input ${errors.expiry_date ? 'error' : ''}`}
                      value={form.expiry_date}
                      onChange={(e) => setForm(p => ({ ...p, expiry_date: e.target.value }))}
                      id="new-coupon-expiry"
                    />
                    {errors.expiry_date && <span className="form-error">{errors.expiry_date}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="new-coupon-active"
                    checked={form.active == 1}
                    onChange={(e) => setForm(p => ({ ...p, active: e.target.checked ? 1 : 0 }))}
                    style={{ accentColor: 'var(--clr-primary)' }}
                  />
                  <label htmlFor="new-coupon-active" style={{ fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Active (Allows checkout applications)
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-coupon-btn">
                    {saving ? 'Creating...' : 'Create Coupon'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
