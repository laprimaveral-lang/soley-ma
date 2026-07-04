import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';
import ConfirmDialog from '../../components/xrp/ConfirmDialog';
import { CouponService } from '../../services/api';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({ code: '', discount: 0, type: 'percentage', active: true });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const data = await CouponService.getCoupons();
    setCoupons(data);
  };

  const handleOpenModal = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({ code: coupon.code, discount: coupon.discount, type: coupon.type, active: coupon.active });
    } else {
      setEditingCoupon(null);
      setFormData({ code: '', discount: 0, type: 'percentage', active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      await CouponService.updateCoupon(editingCoupon.id, { ...formData, discount: Number(formData.discount) });
    } else {
      await CouponService.createCoupon({ ...formData, discount: Number(formData.discount) });
    }
    setIsModalOpen(false);
    fetchCoupons();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await CouponService.deleteCoupon(deleteConfirm);
    setDeleteConfirm(null);
    fetchCoupons();
  };

  const columns = [
    { 
      header: 'Code Promo', 
      accessor: (row: any) => (
        <span className="font-bold font-mono tracking-widest text-lg">{row.code}</span>
      )
    },
    { 
      header: 'Réduction', 
      accessor: (row: any) => (
        <span className="font-medium text-green-600 bg-green-50 px-3 py-1 rounded-md">
          {row.type === 'percentage' ? `-${row.discount}%` : `-${row.discount} MAD`}
        </span>
      )
    },
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
            <Tag size={32} /> Codes Promo
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos réductions et offres promotionnelles.</p>
        </div>
        <button type="button" 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} /> Nouveau code
        </button>
      </div>

      <DataTable data={coupons} columns={columns} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8">
            <h2 className="text-2xl font-bold mb-6">{editingCoupon ? 'Modifier le code' : 'Nouveau code'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Code</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none uppercase font-mono tracking-wider" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Valeur</label>
                  <input 
                    type="number" 
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.valueAsNumber })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 accent-black" 
                />
                <label htmlFor="active" className="font-bold cursor-pointer">Code actif</label>
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
        title="Supprimer le code"
        message="Êtes-vous sûr de vouloir supprimer ce code promo ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
