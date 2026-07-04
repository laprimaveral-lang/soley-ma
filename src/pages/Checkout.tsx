import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold tracking-widest uppercase mb-4">Commande Confirmée !</h1>
        <p className="text-gray-600 mb-8">Merci pour votre achat. Votre numéro de commande est le <span className="font-bold text-black">#SOL8923</span>. Nous vous enverrons un email de confirmation avec les détails de livraison.</p>
        <Link to="/" className="bg-black text-white px-8 py-3 text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors">
          RETOURNER À L'ACCUEIL
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-widest uppercase mb-10 text-center">Paiement Sécurisé</h1>
      
      <div className="flex justify-center mb-12">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="text-xl font-bold tracking-wider uppercase mb-6">Informations Personnelles</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Prénom</label>
                    <input type="text" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nom</label>
                    <input type="text" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                  <input type="email" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                </div>
                <div className="mb-8">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Téléphone</label>
                  <input type="tel" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                </div>
                <button type="submit" className="bg-black text-white px-8 py-3 font-bold tracking-wider hover:bg-gray-800 transition-colors">
                  SUIVANT : LIVRAISON
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="text-xl font-bold tracking-wider uppercase mb-6">Adresse de Livraison</h2>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Adresse</label>
                  <input type="text" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ville</label>
                    <input type="text" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Code Postal</label>
                    <input type="text" required className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="border border-black text-black px-8 py-3 font-bold tracking-wider hover:bg-gray-50 transition-colors">
                    RETOUR
                  </button>
                  <button type="submit" className="bg-black text-white px-8 py-3 font-bold tracking-wider hover:bg-gray-800 transition-colors">
                    SUIVANT : PAIEMENT
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="text-xl font-bold tracking-wider uppercase mb-6">Mode de Paiement</h2>
                <div className="space-y-4 mb-8">
                  <label className="flex items-center p-4 border border-black bg-gray-50 cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="mr-4 w-4 h-4 text-black focus:ring-black" />
                    <span className="font-semibold tracking-wider text-sm">Paiement à la livraison (Espèces)</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 hover:border-gray-300 cursor-pointer text-gray-400">
                    <input type="radio" name="payment" disabled className="mr-4 w-4 h-4" />
                    <span className="font-semibold tracking-wider text-sm">Carte Bancaire (Bientôt disponible)</span>
                  </label>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="border border-black text-black px-8 py-3 font-bold tracking-wider hover:bg-gray-50 transition-colors">
                    RETOUR
                  </button>
                  <button type="submit" className="bg-primary text-white px-8 py-3 font-bold tracking-wider hover:bg-[#b0946b] transition-colors flex-grow">
                    CONFIRMER LA COMMANDE
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div>
          <div className="bg-gray-50 p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 border-b border-gray-200 pb-4">Résumé</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">Image</div>
                  <div>
                    <p className="text-xs font-bold">AURA BEIGE</p>
                    <p className="text-xs text-gray-500">Taille: 38 | Qté: 2</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">598.00 DH</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">598.00 DH</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Remise</span>
                <span className="font-semibold">-0.00 DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-semibold">Gratuite</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="font-bold tracking-wider">TOTAL</span>
              <span className="text-2xl font-bold text-primary">598.00 DH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
