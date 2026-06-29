import { useState } from 'react';
import { User, Phone, MapPin, Lock, Save, Camera } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name:     user?.name    || '',
    phone:    user?.phone   || '',
    address:  user?.address || '',
    password: '',
    confirm:  '',
  });
  const [saving, setSaving] = useState(false);
  const [tab,    setTab]    = useState('profile');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password && form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address };
      if (form.password) payload.password = form.password;
      const { data } = await usersAPI.update(payload);
      if (data.success) {
        updateUser(data.user);
        toast.success('Profile updated successfully!');
        setForm((prev) => ({ ...prev, password: '', confirm: '' }));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container section-sm" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={26} color="var(--clr-primary)" /> My Profile
        </h1>

        {/* Profile Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--clr-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-card)', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white',
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: 'var(--clr-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', cursor: 'pointer' }}>
              <Camera size={12} color="white" />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>{user?.name}</div>
            <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
            <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.15rem 0.6rem', background: 'rgba(139,0,0,0.08)', color: 'var(--clr-primary)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              {user?.role === 'admin' ? '👑 Administrator' : '🍴 Customer'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--clr-white)', padding: '0.4rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--clr-border)', width: 'fit-content' }}>
          {[['profile', 'Profile Info'], ['security', 'Security']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', background: tab === key ? 'var(--clr-primary)' : 'transparent', color: tab === key ? 'white' : 'var(--clr-text-muted)' }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="card" style={{ padding: '2rem' }}>
            {tab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label"><User size={14} style={{ display: 'inline', marginRight: '4px' }} />Full Name</label>
                  <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} id="profile-name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  <span className="form-error" style={{ color: 'var(--clr-text-muted)' }}>Email cannot be changed</span>
                </div>
                <div className="form-group">
                  <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />Phone Number</label>
                  <input type="tel" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" id="profile-phone" />
                </div>
                <div className="form-group">
                  <label className="form-label"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />Default Address</label>
                  <textarea name="address" className="form-input form-textarea" value={form.address} onChange={handleChange} rows={3} placeholder="Your default delivery address" id="profile-address" />
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(139,0,0,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,0,0,0.1)' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
                    Leave password fields blank to keep your current password.
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label"><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />New Password</label>
                  <input type="password" name="password" className="form-input" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" id="profile-password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" name="confirm" className="form-input" value={form.confirm} onChange={handleChange} placeholder="Repeat your new password" id="profile-confirm" />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1.5rem' }} id="save-profile-btn">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
