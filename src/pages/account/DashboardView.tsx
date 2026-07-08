import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, Star, ArrowRight } from 'lucide-react';
import { OrderService, WishlistService } from '../../services/api';

export default function DashboardView() {
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch real orders count
    OrderService.getCustomerOrders()
      .then((orders: any[]) => setOrdersCount(orders.length))
      .catch(() => setOrdersCount(0));

    // Fetch real wishlist count
    WishlistService.getWishlist()
      .then((items: any[]) => setWishlistCount(items.length))
      .catch(() => setWishlistCount(0));
  }, []);

  // Compute loyalty status based on actual order count
  const getLoyaltyStatus = (count: number | null) => {
    if (count === null) return { label: '...', points: '...' };
    if (count === 0) return { label: 'Nouveau membre', points: '0 point' };
    if (count === 1) return { label: '⭐ Membre Bronze', points: `${count * 50} points` };
    if (count === 2) return { label: '⭐⭐ Membre Argent', points: `${count * 50} points` };
    if (count === 3) return { label: '⭐⭐⭐ Membre Or', points: `${count * 50} points` };
    if (count === 4) return { label: '⭐⭐⭐⭐ Membre Platine', points: `${count * 50} points` };
    return { label: '⭐⭐⭐⭐⭐ Membre VIP', points: `${count * 50} points` };
  };

  const loyalty = getLoyaltyStatus(ordersCount);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-6">Aperçu du compte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Loyalty */}
          <div className="bg-[#FAFAF8] p-6 flex flex-col justify-between aspect-square group hover:bg-black transition-colors duration-500">
            <div className="text-black group-hover:text-white transition-colors duration-500">
              <Star className="w-8 h-8 stroke-1 mb-4" />
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Statut Fidélité</h3>
              <p className="text-2xl font-serif">{loyalty.label}</p>
            </div>
            <p className="text-sm text-gray-500 group-hover:text-gray-400">{loyalty.points} disponibles</p>
          </div>

          {/* Orders */}
          <div className="bg-[#FAFAF8] p-6 flex flex-col justify-between aspect-square group hover:bg-black transition-colors duration-500">
            <div className="text-black group-hover:text-white transition-colors duration-500">
              <Package className="w-8 h-8 stroke-1 mb-4" />
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Total Commandes</h3>
              <p className="text-2xl font-serif">
                {ordersCount === null ? (
                  <span className="text-gray-300 animate-pulse">...</span>
                ) : ordersCount}
              </p>
            </div>
            <Link
              to="/account/orders"
              className="text-xs font-bold tracking-widest uppercase text-black group-hover:text-white underline underline-offset-4 decoration-1 opacity-50 group-hover:opacity-100 transition-opacity"
            >
              Voir l'historique
            </Link>
          </div>

          {/* Wishlist */}
          <div className="bg-[#FAFAF8] p-6 flex flex-col justify-between aspect-square group hover:bg-black transition-colors duration-500">
            <div className="text-black group-hover:text-white transition-colors duration-500">
              <Heart className="w-8 h-8 stroke-1 mb-4" />
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Wishlist</h3>
              <p className="text-2xl font-serif">
                {wishlistCount === null ? (
                  <span className="text-gray-300 animate-pulse">...</span>
                ) : (
                  `${wishlistCount} Article${wishlistCount !== 1 ? 's' : ''}`
                )}
              </p>
            </div>
            <Link
              to="/account/wishlist"
              className="text-xs font-bold tracking-widest uppercase text-black group-hover:text-white underline underline-offset-4 decoration-1 opacity-50 group-hover:opacity-100 transition-opacity"
            >
              Voir la sélection
            </Link>
          </div>

        </div>
      </div>

      {/* Recently viewed - placeholder (needs browsing history feature) */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Récemment Consultés</h2>
          <Link to="/collections/all" className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:opacity-50 transition-opacity">
            Voir plus <ArrowRight className="w-3 h-3 stroke-[2]" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Link to="/collections/all" key={item} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-[#F5F5F0] mb-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs tracking-widest uppercase font-bold">Aperçu {item}</div>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-1">Explorer</h4>
              <p className="text-sm text-gray-500">Voir la collection →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
