import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function PersonalInfoView() {
  const { customer } = useCustomerAuth();

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Informations Personnelles</h2>
      
      <form className="space-y-8" onSubmit={e => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Prénom</label>
            <input 
              type="text" 
              defaultValue={customer?.name?.split(' ')[0] || ''}
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Nom</label>
            <input 
              type="text" 
              defaultValue={customer?.name?.split(' ')[1] || ''}
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Adresse Email</label>
          <input 
            type="email" 
            defaultValue={customer?.email}
            className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Numéro de téléphone</label>
          <input 
            type="tel" 
            defaultValue={customer?.phone || '+212 '}
            className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Date de naissance</label>
            <input 
              type="date" 
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Genre</label>
            <select className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent text-gray-600 appearance-none">
              <option value="">Sélectionner</option>
              <option value="m">Homme</option>
              <option value="f">Femme</option>
            </select>
          </div>
        </div>

        <div className="pt-8">
          <button type="submit" className="bg-black text-white px-10 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
