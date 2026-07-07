import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  Heart, 
  Award,
  LogOut 
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import FadeUp from '../../components/animations/FadeUp';

const NAV_ITEMS = [
  { path: '/account', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/account/orders', label: 'Mes commandes', icon: Package },
  { path: '/account/addresses', label: 'Mes adresses', icon: MapPin },
  { path: '/account/wishlist', label: 'Ma wishlist', icon: Heart },
  { path: '/account/loyalty', label: 'Fidélité & Remises', icon: Award },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout, customer } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen pt-48 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="text-3xl font-serif tracking-wide text-black mb-2">Mon Espace</h1>
          <p className="text-sm text-gray-500">Bienvenue, <span className="text-black font-semibold">{customer?.name}</span></p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-32">
            <nav className="flex flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar lg:block flex-row">
              <div className="flex lg:flex-col min-w-max lg:min-w-0 gap-2 lg:gap-1">
                {NAV_ITEMS.map((item) => {
                  // Exact match for dashboard, startsWith for others
                  const isActive = item.path === '/account' 
                    ? location.pathname === '/account'
                    : location.pathname.startsWith(item.path);
                  
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.path}
                      to={item.path} 
                      className={`flex items-center gap-4 px-6 py-4 text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${
                        isActive 
                          ? 'bg-black text-white shadow-soft' 
                          : 'text-gray-500 hover:text-black hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <Icon className={`w-4 h-4 stroke-[1.5] shrink-0 ${isActive ? 'text-white' : ''}`} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200 hidden lg:block">
                {(localStorage.getItem('adminToken') || customer?.role === 'admin') && (
                  <Link 
                    to="/xrp"
                    className="flex items-center gap-4 px-6 py-4 text-[11px] font-bold tracking-widest uppercase text-blue-500 hover:bg-blue-50 transition-all duration-300 w-full text-left mb-2 rounded"
                  >
                    Accès Administration
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-4 px-6 py-4 text-[11px] font-bold tracking-widest uppercase text-red-500 hover:bg-red-50 transition-all duration-300 w-full text-left rounded"
                >
                  <LogOut className="w-4 h-4 stroke-[1.5]" />
                  Déconnexion
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            <FadeUp key={location.pathname} duration={0.4}>
              <div className="bg-white p-6 md:p-12 shadow-soft min-h-[600px]">
                {children}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  );
}
