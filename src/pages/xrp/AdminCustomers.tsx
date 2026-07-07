import { useState, useEffect } from 'react';
import { Users, Mail, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { CustomerService } from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', isBlacklisted: false });
  
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const data = await CustomerService.getCustomers();
    setCustomers(data);
  };

  const handleOpenModal = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({ 
      name: customer.name, 
      phone: customer.phone || '',
      isBlacklisted: customer.isBlacklisted || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await CustomerService.updateCustomer(editingCustomer.id, formData);
    }
    setIsModalOpen(false);
    fetchCustomers();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await CustomerService.deleteCustomer(deleteConfirm);
    setDeleteConfirm(null);
    fetchCustomers();
  };

  const columns = [
    { 
      header: 'Client', 
      accessor: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-black">{row.name}</span>
              {row.isBlacklisted && (
                <span className="bg-red-100 text-red-700 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border border-red-200 uppercase tracking-widest animate-pulse">Liste Noire</span>
              )}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Téléphone', 
      accessor: (row: any) => row.phone || 'Non renseigné'
    },
    { 
      header: 'Fidélité', 
      accessor: (row: any) => {
        const orderCount = row.orders?.length || 0;
        const stars = Math.min(5, orderCount);
        return (
          <div className="flex flex-col gap-1 font-sans">
            <div className="flex text-amber-400 text-lg">
              {Array.from({ length: 5 }).map((_, idx) => (
                <span key={idx} className={idx < stars ? 'opacity-100' : 'opacity-20'}>★</span>
              ))}
            </div>
            {stars >= 5 ? (
              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit uppercase tracking-wider animate-pulse">VIP 5★ (Remise)</span>
            ) : (
              <span className="text-[9px] font-semibold text-gray-500">{orderCount} achat(s)</span>
            )}
          </div>
        );
      }
    },
    { 
      header: 'Inscription', 
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString('fr-FR')
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          <a href={`mailto:${row.email}`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
            <Mail size={18} />
          </a>
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
            <Users size={32} /> Clients
          </h1>
          <p className="text-gray-500 mt-1">Consultez la base de données de vos clients.</p>
        </div>
      </div>

      <DataTable data={customers} columns={columns} searchPlaceholder="Rechercher par nom, email..." />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Modifier le client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="isBlacklisted"
                  checked={formData.isBlacklisted}
                  onChange={e => setFormData({ ...formData, isBlacklisted: e.target.checked })}
                  className="w-4 h-4 border-gray-300 text-red-600 focus:ring-red-500 rounded" 
                />
                <label htmlFor="isBlacklisted" className="text-sm font-bold text-red-600 select-none cursor-pointer">
                  Placer ce client en liste noire
                </label>
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
        title="Supprimer le compte client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Toutes ses commandes et informations seront effacées."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
