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
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-[#ECECEC] transition-all duration-300">
      {/* Main header navbar */}
      <div className="container mx-auto px-6 lg:px-12 py-3 flex justify-between items-center relative max-w-[1400px]">
        {/* Left: Menu */}
        <nav className="hidden md:flex flex-1 justify-start">
          <ul className="flex items-center space-x-8 text-[10px] font-bold text-gray-900 tracking-[0.2em] uppercase">
            <li>
              <Link to="/collections/nouveau" className="relative py-2 group">
                NOUVEAUTÉS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/collections/sandales" className="relative py-2 group">
                SANDALES
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/collections/mules" className="relative py-2 group">
                MULES
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/collections/sabots" className="relative py-2 group">
                SABOTS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/collections/mocassins" className="relative py-2 group">
                MOCASSINS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/collections/slippers" className="relative py-2 group">
                SLIPPERS
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Center: Logo */}
        <div className="flex-grow md:flex-none flex justify-center items-center">
          <Link to="/" className="flex-shrink-0 hover:opacity-75 transition-opacity py-1">
            <img src="/logo.png?v=3" alt="Soley" className="h-20 md:h-24 w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>
        
        {/* Right: Icons */}
        <div className="flex-1 flex justify-end items-center space-x-6 md:space-x-8 text-black">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="absolute inset-y-0 right-12 flex items-center bg-transparent z-10 w-full max-w-xs px-4">
              <input 
                type="text" 
                autoFocus
                placeholder="RECHERCHER..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-b border-black py-1 focus:outline-none bg-transparent text-[10px] font-bold tracking-[0.2em] placeholder-gray-400 uppercase"
              />
              <button type="submit" className="p-2"><Search className="stroke-1 w-4 h-4" /></button>
              <button type="button" onClick={() => setIsSearchOpen(false)} className="p-2"><X className="stroke-1 w-4 h-4" /></button>
            </form>
          ) : (
            <button type="button" onClick={() => setIsSearchOpen(true)} className="cursor-pointer hover:opacity-50 transition-opacity" title="Rechercher">
              <Search className="stroke-1 w-5.5 h-5.5" />
            </button>
          )}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                type="button"
                className="flex items-center gap-2 hover:opacity-50 transition-opacity peer"
                title="Mon Compte"
              >
                <User className="stroke-1 w-5.5 h-5.5" />
              </button>
              
              <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-[#ECECEC] shadow-xl rounded-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all duration-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 mb-2">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Connecté en tant que</p>
                  <p className="text-xs font-bold truncate text-black">{customer?.name}</p>
                </div>
                
                {customer?.role === 'admin' ? (
                  <>
                    <Link to="/account" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black">🏠 Mon compte</Link>
                    <Link to="/xrp" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black font-semibold">⚙ Administration</Link>
                    <Link to="/" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black">🛍 Voir la boutique</Link>
                  </>
                ) : (
                  <>
                    <Link to="/account" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black">Mon compte</Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black">Mes commandes</Link>
                    <Link to="/account/addresses" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black">Mes adresses</Link>
                    <Link to="/account/wishlist" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-black">Wishlist</Link>
                  </>
                )}
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button 
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:opacity-50 transition-opacity" title="Se connecter">
              <User className="stroke-1 w-5.5 h-5.5" />
            </Link>
          )}
          <Link to="/cart" className="relative group hover:opacity-50 transition-opacity">
            <ShoppingBag className="stroke-1 w-5.5 h-5.5" />
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {useCart().totalItems}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
