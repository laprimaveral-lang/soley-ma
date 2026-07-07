import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';

// Lazy loading de toutes les pages pour réduire le bundle initial
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Account = lazy(() => import('./pages/Account'));
const Invoice = lazy(() => import('./pages/Invoice'));
const XrpLayout = lazy(() => import('./layouts/XrpLayout'));
const AdminDashboard = lazy(() => import('./pages/xrp/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/xrp/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/xrp/AdminCategories'));
const AdminCollections = lazy(() => import('./pages/xrp/AdminCollections'));
const AdminColors = lazy(() => import('./pages/xrp/AdminColors'));
const AdminSizes = lazy(() => import('./pages/xrp/AdminSizes'));
const AdminOrders = lazy(() => import('./pages/xrp/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/xrp/AdminCustomers'));
const AdminInventory = lazy(() => import('./pages/xrp/AdminInventory'));
const AdminBanners = lazy(() => import('./pages/xrp/AdminBanners'));
const AdminCoupons = lazy(() => import('./pages/xrp/AdminCoupons'));
const AdminSettings = lazy(() => import('./pages/xrp/AdminSettings'));
const AdminLogs = lazy(() => import('./pages/xrp/AdminLogs'));
const StaticPages = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.About })));
const FAQPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.FAQ })));
const DeliveryPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.DeliveryReturns })));
const NotFoundPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.NotFound })));

// Composant de chargement élégant
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid black', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999' }}>Chargement...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <WhatsAppButton />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="collections/:category" element={<ProductList />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="account/orders/:id/invoice" element={<Invoice />} />
            <Route path="account/*" element={<Account />} />
            <Route path="about" element={<StaticPages />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="delivery" element={<DeliveryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/xrp" element={<ProtectedRoute />}>
            <Route element={<XrpLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="colors" element={<AdminColors />} />
              <Route path="sizes" element={<AdminSizes />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="logs" element={<AdminLogs />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
