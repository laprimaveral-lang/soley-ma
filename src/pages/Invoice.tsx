import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OrderService } from '../services/api';
import { Printer, ChevronLeft } from 'lucide-react';

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      OrderService.getOrderById(id)
        .then(res => {
          setOrder(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 font-sans text-xs uppercase tracking-widest text-gray-400">Chargement de la facture...</div>;
  }

  if (!order) {
    return <div className="text-center py-20 font-sans text-xs uppercase tracking-widest text-red-500">Facture introuvable.</div>;
  }

  return (
    <div className="bg-white min-h-screen p-6 md:p-12 font-sans text-gray-800 max-w-[800px] mx-auto">
      {/* Print Button */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 print:hidden">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-black transition-colors text-gray-500"
        >
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white text-xs font-bold tracking-widest uppercase px-4 py-2.5 transition-colors"
        >
          <Printer className="w-4 h-4" /> Imprimer la facture
        </button>
      </div>

      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-2xl font-serif text-black uppercase tracking-widest mb-1">SOLEY.MA</h1>
          <p className="text-xs text-gray-400 font-light">Chaussures Femme Premium</p>
          <p className="text-[10px] text-gray-400 font-light">Casablanca, Maroc</p>
          <p className="text-[10px] text-gray-400 font-light">Contact: admin@soley.ma</p>
        </div>
        <div className="text-right">
          <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-2">FACTURE</h2>
          <p className="text-xs text-gray-600 font-medium">Facture #: <span className="text-black font-bold">SOLEY-{order.id.substring(0, 8).toUpperCase()}</span></p>
          <p className="text-[10px] text-gray-400 mt-1">Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
          <p className="text-[10px] text-gray-400">Statut de paiement: <span className="text-black font-bold uppercase">{order.status === 'delivered' ? 'Payé' : 'À la livraison'}</span></p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-8 mb-12 py-6 border-y border-gray-100">
        <div>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Facturé à :</h3>
          <p className="text-xs font-bold text-black mb-1">{order.customerName}</p>
          <p className="text-xs text-gray-500 font-light leading-relaxed">{order.shippingAddress}</p>
          <p className="text-xs text-gray-500 font-light mt-1">Tél: {order.customerPhone}</p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Détails de livraison :</h3>
          <p className="text-xs text-gray-600">Statut: <span className="text-black font-bold uppercase">{order.shippingStatus || 'En préparation'}</span></p>
          {order.carrier && (
            <p className="text-xs text-gray-600 mt-1">Transporteur: <span className="text-black font-bold">{order.carrier}</span></p>
          )}
          {order.trackingCode && (
            <p className="text-xs text-gray-600">N° Suivi: <span className="text-black font-bold">{order.trackingCode}</span></p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-12">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 text-[10px] font-bold tracking-widest uppercase text-gray-400 w-2/3">Article</th>
            <th className="py-3 text-[10px] font-bold tracking-widest uppercase text-gray-400 text-center">Quantité</th>
            <th className="py-3 text-[10px] font-bold tracking-widest uppercase text-gray-400 text-right">Prix Unit.</th>
            <th className="py-3 text-[10px] font-bold tracking-widest uppercase text-gray-400 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order.items?.map((item: any) => {
            const variant = item.productVariant;
            const productObj = variant?.product;
            const descStr = [
              variant?.color?.name,
              variant?.size?.value ? `Pointure: ${variant.size.value}` : null
            ].filter(Boolean).join(' | ');

            return (
              <tr key={item.id} className="text-xs text-black">
                <td className="py-4">
                  <div className="font-bold">{productObj?.name || 'Chaussure Soley'}</div>
                  {descStr && <div className="text-[10px] text-gray-400 font-light mt-0.5">{descStr}</div>}
                </td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">{item.price} MAD</td>
                <td className="py-4 text-right font-bold">{item.price * item.quantity} MAD</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Total Calculations */}
      <div className="flex justify-end mb-16">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Sous-total :</span>
            <span>{order.subtotal} MAD</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Remise :</span>
              <span>-{order.discount} MAD</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500 pb-2 border-b border-gray-100">
            <span>Livraison :</span>
            <span>{order.shipping > 0 ? `${order.shipping} MAD` : 'Gratuit'}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-black pt-1">
            <span>Total :</span>
            <span>{order.total} MAD</span>
          </div>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center text-[10px] text-gray-400 font-light border-t border-gray-100 pt-8">
        <p className="mb-1">Merci de votre confiance et de votre achat sur Soley.ma</p>
        <p>Pour toute réclamation, contactez-nous sous 7 jours à admin@soley.ma</p>
      </div>
    </div>
  );
}
