import { Trash2, ShoppingBag } from 'lucide-react';

export default function WishlistView() {
  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Ma Wishlist (6)</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {/* Mock Wishlist Items */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="group flex flex-col">
            <div className="relative aspect-[4/5] bg-[#F5F5F0] mb-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs tracking-widest uppercase font-bold">Produit {item}</div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
                <button className="bg-white text-black p-3 hover:bg-black hover:text-white transition-colors" title="Ajouter au panier">
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                </button>
                <button className="bg-white text-red-500 p-3 hover:bg-red-500 hover:text-white transition-colors" title="Retirer">
                  <Trash2 className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col flex-1">
              <h3 className="text-xs font-bold tracking-widest uppercase mb-1">Mocassin Suede</h3>
              <p className="text-sm text-gray-500 mb-3">Beige / 42</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#ECECEC]">
                <p className="font-serif text-lg">950.00 dh</p>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${item % 3 === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {item % 3 === 0 ? 'Épuisé' : 'En stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
