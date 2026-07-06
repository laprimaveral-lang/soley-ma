import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, logout, customer } = useCustomerAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections/all?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/90 border-b border-[#ECECEC] transition-all duration-300">
      <div className="bg-black text-white text-center py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase">
        OFFRE LIMITÉE : 2 ACHETÉS = LA 3ÈME GRATUITE
      </div>
      <div className="container mx-auto px-6 lg:px-12 py-4 flex justify-between items-center relative max-w-[1400px]">
        <Link to="/" className="flex-1 flex justify-start hover:opacity-70 transition-opacity">
          <img src="/logo.png?v=2" alt="Soley" className="h-32 md:h-36 w-auto object-contain" />
        </Link>
        <div className="flex justify-end items-center space-x-8 text-black">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="absolute inset-y-0 right-12 flex items-center bg-transparent z-10 w-full max-w-sm px-4">
              <input 
                type="text" 
                autoFocus
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-b border-black py-2 focus:outline-none bg-transparent text-sm tracking-widest"
              />
              <button type="submit" className="p-2"><Search className="stroke-1 w-5 h-5" /></button>
              <button type="button" onClick={() => setIsSearchOpen(false)} className="p-2"><X className="stroke-1 w-5 h-5" /></button>
            </form>
          ) : (
            <button type="button" onClick={() => setIsSearchOpen(true)} className="cursor-pointer hover:opacity-50 transition-opacity">
              <Search className="stroke-1 w-6 h-6" />
            </button>
          )}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false) /* just to close search if open */}
                className="flex items-center gap-2 hover:opacity-50 transition-opacity peer"
                title="Mon Compte"
              >
                <User className="stroke-1 w-6 h-6" />
              </button>
              
              {/* Dropdown Menu (visible on hover) */}
              <div className="absolute right-0 top-full mt-4 w-56 bg-white border border-[#ECECEC] shadow-xl rounded-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 mb-2">
                  <p className="text-xs text-gray-500">Connecté en tant que</p>
                  <p className="text-sm font-bold truncate">{customer?.name}</p>
                </div>
                
                {customer?.role === 'admin' ? (
                  <>
                    <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">🏠 Mon compte</Link>
                    <Link to="/xrp" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black font-semibold">⚙ Administration</Link>
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">🛍 Voir la boutique</Link>
                  </>
                ) : (
                  <>
                    <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">Mon compte</Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">Mes commandes</Link>
                    <Link to="/account/addresses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">Mes adresses</Link>
                    <Link to="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">Wishlist</Link>
                  </>
                )}
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    {customer?.role === 'admin' ? '🚪 Déconnexion' : 'Déconnexion'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:opacity-50 transition-opacity" title="Se connecter">
              <User className="stroke-1 w-6 h-6" />
            </Link>
          )}
          <Link to="/cart" className="relative group hover:opacity-50 transition-opacity">
            <ShoppingBag className="stroke-1 w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {useCart().totalItems}
            </span>
          </Link>
        </div>
      </div>
      <nav className="hidden md:block pb-5">
        <ul className="flex justify-center space-x-12 text-[11px] font-bold text-gray-900 tracking-[0.15em] uppercase">
          <li><Link to="/collections/nouveau" className="relative hover:text-black after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">NOUVEAUTÉS</Link></li>
          <li><Link to="/collections/sandales" className="relative hover:text-black after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">SANDALES</Link></li>
          <li><Link to="/collections/mules" className="relative hover:text-black after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">MULES</Link></li>
          <li><Link to="/collections/sabots" className="relative hover:text-black after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">SABOTS</Link></li>
          <li><Link to="/collections/mocassins" className="relative hover:text-black after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">MOCASSINS</Link></li>
          <li><Link to="/collections/slippers" className="relative hover:text-black after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">SLIPPERS</Link></li>
        </ul>
      </nav>
    </header>
  );
}
