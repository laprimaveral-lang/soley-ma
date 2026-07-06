import { useState, useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { OrderService } from '../services/api';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Prefill customer info if logged in
  useEffect(() => {
    if (customer) {
      const names = customer.name.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setError(null);
      try {
        const orderData = {
          customerId: customer?.id || null,
          customerName: `${firstName} ${lastName}`,
          customerPhone: phone,
          shippingAddress: `${address}, ${city}, ${postalCode}`,
          subtotal: totalPrice,
          total: totalPrice,
          shipping: 0,
          discount: 0,
          items: items.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        };

        const res = await OrderService.createOrder(orderData);
        setCreatedOrder(res);
        setIsSuccess(true);
        clearCart();
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Une erreur est survenue lors de la validation de la commande.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-6">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8">Ajoutez des produits au panier avant de passer commande.</p>
        <Link to="/" className="bg-black text-white px-8 py-3 text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors">
          RETOUR À LA BOUTIQUE
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold tracking-widest uppercase mb-4">Commande Confirmée !</h1>
        <p className="text-gray-600 mb-8">
          Merci pour votre achat, <span className="font-semibold text-black">{firstName}</span>.<br />
          Votre numéro de commande est le <span className="font-bold text-black">#{createdOrder?.id?.substring(0, 8) || 'SOL-SUCCESS'}</span>.<br />
          Nous vous contacterons par téléphone au <span className="font-semibold text-black">{phone}</span> pour valider l'expédition.
        </p>
        <Link to="/" className="bg-black text-white px-8 py-3 text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors">
          RETOURNER À L'ACCUEIL
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-widest uppercase mb-10 text-center">Paiement Sécurisé</h1>
      
      {/* Steps Indicator */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-16 h-1 transition-colors ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <div className={`w-16 h-1 transition-colors ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 mb-6 border-l-4 border-red-500 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="bg-white p-6 border border-gray-200">
                <h2 className="text-xl font-bold tracking-wider uppercase mb-6">Informations Personnelles</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Prénom</label>
                    <input 
                      type="text" 
                      required 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nom</label>
                    <input 
                      type="text" 
                      required 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Téléphone</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                  />
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Adresse complète</label>
                  <input 
                    type="text" 
                    required 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ville</label>
                    <input 
                      type="text" 
                      required 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Code Postal</label>
                    <input 
                      type="text" 
                      required 
                      value={postalCode} 
                      onChange={e => setPostalCode(e.target.value)} 
                      className="w-full border border-gray-300 px-4 py-2 focus:border-black outline-none" 
                    />
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
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 font-bold tracking-wider hover:bg-gray-800 transition-colors flex-grow flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Envoi en cours...
                      </>
                    ) : (
                      'CONFIRMER LA COMMANDE'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div>
          <div className="bg-gray-50 p-6 border border-gray-100">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6 border-b border-gray-200 pb-4">Résumé</h2>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.product.images?.[0] || '/logo.png'} 
                      alt={item.product.name} 
                      className="w-12 h-12 object-cover bg-gray-100 border border-gray-200" 
                    />
                    <div>
                      <p className="text-xs font-bold truncate max-w-[150px]">{item.product.name.toUpperCase()}</p>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                        {item.selectedSize && ` | Size: ${item.selectedSize}`}
                        {` | Qté: ${item.quantity}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{item.product.price * item.quantity} DH</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">{totalPrice} DH</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Remise (Offre 3ème Gratuite)</span>
                <span className="font-semibold">-0.00 DH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-semibold text-green-600">Gratuite</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="font-bold tracking-wider">TOTAL</span>
              <span className="text-2xl font-bold text-black">{totalPrice} DH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
