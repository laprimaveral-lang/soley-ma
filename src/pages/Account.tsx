import { Routes, Route, Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import AccountLayout from './account/AccountLayout';
import DashboardView from './account/DashboardView';
import OrdersView from './account/OrdersView';
import AddressesView from './account/AddressesView';
import WishlistView from './account/WishlistView';
import PersonalInfoView from './account/PersonalInfoView';
import SecurityView from './account/SecurityView';
import NotificationsView from './account/NotificationsView';
import StoreCreditView from './account/StoreCreditView';
import ReturnsView from './account/ReturnsView';
import SupportView from './account/SupportView';

export default function Account() {
  const { isAuthenticated } = useCustomerAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AccountLayout>
      <Routes>
        <Route index element={<DashboardView />} />
        <Route path="orders" element={<OrdersView />} />
        <Route path="addresses" element={<AddressesView />} />
        <Route path="wishlist" element={<WishlistView />} />
        <Route path="personal-info" element={<PersonalInfoView />} />
        <Route path="security" element={<SecurityView />} />
        <Route path="notifications" element={<NotificationsView />} />
        <Route path="store-credit" element={<StoreCreditView />} />
        <Route path="returns" element={<ReturnsView />} />
        <Route path="support" element={<SupportView />} />
      </Routes>
    </AccountLayout>
  );
}
