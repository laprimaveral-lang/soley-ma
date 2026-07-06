import { useState, useEffect } from 'react';
import { Archive, AlertCircle } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import { ProductService, getMediaUrl } from '../../services/api';

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await ProductService.getProducts();
    setProducts(data);
  };

  const columns = [
    { 
      header: 'Produit', 
      accessor: (row: any) => (
        <div className="flex items-center gap-4">
          <img src={row.images?.[0]?.image ? getMediaUrl(row.images[0].image) : 'https://placehold.co/100'} alt={row.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
          <span className="font-bold text-black">{row.name}</span>
        </div>
      )
    },
    { header: 'Référence / SKU', accessor: 'reference' },
    { 
      header: 'Stock Total', 
      accessor: (row: any) => (
        <span className={`font-bold ${row.stock < 5 ? 'text-red-500 flex items-center gap-2' : 'text-green-500'}`}>
          {row.stock} {row.stock < 5 && <AlertCircle size={16} />}
        </span>
      )
    },
    { 
      header: 'Alerte', 
      accessor: (row: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
          {row.stock === 0 ? 'Rupture' : row.stock < 5 ? 'Stock Faible' : 'Normal'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Archive size={32} /> Gestion des Stocks
          </h1>
          <p className="text-gray-500 mt-1">Supervisez l'inventaire et les alertes de rupture.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 font-bold mb-2">Total Produits</div>
          <div className="text-3xl font-black">{products.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 font-bold mb-2">Total en Stock</div>
          <div className="text-3xl font-black">{products.reduce((acc, p) => acc + p.stock, 0)}</div>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100">
          <div className="text-red-500 font-bold mb-2">Rupture / Faible</div>
          <div className="text-3xl font-black text-red-600">{products.filter(p => p.stock < 5).length}</div>
        </div>
      </div>

      <DataTable data={products} columns={columns} searchPlaceholder="Rechercher par nom ou référence..." />
    </div>
  );
}
