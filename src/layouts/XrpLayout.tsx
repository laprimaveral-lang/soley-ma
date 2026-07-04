import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, Tag, FolderTree, Layers, Palette, Ruler, Archive, Image as ImageIcon } from 'lucide-react';

export default function XrpLayout() {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/xrp' && location.pathname.startsWith(path));
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
      isActive ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col hidden md:flex h-screen sticky top-0 overflow-y-auto">
        <h1 className="text-xl font-black tracking-widest uppercase mb-8">SOLEY<span className="text-primary">.ADMIN</span></h1>
        <nav className="flex flex-col gap-2 flex-grow">
          <Link to="/xrp" className={getLinkClass('/xrp')}><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/xrp/orders" className={getLinkClass('/xrp/orders')}><ShoppingBag size={20} /> Commandes</Link>
          <Link to="/xrp/products" className={getLinkClass('/xrp/products')}><Package size={20} /> Produits</Link>
          <Link to="/xrp/categories" className={getLinkClass('/xrp/categories')}><FolderTree size={20} /> Catégories</Link>
          <Link to="/xrp/collections" className={getLinkClass('/xrp/collections')}><Layers size={20} /> Collections</Link>
          <Link to="/xrp/colors" className={getLinkClass('/xrp/colors')}><Palette size={20} /> Couleurs</Link>
          <Link to="/xrp/sizes" className={getLinkClass('/xrp/sizes')}><Ruler size={20} /> Tailles</Link>
          <Link to="/xrp/inventory" className={getLinkClass('/xrp/inventory')}><Archive size={20} /> Stock</Link>
          <Link to="/xrp/customers" className={getLinkClass('/xrp/customers')}><Users size={20} /> Clients</Link>
          <Link to="/xrp/banners" className={getLinkClass('/xrp/banners')}><ImageIcon size={20} /> Bannières</Link>
          <Link to="/xrp/coupons" className={getLinkClass('/xrp/coupons')}><Tag size={20} /> Codes Promo</Link>
        </nav>
        <Link to="/xrp/settings" className={`mt-8 ${getLinkClass('/xrp/settings')}`}><Settings size={20} /> Paramètres</Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-gray-50/50">
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10">
           <div className="font-bold uppercase tracking-widest text-sm text-gray-400">Espace Administrateur</div>
           <div className="flex items-center gap-4">
             <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">A</span>
             <span className="font-bold text-sm">Admin</span>
           </div>
        </header>
        <div className="p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
