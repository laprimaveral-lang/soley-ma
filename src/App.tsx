import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import XrpLayout from './layouts/XrpLayout';
import AdminDashboard from './pages/xrp/AdminDashboard';
import AdminProducts from './pages/xrp/AdminProducts';
import AdminCategories from './pages/xrp/AdminCategories';
import AdminCollections from './pages/xrp/AdminCollections';
import AdminColors from './pages/xrp/AdminColors';
import AdminSizes from './pages/xrp/AdminSizes';
import AdminOrders from './pages/xrp/AdminOrders';
import AdminCustomers from './pages/xrp/AdminCustomers';
import AdminInventory from './pages/xrp/AdminInventory';
import AdminBanners from './pages/xrp/AdminBanners';
import AdminCoupons from './pages/xrp/AdminCoupons';
import AdminSettings from './pages/xrp/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { About, FAQ, DeliveryReturns, NotFound } from './pages/StaticPages';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <Router>
      <WhatsAppButton />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collections/:category" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="account/*" element={<Account />} />
          
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="delivery" element={<DeliveryReturns />} />
          <Route path="*" element={<NotFound />} />
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
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
