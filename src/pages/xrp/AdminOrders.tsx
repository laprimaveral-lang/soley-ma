import { useState, useEffect } from 'react';
import { ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { OrderService } from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ status: 'pending' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const data = await OrderService.getOrders();
    setOrders(data);
  };

  const handleOpenModal = (order: any) => {
    setEditingOrder(order);
    setFormData({ status: order.status });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      await OrderService.updateOrder(editingOrder.id, formData);
    }
    setIsModalOpen(false);
    fetchOrders();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await OrderService.deleteOrder(deleteConfirm);
    setDeleteConfirm(null);
    fetchOrders();
  };

  const columns = [
    { 
      header: 'ID Commande', 
      accessor: (row: any) => <span className="font-mono text-sm font-bold">#{row.id.substring(0, 8)}</span>
    },
    { 
      header: 'Client', 
      accessor: (row: any) => row.customer?.name || 'Inconnu'
    },
    { 
      header: 'Date', 
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR')
    },
    { 
      header: 'Total', 
      accessor: (row: any) => <span className="font-bold">{row.total} MAD</span>
    },
    { 
      header: 'Statut', 
      accessor: (row: any) => {
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
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[row.status] || 'bg-gray-100'}`}>
            {statusText[row.status] || row.status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => handleOpenModal(row)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
            <Edit2 size={18} />
          </button>
          <button type="button" onClick={() => setDeleteConfirm(row.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag size={32} /> Commandes
          </h1>
          <p className="text-gray-500 mt-1">Gérez et suivez les commandes de vos clients.</p>
        </div>
      </div>

      <DataTable data={orders} columns={columns} searchPlaceholder="Rechercher par ID ou nom de client..." />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Mettre à jour le statut</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Statut de la commande</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En cours de traitement</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-200 rounded-lg font-bold hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteConfirm}
        title="Supprimer la commande"
        message="Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
