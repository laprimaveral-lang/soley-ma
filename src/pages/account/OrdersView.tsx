import { useState, useEffect } from 'react';
import { OrderService } from '../../services/api';
import { Download, RefreshCw } from 'lucide-react';

export default function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getCustomerOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm font-bold tracking-widest uppercase text-gray-500">Chargement...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10">Historique des commandes</h2>
      
      {orders.length === 0 ? (
        <div className="bg-[#FAFAF8] p-12 text-center flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-6 font-bold tracking-widest uppercase">Aucune commande trouvée</p>
          <a href="/collections/all" className="inline-block bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors">
            Commencer vos achats
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="border border-[#ECECEC] p-6 lg:p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-[#ECECEC] pb-6 mb-6 gap-4">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase mb-1">Commande #{order.id.substring(0, 8)}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div className="flex flex-col md:items-end gap-2">
                  <p className="font-serif text-xl">{order.total}.00 dh</p>
                  <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'pending' ? 'En attente' : 
                     order.status === 'processing' ? 'En cours' : 
                     order.status === 'shipped' ? 'Expédiée' : 
                     order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                  </span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-20 h-24 bg-[#F5F5F0] overflow-hidden shrink-0">
                      {item.productVariant?.product?.images?.[0] ? (
                        <img src={`http://localhost:3001${item.productVariant.product.images[0].image}`} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">...</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold tracking-widest uppercase mb-1">{item.productVariant?.product?.name || 'Produit'}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.productVariant?.color?.name} / {item.productVariant?.size?.value}
                      </p>
                      <p className="text-sm">Qté: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{item.price}.00 dh</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-[#ECECEC]">
                <button className="flex items-center gap-2 px-6 py-3 border border-black text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
                  <Download className="w-4 h-4 stroke-[1.5]" /> Facture
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px] font-bold tracking-widest uppercase hover:opacity-70 transition-opacity">
                  <RefreshCw className="w-4 h-4 stroke-[1.5]" /> Recommander
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
