import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { CollectionService } from '../../services/api';

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const data = await CollectionService.getCollections();
    setCollections(data);
  };

  const handleOpenModal = (collection: any = null) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({ name: collection.name, slug: collection.slug, description: collection.description || '' });
    } else {
      setEditingCollection(null);
      setFormData({ name: '', slug: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection) {
      await CollectionService.updateCollection(editingCollection.id, formData);
    } else {
      await CollectionService.createCollection(formData);
    }
    setIsModalOpen(false);
    fetchCollections();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await CollectionService.deleteCollection(deleteConfirm);
    setDeleteConfirm(null);
    fetchCollections();
  };

  const columns = [
    { header: 'Nom', accessor: 'name' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Description', accessor: 'description' },
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
            <Layers size={32} /> Collections
          </h1>
          <p className="text-gray-500 mt-1">Gérez les collections thématiques de produits.</p>
        </div>
        <button type="button" 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} /> Nouvelle collection
        </button>
      </div>

      <DataTable data={collections} columns={columns} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{editingCollection ? 'Modifier la collection' : 'Nouvelle collection'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none bg-gray-50" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                  rows={3}
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
        title="Supprimer la collection"
        message="Êtes-vous sûr de vouloir supprimer cette collection ? Les produits ne seront pas supprimés."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
