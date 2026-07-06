import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { BannerService, api } from '../../services/api';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ title: '', image: '', link: '', active: true, position: 0 });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const data = await BannerService.getBanners();
    setBanners(data);
  };

  const handleOpenModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({ title: banner.title, image: banner.image, link: banner.link || '', active: banner.active, position: banner.position });
    } else {
      setEditingBanner(null);
      setFormData({ title: '', image: '', link: '', active: true, position: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      await BannerService.updateBanner(editingBanner.id, formData);
    } else {
      await BannerService.createBanner(formData);
    }
    setIsModalOpen(false);
    fetchBanners();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await BannerService.deleteBanner(deleteConfirm);
    setDeleteConfirm(null);
    fetchBanners();
  };

  const columns = [
    { 
      header: 'Image', 
      accessor: (row: any) => (
        <img src={row.image} alt={row.title} className="h-12 w-24 object-cover rounded-lg bg-gray-100" />
      )
    },
    { header: 'Titre', accessor: 'title' },
    { header: 'Lien', accessor: 'link' },
    { 
      header: 'Statut', 
      accessor: (row: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {row.active ? 'Actif' : 'Inactif'}
        </span>
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
            <ImageIcon size={32} /> Bannières
          </h1>
          <p className="text-gray-500 mt-1">Gérez les bannières de la page d'accueil.</p>
        </div>
        <button type="button" 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} /> Nouvelle bannière
        </button>
      </div>

      <DataTable data={banners} columns={columns} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titre (Interne)</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image de la bannière</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const uploadData = new FormData();
                      uploadData.append('images', file);
                      try {
                        const res = await api.post('/upload', uploadData);
                        const data = res.data;
                        if (data.urls && data.urls.length > 0) {
                          setFormData({ ...formData, image: data.urls[0] });
                        }
                      } catch (err) {
                        console.error('Erreur upload:', err);
                      }
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                />
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Aperçu" className="h-20 object-contain rounded border" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lien (Page cible)</label>
                <select 
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                >
                  <option value="">Aucun lien</option>
                  <option value="/collections/nouveau">NOUVEAUTÉS</option>
                  <option value="/collections/sandales">SANDALES</option>
                  <option value="/collections/mules">MULES</option>
                  <option value="/collections/sabots">SABOTS</option>
                  <option value="/collections/mocassins">MOCASSINS</option>
                  <option value="/collections/slippers">SLIPPERS</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 accent-black" 
                />
                <label htmlFor="active" className="font-bold cursor-pointer">Bannière active</label>
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
        title="Supprimer la bannière"
        message="Êtes-vous sûr de vouloir supprimer cette bannière ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
