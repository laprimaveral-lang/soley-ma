import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    const userStr = localStorage.getItem('customerUser');
    const adminToken = localStorage.getItem('adminToken');
    const adminStr = localStorage.getItem('adminUser');
    
    if (token && userStr) {
      try {
        setCustomer(JSON.parse(userStr));
      } catch (e) {}
    } else if (adminToken && adminStr) {
      try {
        setCustomer(JSON.parse(adminStr));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const res = await AuthService.customerLogin(credentials);
    setCustomer(res.user);
  };

  const register = async (data: any) => {
    const res = await AuthService.customerRegister(data);
    setCustomer(res.user);
  };

  const logout = () => {
    AuthService.customerLogout();
    AuthService.logout();
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      isAuthenticated: !!customer,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
