import { useState, useEffect } from 'react';
import { Award, CheckCircle, Gift, Star } from 'lucide-react';
import { OrderService } from '../../services/api';

export default function LoyaltyView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await OrderService.getCustomerOrders();
      setOrders(data || []);
    } catch (e) {
      console.error('Failed to fetch personal orders for loyalty', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const purchasesCount = orders.length;
  const starsCount = Math.min(5, purchasesCount);
  const isVip = starsCount >= 5;

  return (
    <div className="font-sans max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
          <Award className="w-6 h-6 stroke-[1.5]" />
        </div>
        <div>
          <h2 className="text-xl font-serif tracking-wide text-black">Programme Fidélité SOLEY</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Accumulez des étoiles et débloquez vos privilèges</p>
        </div>
      </div>

      {/* Main Loyalty Card */}
      <div className="bg-black text-white p-8 rounded-3xl relative overflow-hidden shadow-xl mb-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/20">
              Statut : {isVip ? 'Membre VIP Gold' : 'Client Privilège'}
            </span>
            <h3 className="text-2xl font-serif mt-4 text-white">Votre niveau de fidélité</h3>
            
            {/* Stars rendering */}
            <div className="flex gap-2 mt-6">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star 
                  key={idx} 
                  className={`w-8 h-8 ${idx < starsCount ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} 
                />
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-wider">
              {purchasesCount} achat(s) enregistré(s)
            </p>
          </div>

          <div className="md:text-right flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Prochaine Étape</span>
            <p className="text-sm font-semibold text-gray-200 mt-1">
              {isVip 
                ? 'Félicitations ! Vous êtes au niveau maximum.' 
                : `${5 - purchasesCount} achat(s) restant(s) avant le niveau 5★`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <h4 className="text-sm font-bold uppercase tracking-widest text-black mb-6">Barème des récompenses</h4>
      <div className="space-y-4 mb-10">
        {[
          { level: '1★', purchases: '1er Achat', desc: 'Accès prioritaire aux lancements de nouvelles collections.', reached: purchasesCount >= 1 },
          { level: '2★', purchases: '2ème Achat', desc: 'Livraison express offerte sans minimum d\'achat.', reached: purchasesCount >= 2 },
          { level: '3★', purchases: '3ème Achat', desc: 'Invitations exclusives à nos ventes privées annuelles.', reached: purchasesCount >= 3 },
          { level: '4★', purchases: '4ème Achat', desc: 'Accès au service client prioritaire VIP WhatsApp.', reached: purchasesCount >= 4 },
          { level: '5★', purchases: '5ème Achat & +', desc: 'Une remise spéciale permanente de 15% avec le code promo.', reached: purchasesCount >= 5 },
        ].map((item, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${item.reached ? 'bg-white border-black/10 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full ${item.reached ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
              {item.level}
            </span>
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-black">{item.purchases}</span>
                {item.reached && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Card */}
      {isVip ? (
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-8 text-center">
          <Gift className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h4 className="text-lg font-serif text-amber-900 mb-1">Votre Récompense VIP</h4>
          <p className="text-xs text-amber-700 mb-6 font-medium">Copiez et utilisez ce code lors de votre prochain passage en caisse pour obtenir 15% de réduction !</p>
          
          <div className="bg-white px-8 py-3 rounded-full border border-amber-200 text-lg font-mono font-bold tracking-widest text-black inline-block shadow-sm select-all cursor-pointer">
            SOLEYSUPER5
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 text-center">
          <Gift className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800 mb-1">Récompense VIP verrouillée</h4>
          <p className="text-xs text-gray-500">Atteignez le niveau 5★ (5 achats ou plus) pour débloquer votre code de réduction exclusif de 15%.</p>
        </div>
      )}
    </div>
  );
}
