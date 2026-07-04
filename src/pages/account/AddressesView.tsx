import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AddressesView() {
  return (
    <div>
      <div className="flex justify-between items-center mb-10 border-b border-[#ECECEC] pb-4">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Mes Adresses</h2>
        <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:opacity-50 transition-opacity">
          <Plus className="w-4 h-4 stroke-[2]" /> Nouvelle adresse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mock Address 1 */}
        <div className="border border-[#ECECEC] p-6 relative group">
          <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors rounded">
              <Edit2 className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors rounded">
              <Trash2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 stroke-1" />
            <h3 className="text-xs font-bold tracking-widest uppercase">Adresse de facturation (Défaut)</h3>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-bold text-black">John Doe</p>
            <p>123 Avenue Mohammed V</p>
            <p>Appartement 12, Étage 3</p>
            <p>Casablanca, 20000</p>
            <p>Maroc</p>
            <p className="pt-2 text-gray-400">+212 6 00 00 00 00</p>
          </div>
        </div>

        {/* Mock Address 2 */}
        <div className="border border-[#ECECEC] p-6 relative group">
          <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors rounded">
              <Edit2 className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors rounded">
              <Trash2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 stroke-1" />
            <h3 className="text-xs font-bold tracking-widest uppercase">Adresse de livraison</h3>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-bold text-black">John Doe</p>
            <p>Villa 45, Quartier des Princes</p>
            <p>Route de Zaer</p>
            <p>Rabat, 10000</p>
            <p>Maroc</p>
            <p className="pt-2 text-gray-400">+212 6 11 11 11 11</p>
          </div>
          
          <button className="mt-6 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-black underline underline-offset-4 decoration-1 transition-colors">
            Définir par défaut
          </button>
        </div>
      </div>
    </div>
  );
}
