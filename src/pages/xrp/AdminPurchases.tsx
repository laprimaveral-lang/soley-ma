import { useState, useEffect } from 'react';
import { Truck, Plus, Check, Trash2 } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { ProductService } from '../../services/api';

export default function AdminPurchases() {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Modals & States
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'supplier' | 'order', id: string } | null>(null);

  // Forms
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', email: '', address: '', balance: 0 });
  const [orderForm, setOrderForm] = useState({
    supplierId: '', reference: '', items: [{ productId: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supRes = await fetch('/api/erp/suppliers', { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
      const suppliersData = await supRes.json();
      setSuppliers(suppliersData || []);

      const poRes = await fetch('/api/erp/purchases', { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } });
      const poData = await poRes.json();
      setPurchaseOrders(poData || []);

      const prodRes = await ProductService.getProducts();
      setProducts(prodRes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSupplierModal = (sup: any = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setSupplierForm({ name: sup.name, phone: sup.phone || '', email: sup.email || '', address: sup.address || '', balance: sup.balance || 0 });
    } else {
      setEditingSupplier(null);
      setSupplierForm({ name: '', phone: '', email: '', address: '', balance: 0 });
    }
    setIsSupplierModalOpen(true);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSupplier ? `/api/erp/suppliers/${editingSupplier.id}` : '/api/erp/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(supplierForm)
      });
      if (res.ok) {
        setIsSupplierModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/erp/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(orderForm)
      });
      if (res.ok) {
        setIsOrderModalOpen(false);
        setOrderForm({ supplierId: '', reference: '', items: [{ productId: '', quantity: 1, unitPrice: 0 }] });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/erp/purchases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const url = deleteConfirm.type === 'supplier' 
        ? `/api/erp/suppliers/${deleteConfirm.id}` 
        : `/api/erp/purchases/${deleteConfirm.id}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const supplierColumns = [
    { header: 'Fournisseur', accessor: (row: any) => <span className="font-bold text-black">{row.name}</span> },
    { header: 'Téléphone', accessor: (row: any) => row.phone || 'Non spécifié' },
    { header: 'Email', accessor: (row: any) => row.email || 'Non spécifié' },
    { header: 'Adresse', accessor: (row: any) => row.address || 'Non spécifié' },
    { header: 'Solde Dû', accessor: (row: any) => <span className="font-bold text-red-600">{row.balance} MAD</span> },
    { header: 'Actions', accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => handleOpenSupplierModal(row)} className="p-2 text-gray-400 hover:text-black rounded-lg transition-colors">
            Modifier
          </button>
          <button type="button" onClick={() => setDeleteConfirm({ type: 'supplier', id: row.id })} className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors">
            Supprimer
          </button>
        </div>
      )
    }
  ];

  const orderColumns = [
    { header: 'Référence PO', accessor: (row: any) => <span className="font-mono font-bold">#{row.reference}</span> },
    { header: 'Fournisseur', accessor: (row: any) => row.supplier?.name || 'Inconnu' },
    { header: 'Montant Total', accessor: (row: any) => <span className="font-bold">{row.totalAmount} MAD</span> },
    { header: 'Date', accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR') },
    { header: 'Statut', accessor: (row: any) => {
        const statusColors: any = {
          draft: 'bg-gray-100 text-gray-700',
          ordered: 'bg-blue-100 text-blue-700',
          received: 'bg-green-100 text-green-700',
        };
        const statusText: any = {
          draft: 'Brouillon',
          ordered: 'Commandé',
          received: 'Reçu (Stock incrémenté)',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}>
            {statusText[row.status] || row.status}
          </span>
        );
      }
    },
    { header: 'Actions', accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          {row.status === 'ordered' && (
            <button type="button" onClick={() => updateOrderStatus(row.id, 'received')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
              <Check size={14} /> Réceptionner
            </button>
          )}
          {row.status === 'draft' && (
            <button type="button" onClick={() => updateOrderStatus(row.id, 'ordered')} className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800">
              Commander
            </button>
          )}
          <button type="button" onClick={() => setDeleteConfirm({ type: 'order', id: row.id })} className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide flex items-center gap-3">
            <Truck size={32} /> Achats & Fournisseurs
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Gérez l'approvisionnement, les fournisseurs et les réceptions de stock</p>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => setActiveTab(activeTab === 'orders' ? 'suppliers' : 'orders')} className="px-5 py-3 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50">
            {activeTab === 'orders' ? 'Voir Fournisseurs' : 'Voir Commandes'}
          </button>
          {activeTab === 'orders' ? (
            <button type="button" onClick={() => setIsOrderModalOpen(true)} className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors text-xs uppercase tracking-wider">
              <Plus size={16} /> Nouvelle Commande
            </button>
          ) : (
            <button type="button" onClick={() => handleOpenSupplierModal()} className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors text-xs uppercase tracking-wider">
              <Plus size={16} /> Ajouter Fournisseur
            </button>
          )}
        </div>
      </div>

      {activeTab === 'orders' ? (
        <DataTable data={purchaseOrders} columns={orderColumns} searchPlaceholder="Rechercher par référence..." />
      ) : (
        <DataTable data={suppliers} columns={supplierColumns} searchPlaceholder="Rechercher par nom..." />
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-6">{editingSupplier ? 'Modifier le fournisseur' : 'Nouveau Fournisseur'}</h2>
            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Nom de l'entreprise</label>
                <input type="text" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Téléphone</label>
                <input type="text" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Adresse Email</label>
                <input type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Adresse postale</label>
                <input type="text" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-6 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 text-xs uppercase tracking-wider">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 text-xs uppercase tracking-wider">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Créer une commande d'achat</h2>
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Fournisseur</label>
                  <select value={orderForm.supplierId} onChange={e => setOrderForm({...orderForm, supplierId: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" required>
                    <option value="">Sélectionner...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Référence de Commande</label>
                  <input type="text" value={orderForm.reference} onChange={e => setOrderForm({...orderForm, reference: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none" placeholder="Ex: PO-2026-001" required />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Articles à commander</label>
                  <button type="button" onClick={() => setOrderForm({...orderForm, items: [...orderForm.items, { productId: '', quantity: 1, unitPrice: 0 }]})} className="text-xs font-bold text-black border-b border-black pb-0.5">
                    + Ajouter produit
                  </button>
                </div>

                <div className="space-y-3">
                  {orderForm.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-6">
                        <select value={it.productId} onChange={e => {
                            const newItems = [...orderForm.items];
                            newItems[idx].productId = e.target.value;
                            setOrderForm({...orderForm, items: newItems});
                          }} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-black focus:outline-none" required>
                          <option value="">Produit...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>)}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input type="number" placeholder="Qté" value={it.quantity} onChange={e => {
                            const newItems = [...orderForm.items];
                            newItems[idx].quantity = Number(e.target.value);
                            setOrderForm({...orderForm, items: newItems});
                          }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black focus:outline-none" required min={1} />
                      </div>
                      <div className="col-span-3">
                        <input type="number" placeholder="P. Unit" value={it.unitPrice} onChange={e => {
                            const newItems = [...orderForm.items];
                            newItems[idx].unitPrice = Number(e.target.value);
                            setOrderForm({...orderForm, items: newItems});
                          }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black focus:outline-none" required />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-6 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 text-xs uppercase tracking-wider">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 text-xs uppercase tracking-wider">Créer Commande</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteConfirm}
        title="Supprimer l'élément"
        message="Êtes-vous sûr de vouloir supprimer définitivement cet élément ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
