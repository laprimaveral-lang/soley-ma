import { useState, useEffect } from 'react';
import { ShoppingBag, Users, DollarSign } from 'lucide-react';
import { OrderService, CustomerService } from '../../services/api';
import DataTable from '../../components/xrp/DataTable';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ord, cust] = await Promise.all([
      OrderService.getOrders(),
      CustomerService.getCustomers()
    ]);
    setOrders(ord);
    setCustomers(cust);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const columns = [
    { header: 'ID Commande', accessor: (row: any) => <span className="font-mono text-sm font-bold">#{row.id.substring(0, 8)}</span> },
    { header: 'Client', accessor: (row: any) => row.customer?.name || 'Inconnu' },
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR') },
    { header: 'Total', accessor: (row: any) => <span className="font-bold">{row.total} MAD</span> },
    { header: 'Statut', accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">Revenus Globaux</p>
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6">Dernières Commandes</h2>
        <DataTable data={orders.slice(0, 5)} columns={columns} searchable={false} />
      </div>
    </div>
  );
}
