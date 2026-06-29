import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, Upload } from 'lucide-react';
import { foodsAPI, categoriesAPI, uploadAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const IMAGE_BASE = 'http://localhost/uploads/';
const FALLBACK   = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&q=60';

const EMPTY_FORM = { name: '', category_id: '', price: '', description: '', stock: 100, image: '', is_featured: 0 };

export default function ManageFoods() {
  const toast = useToast();
  const [foods,       setFoods]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null); // null = add mode
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [errors,      setErrors]      = useState({});

  const loadFoods = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await foodsAPI.getAll({ search: q });
      setFoods(data.foods ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data.categories ?? []));
    loadFoods();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadFoods(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true); };
  const openEdit = (food) => {
    setEditing(food);
    setForm({ name: food.name, category_id: food.category_id, price: food.price, description: food.description, stock: food.stock, image: food.image ?? '', is_featured: food.is_featured });
    setErrors({});
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await uploadAPI.uploadImage(fd);
      if (data.success) { setForm((p) => ({ ...p, image: data.filename })); toast.success('Image uploaded!'); }
      else toast.error(data.message);
    } catch { toast.error('Upload failed.'); }
    finally { setUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.name)        e.name = 'Name is required.';
    if (!form.category_id) e.category_id = 'Category is required.';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required.';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      const { data } = editing ? await foodsAPI.update(editing.id, payload) : await foodsAPI.create(payload);
      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        loadFoods(search);
      } else {
        toast.error(data.message);
      }
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (food) => {
    if (!window.confirm(`Delete "${food.name}"?`)) return;
    try {
      const { data } = await foodsAPI.delete(food.id);
      toast[data.success ? 'success' : 'error'](data.message);
      if (data.success) loadFoods(search);
    } catch { toast.error('Delete failed.'); }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Manage Foods</h1>
            <p>{foods.length} total items</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-food-btn">
            <Plus size={16} /> Add Food
          </button>
        </div>

        {/* Search */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)', padding: '1rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search foods..." value={search} onChange={(e) => setSearch(e.target.value)} id="admin-food-search" />
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          {loading ? <LoadingSpinner /> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => {
                  const img = food.image ? (food.image.startsWith('http') ? food.image : IMAGE_BASE + food.image) : FALLBACK;
                  return (
                    <tr key={food.id}>
                      <td><img src={img} alt={food.name} style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK; }} /></td>
                      <td style={{ fontWeight: 600 }}>{food.name}</td>
                      <td><span style={{ background: 'var(--clr-bg)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem' }}>{food.category_name}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--clr-primary)' }}>${Number(food.price).toFixed(2)}</td>
                      <td>{food.stock}</td>
                      <td>{food.is_featured == 1 ? <span style={{ color: 'var(--clr-gold)', fontWeight: 700 }}>⭐ Yes</span> : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(food)} id={`edit-food-${food.id}`}><Edit2 size={14} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(food)} id={`delete-food-${food.id}`}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!foods.length && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>No foods found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">{editing ? 'Edit Food' : 'Add New Food'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Image */}
                <div className="form-group">
                  <label className="form-label">Food Image</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {form.image && (
                      <img src={form.image.startsWith('http') ? form.image : IMAGE_BASE + form.image} alt="Preview" style={{ width: 56, height: 56, borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = FALLBACK; }} />
                    )}
                    <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                      <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="food-image-upload" />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>or enter URL:</span>
                    <input className="form-input" style={{ flex: 1 }} placeholder="https://..." value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} id="food-image-url" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} id="food-name" />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className={`form-select ${errors.category_id ? 'error' : ''}`} value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))} id="food-category">
                      <option value="">— Select —</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    {errors.category_id && <span className="form-error">{errors.category_id}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price ($) *</label>
                    <input type="number" min="0" step="0.01" className={`form-input ${errors.price ? 'error' : ''}`} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} id="food-price" />
                    {errors.price && <span className="form-error">{errors.price}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input type="number" min="0" className="form-input" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} id="food-stock" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} id="food-description" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" id="food-featured" checked={form.is_featured == 1} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked ? 1 : 0 }))} />
                  <label htmlFor="food-featured" style={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>⭐ Mark as Featured</label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-food-btn">
                    {saving ? 'Saving...' : (editing ? 'Update Food' : 'Add Food')}
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
