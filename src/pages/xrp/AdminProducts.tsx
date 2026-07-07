import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Download, Upload } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import ImageUploader from '../../components/xrp/ImageUploader';
import { ProductService, CategoryService, ColorService, SizeService, getMediaUrl } from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', reference: '', slug: '', description: '', categoryId: '', 
    price: '' as any, salePrice: '', costPrice: '' as any, videoUrl: '', stock: '' as any, status: 'draft', images: [] as string[],
    colorIds: [] as string[], sizeIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [prodRes, catRes, colRes, sizeRes] = await Promise.all([
      ProductService.getProducts(),
      CategoryService.getCategories(),
      ColorService.getColors(),
      SizeService.getSizes()
    ]);
    setProducts(prodRes);
    setCategories(catRes);
    setColors(colRes);
    setSizes(sizeRes);
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/products/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export_soley_produits.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'exportation CSV.');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/products/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ csvText })
        });
        const resData = await response.json();
        if (response.ok) {
          alert(`Importation réussie ! ${resData.count} produits importés ou mis à jour.`);
          fetchData();
        } else {
          alert(`Erreur d'importation: ${resData.error}`);
        }
      } catch (err) {
        console.error(err);
        alert('Erreur lors de l\'importation CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        reference: product.reference,
        slug: product.slug,
        description: product.description || '',
        categoryId: product.categoryId || '',
        price: product.price ?? '',
        salePrice: product.salePrice ?? '',
        costPrice: product.costPrice ?? '',
        videoUrl: product.videoUrl || '',
        stock: product.stock ?? '',
        status: product.status,
        images: product.images?.map((i: any) => i.image) || [],
        colorIds: Array.from(new Set(product.variants?.map((v: any) => v.colorId).filter(Boolean))) as string[],
        sizeIds: Array.from(new Set(product.variants?.map((v: any) => v.sizeId).filter(Boolean))) as string[]
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', reference: '', slug: '', description: '', categoryId: categories[0]?.id || '', 
        price: '', salePrice: '', costPrice: '', videoUrl: '', stock: '', status: 'draft', images: [],
        colorIds: [], sizeIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleUploadImages = async (files: File[]) => {
    const uploadData = new FormData();
    files.forEach(f => uploadData.append('images', f));
    const data = await ProductService.uploadImages(uploadData);
    return data.urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      costPrice: Number(formData.costPrice || 0),
      videoUrl: formData.videoUrl || '',
      stock: Number(formData.stock),
      images: {
        create: formData.images.map((img, idx) => ({ image: img, position: idx }))
      },
      colorIds: formData.colorIds,
      sizeIds: formData.sizeIds
    };

    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, payload);
      } else {
        await ProductService.createProduct(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Une erreur est survenue lors de l'enregistrement du produit.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await ProductService.deleteProduct(deleteConfirm);
      setDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Une erreur est survenue lors de la suppression du produit.");
      setDeleteConfirm(null);
    }
  };

  const columns = [
    { 
      header: 'Produit', 
      accessor: (row: any) => (
        <div className="flex items-center gap-4">
          <img src={row.images?.[0]?.image ? getMediaUrl(row.images[0].image) : 'https://placehold.co/100'} alt={row.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
          <div>
            <div className="font-bold text-black">{row.name}</div>
            <div className="text-xs text-gray-500 font-mono">{row.reference}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Catégorie', 
      accessor: (row: any) => row.category?.name || 'Non classé'
    },
    { 
      header: 'Prix', 
      accessor: (row: any) => <span className="font-bold">{row.price} MAD</span>
    },
    { 
      header: 'Stock', 
      accessor: (row: any) => (
        <span className={`font-bold ${row.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{row.stock}</span>
      )
    },
    { 
      header: 'Statut', 
      accessor: (row: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {row.status === 'published' ? 'Publié' : 'Brouillon'}
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
            <Package size={32} /> Produits
          </h1>
          <p className="text-gray-500 mt-1">Gérez votre catalogue de produits, les prix et le stock.</p>
        </div>
        <div className="flex gap-4">
          <button type="button" 
            onClick={handleExportCSV}
            className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm"
          >
            <Download size={20} /> Exporter
          </button>
          
          <label className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer text-sm">
            <Upload size={20} /> Importer
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="hidden" 
            />
          </label>

          <button type="button" 
            onClick={() => handleOpenModal()}
            className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm"
          >
            <Plus size={20} /> Ajouter un produit
          </button>
        </div>
      </div>

      <DataTable data={products} columns={columns} searchable searchPlaceholder="Rechercher par nom, référence..." />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Infos Générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Référence</label>
                  <input type="text" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" rows={4} required />
                </div>
              </div>

              {/* Catégorie & Prix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none text-sm" required>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prix régulier (MAD)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prix promo (MAD)</label>
                  <input type="number" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Prix d'Achat (MAD)</label>
                  <input type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none text-sm" />
                </div>
              </div>

              {/* Vidéo de démonstration */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL de la Vidéo (YouTube / MP4)</label>
                <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none text-sm" />
              </div>

              {/* Stock & Statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock total</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" required>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>
              </div>

              {/* Variantes: Couleurs & Tailles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Couleurs disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <label key={c.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${formData.colorIds.includes(c.id) ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.colorIds.includes(c.id)}
                          onChange={e => {
                            if (e.target.checked) setFormData({...formData, colorIds: [...formData.colorIds, c.id]});
                            else setFormData({...formData, colorIds: formData.colorIds.filter(id => id !== c.id)});
                          }}
                          className="hidden" 
                        />
                        <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }}></span>
                        <span className="text-sm">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tailles disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <label key={s.id} className={`flex items-center justify-center w-12 h-10 border rounded-lg cursor-pointer transition-colors ${formData.sizeIds.includes(s.id) ? 'border-black bg-black text-white font-bold' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.sizeIds.includes(s.id)}
                          onChange={e => {
                            if (e.target.checked) setFormData({...formData, sizeIds: [...formData.sizeIds, s.id]});
                            else setFormData({...formData, sizeIds: formData.sizeIds.filter(id => id !== s.id)});
                          }}
                          className="hidden" 
                        />
                        <span className="text-sm">{s.value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">Galerie d'images</label>
                <ImageUploader 
                  images={formData.images} 
                  onChange={(imgs) => setFormData({...formData, images: imgs})} 
                  onUpload={handleUploadImages} 
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
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
