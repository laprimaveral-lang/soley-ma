import { RotateCcw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReturnsView() {
  return (
    <div>
      <div className="flex justify-between items-center mb-10 border-b border-[#ECECEC] pb-4">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Retours & Échanges</h2>
        <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:opacity-50 transition-opacity">
          <RotateCcw className="w-4 h-4 stroke-[2]" /> Faire une demande
        </button>
      </div>

      <div className="bg-[#FAFAF8] p-6 mb-10 flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 stroke-[1.5] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold mb-1">Politique de retour</p>
          <p className="text-sm text-gray-500">Vous disposez de 7 jours après la livraison pour demander un retour ou un échange. Les articles doivent être non portés, dans leur état et emballage d'origine.</p>
        </div>
      </div>

      <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Historique des retours</h3>
      
      <div className="border border-[#ECECEC] p-6 mb-6">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#ECECEC]">
          <div>
            <p className="text-sm font-bold tracking-widest uppercase">Demande #RET-84729</p>
            <p className="text-xs text-gray-400">Effectuée le 15 Mai 2026</p>
          </div>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
            Remboursé
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-20 bg-[#F5F5F0]"></div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1">Mule Classique</p>
            <p className="text-sm text-gray-500">Noir / 41</p>
            <p className="text-sm text-gray-500">Motif: Taille trop petite</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-sm text-gray-500 mb-4">Besoin d'aide pour votre retour ?</p>
        <Link to="/account/support" className="text-xs font-bold tracking-widest uppercase underline underline-offset-4 decoration-1 hover:text-gray-500 transition-colors">
          Contacter le service client
        </Link>
      </div>
    </div>
  );
}
