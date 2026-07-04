import { Shield, Smartphone } from 'lucide-react';

export default function SecurityView() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Sécurité & Mot de passe</h2>
      
      <div className="mb-16">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Changer le mot de passe</h3>
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Mot de passe actuel</label>
            <input 
              type="password" 
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Nouveau mot de passe</label>
            <input 
              type="password" 
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Confirmer le mot de passe</label>
            <input 
              type="password" 
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="border border-black text-black px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
              Mettre à jour
            </button>
          </div>
        </form>
      </div>

      <div className="mb-16">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Double Authentification (2FA)</h3>
        <div className="flex items-start justify-between border border-[#ECECEC] p-6 bg-[#FAFAF8]">
          <div className="flex gap-4">
            <Shield className="w-6 h-6 stroke-1 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold mb-1">Authentification à deux facteurs</p>
              <p className="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
            </div>
          </div>
          <button className="text-[10px] font-bold tracking-widest uppercase text-black hover:opacity-50 transition-opacity whitespace-nowrap">
            Activer
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Sessions Actives</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
            <div className="flex gap-4 items-center">
              <Smartphone className="w-5 h-5 stroke-1 text-gray-400" />
              <div>
                <p className="text-sm font-bold">MacBook Pro - Chrome</p>
                <p className="text-xs text-gray-400">Casablanca, Maroc • Actif maintenant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
            <div className="flex gap-4 items-center">
              <Smartphone className="w-5 h-5 stroke-1 text-gray-400" />
              <div>
                <p className="text-sm font-bold">iPhone 13 - Safari</p>
                <p className="text-xs text-gray-400">Rabat, Maroc • Hier à 14:30</p>
              </div>
            </div>
            <button className="text-[10px] font-bold tracking-widest uppercase text-red-500 hover:opacity-50 transition-opacity">
              Déconnecter
            </button>
          </div>
        </div>
        <div className="pt-6">
          <button className="text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-black transition-colors underline underline-offset-4 decoration-1">
            Déconnecter tous les autres appareils
          </button>
        </div>
      </div>
    </div>
  );
}
