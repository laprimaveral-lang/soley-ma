import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Palette } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { ColorService } from '../../services/api';

export default function AdminColors() {
  const [colors, setColors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', hex: '#000000' });

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    const data = await ColorService.getColors();
    setColors(data);
  };

  const handleOpenModal = (color: any = null) => {
    if (color) {
      setEditingColor(color);
      setFormData({ name: color.name, hex: color.hex });
    } else {
      setEditingColor(null);
      setFormData({ name: '', hex: '#000000' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingColor) {
      await ColorService.updateColor(editingColor.id, formData);
    } else {
      await ColorService.createColor(formData);
    }
    setIsModalOpen(false);
    fetchColors();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await ColorService.deleteColor(deleteConfirm);
    setDeleteConfirm(null);
    fetchColors();
  };

  const columns = [
    { 
      header: 'Couleur', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: row.hex }}></div>
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    { header: 'Code Hex', accessor: 'hex' },
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
            <Palette size={32} /> Couleurs
          </h1>
          <p className="text-gray-500 mt-1">Gérez les couleurs disponibles pour vos produits.</p>
        </div>
        <button type="button" 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} /> Nouvelle couleur
        </button>
      </div>

      <DataTable data={colors} columns={columns} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8">
            <h2 className="text-2xl font-bold mb-6">{editingColor ? 'Modifier la couleur' : 'Nouvelle couleur'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la couleur</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Code Hexadécimal</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={formData.hex}
                    onChange={e => setFormData({ ...formData, hex: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer" 
                    required
                  />
                  <input 
                    type="text" 
                    value={formData.hex}
                    onChange={e => setFormData({ ...formData, hex: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none uppercase font-mono" 
                    required
                  />
                </div>
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
        title="Supprimer la couleur"
        message="Êtes-vous sûr de vouloir supprimer cette couleur ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
