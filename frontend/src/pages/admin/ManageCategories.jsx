import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { categoriesAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ICONS = ['🍔','🍕','🍣','🍝','🥗','🍰','🥤','🥩','🍜','🍱','🌮','🥙','🍛','🍲'];

export default function ManageCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState({ name: '', icon: '🍽️' });
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const load = () => {
    setLoading(true);
    categoriesAPI.getAll().then((r) => setCategories(r.data.categories ?? [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setEditing(null); setForm({ name: '', icon: '🍽️' }); setError(''); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, icon: cat.icon }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Category name is required.'); return; }
    setSaving(true);
    try {
      const { data } = editing
        ? await categoriesAPI.update(editing.id, form)
        : await categoriesAPI.create(form);
      toast[data.success ? 'success' : 'error'](data.message);
      if (data.success) { setShowModal(false); load(); }
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? Foods in this category will also be deleted.`)) return;
    try {
      const { data } = await categoriesAPI.delete(cat.id);
      toast[data.success ? 'success' : 'error'](data.message);
      if (data.success) load();
    } catch { toast.error('Delete failed.'); }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Manage Categories</h1>
            <p>{categories.length} categories</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} id="add-category-btn">
            <Plus size={16} /> Add Category
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => (
              <div key={cat.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }} id={`cat-card-${cat.id}`}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--clr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{cat.food_count ?? 0} items</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)} id={`edit-cat-${cat.id}`}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)} id={`delete-cat-${cat.id}`}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {!categories.length && (
              <div className="empty-state"><div className="empty-state-icon"><Tag size={40} /></div><h3>No categories yet</h3></div>
            )}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal" style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h2 className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input className={`form-input ${error ? 'error' : ''}`} value={form.name} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError(''); }} id="cat-name" />
                  {error && <span className="form-error">{error}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {ICONS.map((icon) => (
                      <button key={icon} type="button" onClick={() => setForm((p) => ({ ...p, icon }))} style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', fontSize: '1.25rem', border: form.icon === icon ? '2px solid var(--clr-primary)' : '1.5px solid var(--clr-border)', background: form.icon === icon ? 'rgba(139,0,0,0.08)' : 'white', cursor: 'pointer' }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-category-btn">
                    {saving ? 'Saving...' : (editing ? 'Update' : 'Add Category')}
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
