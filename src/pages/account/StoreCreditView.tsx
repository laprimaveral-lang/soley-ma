import { Star, Gift, Ticket, Copy } from 'lucide-react';

export default function StoreCreditView() {
  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Programme de fidélité</h2>
      
      <div className="bg-black text-white p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Solde de points</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl md:text-5xl font-serif">1,250</span>
            <span className="text-sm pb-1">Points Soley</span>
          </div>
          <p className="text-sm text-gray-400 mt-4">Vous êtes au statut <strong className="text-white">Gold</strong>. Plus que 750 points pour atteindre le statut Platinum.</p>
        </div>
        <Star className="w-24 h-24 stroke-1 opacity-20 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Cartes Cadeaux actives</h3>
          <div className="border border-[#ECECEC] p-6 flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <Gift className="w-5 h-5 stroke-1" />
              <div>
                <p className="text-sm font-bold">500.00 dh</p>
                <p className="text-xs text-gray-400">Expire le 31 Déc 2026</p>
              </div>
            </div>
            <button className="text-[10px] font-bold tracking-widest uppercase hover:opacity-50 transition-opacity">
              Appliquer
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Bons de réduction</h3>
          <div className="border border-[#ECECEC] p-6 flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <Ticket className="w-5 h-5 stroke-1" />
              <div>
                <p className="text-sm font-bold">-15% sur la nouvelle collection</p>
                <p className="text-xs text-gray-400">Code: WELCOME15</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-black transition-colors" title="Copier le code">
              <Copy className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Parrainez un ami</h3>
        <div className="bg-[#FAFAF8] p-8 border border-[#ECECEC] text-center">
          <p className="text-sm font-bold mb-2">Offrez 10%, Recevez 100 dh</p>
          <p className="text-sm text-gray-500 mb-6">Partagez ce lien avec vos amis. Lorsqu'ils feront leur premier achat, vous recevrez tous les deux une récompense.</p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="text" 
              readOnly 
              value="https://soley.ma/ref/john-doe" 
              className="flex-1 border border-[#ECECEC] bg-white px-4 py-3 text-sm text-center outline-none"
            />
            <button className="bg-black text-white px-6 py-3 hover:bg-gray-900 transition-colors">
              <Copy className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
