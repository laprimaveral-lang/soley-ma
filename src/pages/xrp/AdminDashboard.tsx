import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Clock, MapPin, CreditCard } from 'lucide-react';
import { OrderService } from '../../services/api';
import DataTable from '../../components/xrp/DataTable';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchERPStats();
  }, []);

  const fetchERPStats = async () => {
    try {
      const res = await fetch('/api/erp/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await res.json();
      setStats(data);
      
      const ords = await OrderService.getOrders();
      setOrders(ords || []);
    } catch (e) {
      console.error('Failed to load ERP stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  const columns = [
    { header: 'ID Commande', accessor: (row: any) => <span className="font-mono text-xs font-bold">#{row.id.substring(0, 8)}</span> },
    { header: 'Client', accessor: (row: any) => row.customerName || row.customer?.name || 'Inconnu' },
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR') },
    { header: 'Total', accessor: (row: any) => <span className="font-extrabold text-black">{row.total} MAD</span> },
    { header: 'Statut', accessor: (row: any) => {
        const statusColors: any = {
          pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          processing: 'bg-blue-50 text-blue-700 border-blue-200',
          shipped: 'bg-purple-50 text-purple-700 border-purple-200',
          delivered: 'bg-green-50 text-green-700 border-green-200',
          cancelled: 'bg-red-50 text-red-700 border-red-200',
        };
        const statusText: any = {
          pending: 'En attente',
          processing: 'En cours',
          shipped: 'Expédiée',
          delivered: 'Livrée',
          cancelled: 'Annulée',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}>
            {statusText[row.status] || row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide">ERP Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Statistiques globales & indicateurs financiers en temps réel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchERPStats} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors uppercase tracking-wider shadow-sm">
            Actualiser
          </button>
        </div>
      </div>

      {/* Main KPI Figures */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Chiffre d'Affaires Aujourd'hui</p>
              <h3 className="text-2xl font-black text-black">{stats.caToday.toLocaleString()} DH</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">CA Cette Semaine</p>
              <h3 className="text-2xl font-black text-black">{stats.caWeek.toLocaleString()} DH</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">CA Ce Mois</p>
              <h3 className="text-2xl font-black text-black">{stats.caMonth.toLocaleString()} DH</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">CA Cette Année</p>
              <h3 className="text-2xl font-black text-black">{stats.caYear.toLocaleString()} DH</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Stock & Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Commandes en cours / Total</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-black">{stats.pendingOrders}</span>
            <span className="text-xs text-gray-400 font-bold">/ {stats.ordersCount} total</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-amber-400 h-full" style={{ width: `${(stats.pendingOrders / (stats.ordersCount || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Valeur Achat du Stock (CMP)</p>
          <h3 className="text-2xl font-black text-black mt-2">{stats.stockValueCost.toLocaleString()} DH</h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-2">Coût moyen d'acquisition</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Valeur Vente Estimée</p>
          <h3 className="text-2xl font-black text-black mt-2">{stats.stockValueRetail.toLocaleString()} DH</h3>
          <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mt-2">
            Marge potentielle : {((stats.stockValueRetail - stats.stockValueCost) / (stats.stockValueRetail || 1) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Alertes Ruptures / Stock Faible</p>
          <div className="flex gap-4 mt-2">
            <div>
              <span className="text-2xl font-black text-red-600">{stats.stockRupture}</span>
              <span className="block text-[8px] text-gray-400 font-extrabold uppercase">Ruptures</span>
            </div>
            <div className="border-l border-gray-100 pl-4">
              <span className="text-2xl font-black text-amber-500">{stats.stockLow}</span>
              <span className="block text-[8px] text-gray-400 font-extrabold uppercase">Alerte min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs / Charts simulator with clean Tailwind visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sales by City */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-black flex items-center gap-2">
            <MapPin size={16} /> Ventes par Villes (Volume)
          </h4>
          <div className="space-y-4">
            {Object.entries(stats.cities).map(([city, val]: any) => (
              <div key={city}>
                <div className="flex justify-between text-xs font-bold text-gray-800 mb-1.5">
                  <span>{city}</span>
                  <span>{val.toLocaleString()} DH</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-black h-full rounded-full" style={{ width: `${Math.min(100, (Number(val) / (Object.values(stats.cities).reduce((a: number, b: any) => a + Number(b), 0) || 1)) * 100)}%` }}></div>
                </div>
              </div>
            ))}
            {Object.keys(stats.cities).length === 0 && (
              <p className="text-xs text-gray-400 italic">Aucune commande validée pour le moment.</p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-black flex items-center gap-2">
            <CreditCard size={16} /> Répartition des modes de règlement
          </h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-800 mb-1.5">
                <span>Paiement à la livraison (COD)</span>
                <span>{stats.paymentMethods.COD.toLocaleString()} DH (100%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-800 mb-1.5 opacity-40">
                <span>Carte bancaire en ligne (Direct/CMI)</span>
                <span>0 DH (0%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-black">Dernières Commandes Client</h2>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-500">{orders.slice(0, 5).length} affichées</span>
        </div>
        <DataTable data={orders.slice(0, 5)} columns={columns} searchable={false} />
      </div>
    </div>
  );
}
