import { useState, useEffect } from 'react';
import { Users, Trash2, Search } from 'lucide-react';
import { usersAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageUsers() {
  const toast = useToast();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const load = () => {
    setLoading(true);
    usersAPI.getAll().then((r) => setUsers(r.data.users ?? [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This will also delete their orders.`)) return;
    try {
      const { data } = await usersAPI.delete(user.id);
      toast[data.success ? 'success' : 'error'](data.message);
      if (data.success) load();
    } catch { toast.error('Delete failed.'); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Manage Customers</h1>
            <p>{users.filter((u) => u.role === 'customer').length} customers</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--clr-border)', padding: '1rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} id="admin-user-search" />
          </div>
        </div>

        <div className="admin-table-wrapper">
          {loading ? <LoadingSpinner /> : (
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                          {user.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)' }}>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: user.role === 'admin' ? 'rgba(212,175,55,0.15)' : 'rgba(34,197,94,0.1)', color: user.role === 'admin' ? '#92400E' : '#166534' }}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      {user.role !== 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)} id={`delete-user-${user.id}`}>
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--clr-text-muted)' }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
