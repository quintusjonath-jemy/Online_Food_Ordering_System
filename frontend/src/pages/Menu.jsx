import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { foodsAPI, categoriesAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

export default function Menu() {
  const [foods,      setFoods]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [sort,       setSort]       = useState('newest');
  const [loading,    setLoading]    = useState(true);

  // Fetch categories once
  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data.categories ?? []));
  }, []);

  // Re-fetch foods when filters change (with debounce on search)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await foodsAPI.getAll({ search, category_id: catFilter, sort });
        setFoods(data.foods ?? []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [search, catFilter, sort]);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <section style={{ background: 'linear-gradient(135deg, #1a0000, var(--clr-primary))', padding: '4rem 0 3rem', marginTop: 0 }}>
        <div className="container" style={{ textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: 'var(--fs-4xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Our Menu</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-md)' }}>
            {foods.length} premium dishes crafted with the finest ingredients
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {/* Filters Bar */}
          <div style={{
            background: 'var(--clr-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-5)',
            border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-card)',
            display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', flexWrap: 'wrap',
            marginBottom: 'var(--sp-8)',
          }}>
            {/* Search */}
            <div className="search-wrapper" style={{ flex: 1, minWidth: 240 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search dishes, cuisines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="menu-search"
              />
            </div>

            {/* Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={16} color="var(--clr-text-muted)" />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: 150 }}
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                id="menu-category-filter"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 150 }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              id="menu-sort"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="category-pills" style={{ marginBottom: 'var(--sp-8)' }}>
            <button className={`category-pill ${catFilter === '' ? 'active' : ''}`} onClick={() => setCatFilter('')} id="cat-all">
              🍽️ All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`category-pill ${catFilter == c.id ? 'active' : ''}`}
                onClick={() => setCatFilter(catFilter == c.id ? '' : c.id)}
                id={`cat-pill-${c.id}`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <LoadingSpinner message="Loading delicious dishes..." />
          ) : foods.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <h3>No dishes found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid-4">
              {foods.map((food) => <FoodCard key={food.id} food={food} />)}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
