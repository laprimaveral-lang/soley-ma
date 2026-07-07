import { useState, useEffect } from 'react';
import { ShoppingBag, Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { OrderService, CustomerService, ProductService } from '../../services/api';
import DataTable from '../../components/xrp/DataTable';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ord, cust, prods] = await Promise.all([
      OrderService.getOrders(),
      CustomerService.getCustomers(),
      ProductService.getProducts()
    ]);
    setOrders(ord);
    setCustomers(cust);
    setProducts(prods);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Net Profit Calculation
  const totalCost = orders.reduce((sum, o) => {
    const orderCost = o.items?.reduce((itemSum: number, item: any) => {
      // If variant has costPrice from product
      const cost = item.productVariant?.product?.costPrice || 0;
      return itemSum + (cost * item.quantity);
    }, 0) || 0;
    return sum + orderCost;
  }, 0);
  
  const netProfit = totalRevenue - totalCost;

  // Stock Threshold Alerts (< 5 units)
  const lowStockItems = products.filter(p => {
    // Check if total product stock is low
    if (p.stock < 5) return true;
    // Or if any variant stock is low
    return p.variants?.some((v: any) => v.stock < 5);
  });

  const columns = [
    { header: 'ID Commande', accessor: (row: any) => <span className="font-mono text-sm font-bold">#{row.id.substring(0, 8)}</span> },
    { header: 'Client', accessor: (row: any) => row.customerName || row.customer?.name || 'Inconnu' },
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR') },
    { header: 'Total', accessor: (row: any) => <span className="font-bold">{row.total} MAD</span> },
    { header: 'Statut', accessor: (row: any) => {
        const statusColors: any = {
          pending: 'bg-yellow-100 text-yellow-700',
          processing: 'bg-blue-100 text-blue-700',
          shipped: 'bg-purple-100 text-purple-700',
          delivered: 'bg-green-100 text-green-700',
          cancelled: 'bg-red-100 text-red-700',
        };
        const statusText: any = {
          pending: 'En attente',
          processing: 'En cours',
          shipped: 'Expédiée',
          delivered: 'Livrée',
          cancelled: 'Annulée',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}>
            {statusText[row.status] || row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-sans">Tableau de bord</h1>
      
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 font-sans">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">Chiffre d'Affaires</p>
              <h3 className="text-3xl font-black">{totalRevenue.toLocaleString()} DH</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">Bénéfice Net estimé</p>
              <h3 className="text-3xl font-black text-green-600">{netProfit.toLocaleString()} DH</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-700 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">Commandes</p>
              <h3 className="text-3xl font-black">{orders.length}</h3>
            </div>
            <div className="p-3 bg-black text-white rounded-xl shadow-lg">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">Clients</p>
              <h3 className="text-3xl font-black">{customers.length}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-100 text-red-800 rounded-2xl p-6 mb-8 font-sans">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" />
            <h3 className="text-base font-bold uppercase tracking-wider">Alertes de Stock Faible (&lt; 5 unités)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStockItems.slice(0, 6).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-gray-900 block truncate max-w-[150px]">{p.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono block">Ref: {p.reference}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-red-600">{p.stock} unités</span>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">En Stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 font-sans">
        <h2 className="text-xl font-bold mb-6">Dernières Commandes</h2>
        <DataTable data={orders.slice(0, 5)} columns={columns} searchable={false} />
      </div>
    </div>
  );
}
