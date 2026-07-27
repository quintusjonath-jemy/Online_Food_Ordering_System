import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Star, Zap, Award, Clock } from 'lucide-react';
import { foodsAPI, categoriesAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

const REVIEWS = [
  { name: 'Emily Rodriguez', location: 'New York, NY', rating: 5, text: 'Absolutely incredible! The truffle carbonara was the best pasta I\'ve ever tasted. Arrived piping hot and beautifully presented. Will order again!' },
  { name: 'James Chen',      location: 'San Francisco, CA', rating: 5, text: 'The wagyu steak was cooked to absolute perfection. I\'m genuinely shocked by how a delivery can maintain such quality. Phenomenal.' },
  { name: 'Aisha Patel',     location: 'Chicago, IL', rating: 5, text: 'The sushi platter was restaurant-quality — super fresh fish and beautifully arranged. The dragon roll was out of this world. Highly recommend!' },
];

const HERO_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=85';

export default function Home() {
  const [featured,    setFeatured]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [activecat,   setActiveCat]   = useState(null);
  const [catFoods,    setCatFoods]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          foodsAPI.getAll({ featured: 1 }),
          categoriesAPI.getAll(),
        ]);
        setFeatured(featRes.data.foods?.slice(0, 8) ?? []);
        setCategories(catRes.data.categories ?? []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Load foods for selected category
  useEffect(() => {
    if (!activecat) { setCatFoods([]); return; }
    foodsAPI.getAll({ category_id: activecat }).then((r) => setCatFoods(r.data.foods ?? []));
  }, [activecat]);

  return (
    <div className="page-wrapper">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container" style={{ display: 'contents' }}>
          <div className="hero-content container" style={{ paddingRight: 0 }}>
            <div className="hero-eyebrow">
              <Zap size={14} /> Now delivering in 30 minutes or less
            </div>
            <h1>
              Experience Fine
              <span className="highlight">Dining at Home</span>
            </h1>
            <p className="hero-subtitle">
              Premium restaurant-quality meals crafted by master chefs, delivered fresh to your door. Elevate every meal.
            </p>
            <div className="hero-cta">
              <Link to="/menu" className="btn btn-gold btn-lg">
                Explore Menu <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-full)', padding: '0.9rem 2rem', fontWeight: 600, fontSize: '1rem', backdropFilter: 'blur(4px)' }}>
                Join Us Free
              </Link>
            </div>
            <div className="hero-stats">
              {[['500+', 'Menu Items'], ['50K+', 'Happy Customers'], ['4.9★', 'Average Rating']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="hero-stat-value">{val}</div>
                  <div className="hero-stat-label">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image-wrapper" style={{ paddingRight: '4rem' }}>
            <div className="hero-image-glow" />
            <img src={HERO_IMG} alt="Premium restaurant dish" className="hero-image" />
            {/* Floating cards */}
            <div className="hero-floating-card card-1">
              <span className="floating-card-icon">🕐</span>
              <div>
                <div className="floating-card-title">30 min delivery</div>
                <div className="floating-card-text">Guaranteed fresh</div>
              </div>
            </div>
            <div className="hero-floating-card card-2">
              <span className="floating-card-icon">⭐</span>
              <div>
                <div className="floating-card-title">4.9 / 5.0</div>
                <div className="floating-card-text">50K+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Foods ───────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--clr-bg-alt)' }}>
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Chef's Selection</span>
            <h2>Featured <span>Dishes</span></h2>
            <p>Handpicked by our master chefs — the absolute best we have to offer.</p>
            <div className="divider" />
          </div>
          {loading ? <LoadingSpinner /> : (
            <>
              <div className="grid-4">
                {featured.map((food) => <FoodCard key={food.id} food={food} />)}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
                <Link to="/menu" className="btn btn-outline btn-lg">
                  View Full Menu <ChevronRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Browse by Type</span>
            <h2>Explore Our <span>Categories</span></h2>
            <div className="divider" />
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="category-pills">
              <button
                className={`category-pill ${activecat === null ? 'active' : ''}`}
                onClick={() => setActiveCat(null)}
                id="cat-all"
              >
                <span className="icon">🍽️</span> All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-pill ${activecat === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCat(cat.id === activecat ? null : cat.id)}
                  id={`cat-${cat.id}`}
                >
                  <span className="icon">{cat.icon}</span> {cat.name}
                  {cat.food_count > 0 && (
                    <span style={{ background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: '999px', fontSize: '0.7rem' }}>
                      {cat.food_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Category foods */}
          {catFoods.length > 0 && (
            <div className="grid-4" style={{ marginTop: 'var(--sp-10)' }}>
              {catFoods.slice(0, 8).map((food) => <FoodCard key={food.id} food={food} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="section-sm" style={{ background: 'var(--clr-white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-6)' }}>
            {[
              { icon: <Zap size={24} />, title: 'Lightning Fast',  desc: '30-minute delivery guaranteed or your next order is free.' },
              { icon: <Award size={24} />, title: 'Premium Quality', desc: 'Michelin-starred chefs craft every dish with finest ingredients.' },
              { icon: <Clock size={24} />, title: 'Order Anytime',   desc: 'Available 7 days a week, from 8am to midnight.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
                <div style={{
                  width: 60, height: 60, background: 'rgba(139,0,0,0.08)', borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--clr-primary)', margin: '0 auto var(--sp-4)',
                }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--sp-2)' }}>{title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--clr-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Testimonials</span>
            <h2>What Our <span>Customers</span> Say</h2>
            <div className="divider" />
          </div>
          <div className="grid-3">
            {REVIEWS.map((r) => (
              <div key={r.name} className="review-card">
                <div className="review-stars">
                  {'★'.repeat(r.rating)}
                </div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar">{r.name.charAt(0)}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-location">{r.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1a0000, var(--clr-primary))', padding: 'var(--sp-16) 0' }}>
        <div className="container" style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, marginBottom: 'var(--sp-4)' }}>
            Ready to Order?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--sp-8)', fontSize: 'var(--fs-md)' }}>
            Your next favourite meal is just a few clicks away.
          </p>
          <Link to="/menu" className="btn btn-gold btn-lg">
            Order Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
