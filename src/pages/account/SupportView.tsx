import { Mail, MessageCircle, ChevronRight } from 'lucide-react';

export default function SupportView() {
  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">Service Client</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer" className="border border-[#ECECEC] p-6 hover:border-black transition-colors group flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <MessageCircle className="w-6 h-6 stroke-1" />
            <div>
              <p className="text-sm font-bold tracking-widest uppercase">WhatsApp</p>
              <p className="text-xs text-gray-500">Réponse en moins de 2h</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 stroke-1 text-gray-300 group-hover:text-black transition-colors" />
        </a>

        <a href="mailto:laprimaveral@gmail.com" className="border border-[#ECECEC] p-6 hover:border-black transition-colors group flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <Mail className="w-6 h-6 stroke-1" />
            <div>
              <p className="text-sm font-bold tracking-widest uppercase">Email</p>
              <p className="text-xs text-gray-500">laprimaveral@gmail.com</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 stroke-1 text-gray-300 group-hover:text-black transition-colors" />
        </a>
      </div>

      <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Questions Fréquentes</h3>
      
      <div className="space-y-4 mb-12">
        <details className="group border border-[#ECECEC] bg-[#FAFAF8] open:bg-white transition-colors">
          <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-sm">
            Quels sont les délais de livraison ?
            <span className="transition group-open:rotate-180">
              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="text-gray-500 mt-2 p-6 pt-0 text-sm leading-relaxed">
            La livraison prend généralement 24 à 48 heures ouvrables partout au Maroc. Les commandes passées avant 12h sont expédiées le jour même.
          </div>
        </details>
        
        <details className="group border border-[#ECECEC] bg-[#FAFAF8] open:bg-white transition-colors">
          <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-sm">
            Comment suivre ma commande ?
            <span className="transition group-open:rotate-180">
              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="text-gray-500 mt-2 p-6 pt-0 text-sm leading-relaxed">
            Vous pouvez suivre votre commande depuis la section "Mes Commandes" de votre espace client. Un lien de suivi vous est également envoyé par email et WhatsApp.
          </div>
        </details>
      </div>

      <div className="border-t border-[#ECECEC] pt-8">
        <h3 className="text-xs font-bold tracking-widest uppercase mb-6">Ouvrir un ticket</h3>
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Sujet</label>
            <select className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent appearance-none">
              <option>Problème avec une commande</option>
              <option>Question sur un produit</option>
              <option>Demande de retour</option>
              <option>Autre demande</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Message</label>
            <textarea 
              rows={4}
              className="w-full border-b border-[#ECECEC] py-3 px-0 text-sm focus:outline-none focus:border-black transition-colors bg-transparent resize-none"
              placeholder="Décrivez votre problème en détail..."
            ></textarea>
          </div>
          <button type="submit" className="bg-black text-white px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors">
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}
