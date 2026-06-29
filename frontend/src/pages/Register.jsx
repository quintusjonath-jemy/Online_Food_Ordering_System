import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, MapPin, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', address: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  if (isAuthenticated) { navigate('/'); return null; }

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Full name is required.';
    if (!form.email)        e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)     e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const result = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address });
      if (result.success) {
        toast.success(`Welcome to SaveurEats, ${result.user.name}! 🎉`);
        navigate('/');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, icon, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        className={`form-input ${errors[name] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        id={`register-${name}`}
        autoComplete={name}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-illustration" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #8B0000 60%, #D4AF37 200%)' }}>
        <div className="auth-illustration-text">
          <UtensilsCrossed size={48} style={{ color: 'var(--clr-gold)', marginBottom: '1.5rem' }} />
          <h2>Join SaveurEats</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            Create your free account and start enjoying premium dining at home.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['✅ Free to join', '🎁 First delivery free', '📱 Track orders in real-time', '🌟 Exclusive member discounts'].map((t) => (
              <div key={t} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h1>Create Account</h1>
          <p className="subtitle">Fill in your details to get started.</p>

          <form className="auth-form" onSubmit={handleSubmit} id="register-form">
            {field('name',    'Full Name',  <User   size={13} />, 'text',  'John Smith')}
            {field('email',   'Email',      <Mail   size={13} />, 'email', 'your@email.com')}
            {field('phone',   'Phone',      <Phone  size={13} />, 'tel',   '+1 (555) 000-0000')}
            {field('address', 'Address',    <MapPin size={13} />, 'text',  'Optional — your default delivery address')}

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  id="register-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                id="register-confirm"
              />
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="register-submit" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? '⏳ Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
