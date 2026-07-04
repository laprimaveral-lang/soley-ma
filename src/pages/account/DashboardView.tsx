import { Link } from 'react-router-dom';
import { Package, Heart, Star, ArrowRight } from 'lucide-react';

export default function DashboardView() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-6">Aperçu du compte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAFAF8] p-6 flex flex-col justify-between aspect-square group hover:bg-black transition-colors duration-500">
            <div className="text-black group-hover:text-white transition-colors duration-500">
              <Star className="w-8 h-8 stroke-1 mb-4" />
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Statut Fidélité</h3>
              <p className="text-2xl font-serif">Gold Member</p>
            </div>
            <p className="text-sm text-gray-500 group-hover:text-gray-400">1 250 points disponibles</p>
          </div>
          
          <div className="bg-[#FAFAF8] p-6 flex flex-col justify-between aspect-square group hover:bg-black transition-colors duration-500">
            <div className="text-black group-hover:text-white transition-colors duration-500">
              <Package className="w-8 h-8 stroke-1 mb-4" />
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Total Commandes</h3>
              <p className="text-2xl font-serif">14</p>
            </div>
            <Link to="/account/orders" className="text-xs font-bold tracking-widest uppercase text-black group-hover:text-white underline underline-offset-4 decoration-1 opacity-50 group-hover:opacity-100 transition-opacity">Voir l'historique</Link>
          </div>

          <div className="bg-[#FAFAF8] p-6 flex flex-col justify-between aspect-square group hover:bg-black transition-colors duration-500">
            <div className="text-black group-hover:text-white transition-colors duration-500">
              <Heart className="w-8 h-8 stroke-1 mb-4" />
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Wishlist</h3>
              <p className="text-2xl font-serif">6 Articles</p>
            </div>
            <Link to="/account/wishlist" className="text-xs font-bold tracking-widest uppercase text-black group-hover:text-white underline underline-offset-4 decoration-1 opacity-50 group-hover:opacity-100 transition-opacity">Voir la sélection</Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Récemment Consultés</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:opacity-50 transition-opacity">
            Voir plus <ArrowRight className="w-3 h-3 stroke-[2]" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* MOCK PRODUCTS */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-[#F5F5F0] mb-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs tracking-widest uppercase font-bold">Aperçu {item}</div>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-1">Modèle Élégance</h4>
              <p className="text-sm text-gray-500">850.00 dh</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
