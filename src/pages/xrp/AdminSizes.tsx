import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Ruler } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { SizeService } from '../../services/api';

export default function AdminSizes() {
  const [sizes, setSizes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ value: '' });

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = async () => {
    const data = await SizeService.getSizes();
    setSizes(data);
  };

  const handleOpenModal = (size: any = null) => {
    if (size) {
      setEditingSize(size);
      setFormData({ value: size.value });
    } else {
      setEditingSize(null);
      setFormData({ value: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSize) {
      await SizeService.updateSize(editingSize.id, formData);
    } else {
      await SizeService.createSize(formData);
    }
    setIsModalOpen(false);
    fetchSizes();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await SizeService.deleteSize(deleteConfirm);
    setDeleteConfirm(null);
    fetchSizes();
  };

  const columns = [
    { 
      header: 'Taille', 
      accessor: (row: any) => (
        <span className="font-medium bg-gray-100 px-3 py-1 rounded-md">{row.value}</span>
      )
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
            <Ruler size={32} /> Tailles
          </h1>
          <p className="text-gray-500 mt-1">Gérez les pointures/tailles disponibles pour vos produits.</p>
        </div>
        <button type="button" 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} /> Nouvelle taille
        </button>
      </div>

      <DataTable data={sizes} columns={columns} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8">
            <h2 className="text-2xl font-bold mb-6">{editingSize ? 'Modifier la taille' : 'Nouvelle taille'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Valeur de la taille (ex: 38, M, XL)</label>
                <input 
                  type="text" 
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none uppercase" 
                  required
                />
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
        title="Supprimer la taille"
        message="Êtes-vous sûr de vouloir supprimer cette taille ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
