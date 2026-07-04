import { Navigate, Outlet } from 'react-router-dom';
import { AuthService } from '../services/api';

export default function ProtectedRoute() {
  const isAdmin = AuthService.isAuthenticated();
  const isCustomer = !!localStorage.getItem('customerToken');
  
  if (!isAdmin) {
    if (isCustomer) {
      // Logged in as customer, but not admin. Redirect to home page.
      return <Navigate to="/" replace />;
    }
    // Not logged in at all. Redirect to login page.
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}
