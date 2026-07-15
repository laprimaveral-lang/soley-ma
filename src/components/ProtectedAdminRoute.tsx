import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedAdminRoute() {
  const adminToken = localStorage.getItem('adminToken');
  const adminUserStr = localStorage.getItem('adminUser');
  const location = useLocation();
  
  let isAdmin = false;
  if (adminToken && adminUserStr) {
    try {
      const user = JSON.parse(adminUserStr);
      if (user && user.role === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Invalid adminUser in localStorage");
    }
  }
  
  if (!isAdmin) {
    // Redirect to the dedicated admin login page, and pass the intended destination
    return <Navigate to="/xrp/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
}
