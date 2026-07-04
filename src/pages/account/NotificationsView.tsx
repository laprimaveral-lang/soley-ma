import { useState } from 'react';

export default function NotificationsView() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(false);
  const [promotions, setPromotions] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Préférences de communication</h2>
      
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold mb-1">Notifications par Email</h3>
            <p className="text-sm text-gray-500">Recevez des emails pour vos commandes et notre actualité.</p>
          </div>
          <button 
            onClick={() => setEmailNotifs(!emailNotifs)}
            className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifs ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${emailNotifs ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold mb-1">Notifications WhatsApp</h3>
            <p className="text-sm text-gray-500">Recevez des mises à jour rapides sur WhatsApp.</p>
          </div>
          <button 
            onClick={() => setWhatsappNotifs(!whatsappNotifs)}
            className={`w-12 h-6 rounded-full transition-colors relative ${whatsappNotifs ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${whatsappNotifs ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4 mt-16">Types de messages</h2>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold mb-1">Offres & Promotions</h3>
            <p className="text-sm text-gray-500">Ventes privées, nouvelles collections et remises exclusives.</p>
          </div>
          <button 
            onClick={() => setPromotions(!promotions)}
            className={`w-12 h-6 rounded-full transition-colors relative ${promotions ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${promotions ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold mb-1">Mises à jour de commande</h3>
            <p className="text-sm text-gray-500">Confirmation, expédition et suivi de livraison.</p>
          </div>
          <button 
            onClick={() => setOrderUpdates(!orderUpdates)}
            className={`w-12 h-6 rounded-full transition-colors relative ${orderUpdates ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${orderUpdates ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
