import { useState, useEffect } from 'react';
import { Calculator, Download, FileText } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import { OrderService } from '../../services/api';

export default function AdminAccounting() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountingData();
  }, []);

  const fetchAccountingData = async () => {
    try {
      const ords = await OrderService.getOrders();
      setOrders(ords || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  
  // Calculate cost price and profit
  const totalCost = orders.reduce((sum, o) => {
    const cost = o.items?.reduce((itemSum: number, item: any) => {
      return itemSum + ((item.productVariant?.product?.costPrice || 0) * item.quantity);
    }, 0) || 0;
    return sum + cost;
  }, 0);

  const profitBrut = totalRevenue - totalCost;
  const tvaCollectee = totalRevenue * 0.20; // 20% standard VAT rate in Morocco
  const profitNet = profitBrut - tvaCollectee;

  const exportGeneralLedger = () => {
    // Generate CSV for accounting Grand Livre
    let csv = "Date,ID Commande,Client,Debit (Ventes MAD),Credit (Coût MAD),TVA (20% MAD),Bénéfice Net MAD\n";
    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('fr-FR');
      const orderCost = o.items?.reduce((sum: number, it: any) => sum + ((it.productVariant?.product?.costPrice || 0) * it.quantity), 0) || 0;
      const tva = o.total * 0.20;
      const net = o.total - orderCost - tva;
      csv += `"${dateStr}","#${o.id.substring(0,8)}","${o.customerName || 'Client'}",${o.total},${orderCost},${tva.toFixed(2)},${net.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grand_livre_comptable_soley.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const columns = [
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR') },
    { header: 'ID Pièce', accessor: (row: any) => <span className="font-mono text-xs">#{row.id.substring(0,8)}</span> },
    { header: 'Désignation', accessor: (row: any) => `Facture client - ${row.customerName || 'Client'}` },
    { header: 'Chiffre d\'Affaires', accessor: (row: any) => <span className="font-bold">{row.total.toLocaleString()} MAD</span> },
    { header: 'TVA (20%)', accessor: (row: any) => <span className="text-gray-500">{(row.total * 0.20).toFixed(2)} MAD</span> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide flex items-center gap-3">
            <Calculator size={32} /> Comptabilité & Finance
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Journaux comptables, déclaration de TVA standard (20%) et export du Grand Livre</p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={exportGeneralLedger} className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors text-xs uppercase tracking-wider shadow-sm">
            <Download size={16} /> Exporter Grand Livre (CSV)
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Chiffre d'Affaires Brut (HT+TVA)</p>
          <h3 className="text-2xl font-black text-black mt-2">{totalRevenue.toLocaleString()} MAD</h3>
          <span className="text-[10px] text-gray-500 font-semibold block mt-1">Sur {orders.length} factures émanant du shop</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Coût Total d'Achat du Stock Vendu</p>
          <h3 className="text-2xl font-black text-black mt-2">{totalCost.toLocaleString()} MAD</h3>
          <span className="text-[10px] text-gray-500 font-semibold block mt-1">Valorisé au prix de revient d'acquisition</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">TVA standard collectée (20%)</p>
          <h3 className="text-2xl font-black text-amber-600 mt-2">{tvaCollectee.toLocaleString()} MAD</h3>
          <span className="text-[10px] text-amber-700 font-semibold block mt-1">À déclarer au service des impôts</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Bénéfice Net Estimé</p>
          <h3 className="text-2xl font-black text-green-600 mt-2">{profitNet.toLocaleString()} MAD</h3>
          <span className="text-[10px] text-green-700 font-semibold block mt-1">Marge nette globale : {((profitNet / (totalRevenue || 1)) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText size={18} className="text-gray-400" />
          <h2 className="text-base font-bold uppercase tracking-wider text-black">Journal des Écritures de Ventes</h2>
        </div>
        <DataTable data={orders} columns={columns} searchPlaceholder="Rechercher une écriture..." />
      </div>
    </div>
  );
}
