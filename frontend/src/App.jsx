import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';

// Customer pages
import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Menu        from './pages/Menu';
import FoodDetails from './pages/FoodDetails';
import Cart        from './pages/Cart';
import Checkout    from './pages/Checkout';
import Orders      from './pages/Orders';
import Profile     from './pages/Profile';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import ManageFoods       from './pages/admin/ManageFoods';
import ManageCategories  from './pages/admin/ManageCategories';
import ManageOrders      from './pages/admin/ManageOrders';
import ManageUsers       from './pages/admin/ManageUsers';
import ManageReservations from './pages/admin/ManageReservations';

// Customer pages
import BookTable from './pages/BookTable';

/**
 * Customer layout — includes Navbar
 */
function CustomerLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

/**
 * Protected route for authenticated users only
 */
function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * Protected route for admin users only
 */
function RequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Customer Routes ─────────────────────────── */}
      <Route element={<CustomerLayout />}>
        {/* Public */}
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/menu"      element={<Menu />} />
        <Route path="/food/:id"  element={<FoodDetails />} />
        <Route path="/cart"      element={<Cart />} />

        {/* Auth-required customer routes */}
        <Route element={<RequireAuth />}>
          <Route path="/checkout"    element={<Checkout />} />
          <Route path="/orders"      element={<Orders />} />
          <Route path="/orders/:id"  element={<Orders />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/book-table"  element={<BookTable />} />
        </Route>
      </Route>

      {/* ── Admin Routes ─────────────────────────────── */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin"             element={<AdminDashboard />} />
        <Route path="/admin/foods"       element={<ManageFoods />} />
        <Route path="/admin/categories"  element={<ManageCategories />} />
        <Route path="/admin/orders"      element={<ManageOrders />} />
        <Route path="/admin/users"       element={<ManageUsers />} />
        <Route path="/admin/reservations" element={<ManageReservations />} />
      </Route>

      {/* ── 404 ─────────────────────────────────────── */}
      <Route path="*" element={
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🍽️</div>
          <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>404</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem' }}>Oops! This page doesn't exist.</p>
          <a href="/" className="btn btn-primary">Return Home</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
