import { useState, useEffect } from 'react';
import { Archive, History, MapPin } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import { ProductService, getMediaUrl } from '../../services/api';

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState<'variants' | 'transactions'>('variants');
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [adjustForm, setAdjustForm] = useState({ quantity: 1, type: 'IN', notes: 'Correction d\'inventaire' });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const prodRes = await ProductService.getProducts();
      setProducts(prodRes || []);

      const txRes = await fetch('/api/erp/stock/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const txData = await txRes.json();
      setTransactions(txData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustModal = (variant: any) => {
    setSelectedVariant(variant);
    setAdjustForm({ quantity: 1, type: 'IN', notes: 'Correction d\'inventaire' });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erp/stock/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: Number(adjustForm.quantity),
          type: adjustForm.type,
          notes: adjustForm.notes
        })
      });
      if (res.ok) {
        setIsAdjustModalOpen(false);
        fetchInventoryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compile all variants into flat list for the table view
  const allVariants = products.flatMap(p => 
    (p.variants || []).map((v: any) => ({
      ...v,
      product: p,
      minStock: p.minStock || 0,
      location: p.location || 'Rayon inconnu'
    }))
  );

  const variantColumns = [
    {
      header: 'Produit',
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <img src={row.product.images?.[0]?.image ? getMediaUrl(row.product.images[0].image) : 'https://placehold.co/100'} alt={row.product.name} className="w-10 h-10 rounded object-cover" />
          <div>
            <div className="font-bold text-black text-sm">{row.product.name}</div>
            <div className="text-[10px] text-gray-500 font-mono">SKU: {row.sku || 'N/A'}</div>
          </div>
        </div>
      )
    },
    { header: 'Pointure', accessor: (row: any) => row.size?.value || '-' },
    { header: 'Couleur', accessor: (row: any) => row.color?.name || '-' },
    { 
      header: 'Stock Actuel', 
      accessor: (row: any) => (
        <span className={`font-black ${row.stock <= row.minStock ? 'text-red-600' : 'text-green-600'}`}>
          {row.stock} unités
        </span>
      )
    },
    { header: 'Alerte Min', accessor: (row: any) => `${row.minStock} unités` },
    { header: 'Emplacement', accessor: (row: any) => (
        <span className="flex items-center gap-1 text-gray-600 text-xs">
          <MapPin size={12} /> {row.location}
        </span>
      ) 
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => handleOpenAdjustModal(row)} className="px-3 py-1.5 bg-black text-white text-xs rounded-lg font-bold hover:bg-gray-800 transition-colors uppercase tracking-wider">
            Ajuster
          </button>
        </div>
      )
    }
  ];

  const transactionColumns = [
    { header: 'ID Mouv.', accessor: (row: any) => <span className="font-mono text-xs">#{row.id.substring(0, 8)}</span> },
    { header: 'Type', accessor: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${row.type === 'IN' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {row.type === 'IN' ? 'Entrée' : 'Sortie'}
        </span>
      ) 
    },
    { header: 'Quantité', accessor: (row: any) => <span className="font-bold">{row.quantity}</span> },
    { header: 'Référence / Notes', accessor: (row: any) => <span>{row.notes || row.reference || '-'}</span> },
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleString('fr-FR') }
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
            <Archive size={32} /> Contrôle des Stocks
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Valorisation du stock, alertes, corrections d'inventaire et mouvements</p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => setActiveTab(activeTab === 'variants' ? 'transactions' : 'variants')} className="px-5 py-3 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
            {activeTab === 'variants' ? <History size={16} /> : <Archive size={16} />}
            {activeTab === 'variants' ? 'Historique des Mouvements' : 'Voir l\'état des Stocks'}
          </button>
        </div>
      </div>

      {activeTab === 'variants' ? (
        <DataTable data={allVariants} columns={variantColumns} searchPlaceholder="Rechercher par SKU ou produit..." />
      ) : (
        <DataTable data={transactions} columns={transactionColumns} searchPlaceholder="Rechercher par référence..." />
      )}

      {/* Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8">
            <h2 className="text-lg font-bold mb-4">Ajuster le stock</h2>
            <p className="text-xs text-gray-500 mb-6 font-semibold uppercase tracking-wider">{selectedVariant?.product.name} (Tailles: {selectedVariant?.size?.value})</p>
            
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Type d'opération</label>
                <select value={adjustForm.type} onChange={e => setAdjustForm({...adjustForm, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" required>
                  <option value="IN">Entrée de stock (+)</option>
                  <option value="OUT">Sortie de stock (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Quantité</label>
                <input type="number" value={adjustForm.quantity} onChange={e => setAdjustForm({...adjustForm, quantity: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" required min={1} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Raison / Notes</label>
                <input type="text" value={adjustForm.notes} onChange={e => setAdjustForm({...adjustForm, notes: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="px-6 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 text-xs uppercase tracking-wider">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 text-xs uppercase tracking-wider">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
