import { useState, useEffect } from 'react';
import { Truck, Printer, ClipboardList } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import { OrderService } from '../../services/api';

export default function AdminLogistics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await OrderService.getOrders();
      // Filter orders that need preparation (pending, processing)
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintLabel = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Étiquette d'expédition - #${order.id.substring(0, 8)}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
            .label-box { border: 3px solid black; padding: 20px; max-width: 400px; margin: 0 auto; }
            .barcode { font-size: 40px; font-weight: bold; letter-spacing: 10px; margin: 20px 0; }
            .info { text-align: left; font-size: 14px; line-height: 1.6; }
            .divider { border-top: 2px dashed black; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <h2>SOLEY EXPRESS LOGISTICS</h2>
            <div class="barcode">*${order.id.substring(0, 8).toUpperCase()}*</div>
            <div class="divider"></div>
            <div class="info">
              <strong>DESTINATAIRE:</strong><br/>
              ${order.customerName || order.customer?.name || 'Client'}<br/>
              Tél: ${order.customerPhone || 'Non spécifié'}<br/>
              Adresse: ${order.shippingAddress || 'Non spécifiée'}<br/>
              <br/>
              <strong>COLIS:</strong> #${order.id.substring(0, 8)}<br/>
              <strong>TRANSPORT:</strong> Amana Express<br/>
              <strong>MODE:</strong> COD (Paiement à la livraison)
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    { header: 'ID Commande', accessor: (row: any) => <span className="font-mono text-xs font-bold">#{row.id.substring(0, 8)}</span> },
    { header: 'Destinataire', accessor: (row: any) => <span>{row.customerName || row.customer?.name || 'Inconnu'}</span> },
    { header: 'Téléphone', accessor: (row: any) => <span>{row.customerPhone || '-'}</span> },
    { header: 'Adresse de livraison', accessor: (row: any) => <span className="text-xs max-w-[200px] truncate block">{row.shippingAddress || '-'}</span> },
    { header: 'Préparation', accessor: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {row.status === 'pending' ? 'À préparer (Picking)' : 'Prêt pour expédition'}
        </span>
      )
    },
    { header: 'Actions', accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => handlePrintLabel(row)} className="flex items-center gap-1 px-3 py-1.5 border border-black text-black rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors uppercase tracking-wider">
            <Printer size={12} /> Imprimer Étiquette
          </button>
        </div>
      )
    }
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
            <Truck size={32} /> Logistique & Préparation
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Picking list, impression d'étiquettes d'expédition et suivi de transporteurs</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList size={18} className="text-gray-400" />
          <h2 className="text-base font-bold uppercase tracking-wider text-black">Picking list des commandes en attente d'expédition</h2>
        </div>
        <DataTable data={orders} columns={columns} searchPlaceholder="Rechercher par ID ou destinataire..." />
      </div>
    </div>
  );
}
