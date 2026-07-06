import { useState, useEffect } from 'react';
import { OrderService, getMediaUrl } from '../../services/api';
import { Download, RefreshCw } from 'lucide-react';

export default function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getCustomerOrders()
      .then((res: any) => {
        setOrders(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Mes Commandes</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 tracking-wider">Vous n'avez pas encore passé de commande.</p>
      ) : (
        <div className="space-y-12">
          {orders.map((order: any) => (
            <div key={order.id} className="border border-[#ECECEC] p-6 bg-white">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#ECECEC] pb-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Commande</p>
                  <p className="text-sm font-semibold">#{order.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Date</p>
                  <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Total</p>
                  <p className="text-sm font-semibold text-primary">{order.total.toFixed(2)} MAD</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Statut</p>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
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
                        <img src={getMediaUrl(item.productVariant.product.images[0].image)} alt="Product" className="w-full h-full object-cover" />
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
