import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast   = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) { navigate('/'); return null; }

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}! 👋`);
        navigate(result.user.role === 'admin' ? '/admin' : '/');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Illustration */}
      <div className="auth-illustration" style={{ backgroundImage: `linear-gradient(135deg, rgba(26,0,0,0.85), rgba(139,0,0,0.85)), url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="auth-illustration-text">
          <UtensilsCrossed size={48} style={{ color: 'var(--clr-gold)', marginBottom: '1.5rem' }} />
          <h2>Welcome Back!</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            Sign in to continue your culinary journey. 
            Your favourite dishes are waiting.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            {['🍔 500+ premium dishes', '🚀 30-min delivery', '⭐ 4.9★ average rating'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h1>Sign In</h1>
          <p className="subtitle">Enter your credentials to access your account.</p>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
                id="login-email"
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
                  id="login-password"
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="login-submit" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(139,0,0,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,0,0,0.1)', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--clr-primary)' }}>🔑 Demo Credentials</div>
            <div style={{ color: 'var(--clr-text-muted)' }}>
              <span style={{ fontWeight: 600 }}>Admin:</span> admin@foodie.com / password<br />
              <span style={{ fontWeight: 600 }}>Customer:</span> john@example.com / password
            </div>
          </div>

          <div className="auth-link">
            Don't have an account? <Link to="/register">Create one free →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
