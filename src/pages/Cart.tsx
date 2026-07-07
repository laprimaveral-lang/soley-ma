import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal - totalPrice;

  return (
    <div className="bg-gray-50/50 min-h-screen pt-48 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-12 text-center">Mon Panier <span className="text-gray-400 text-lg">({totalItems})</span></h1>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold tracking-widest uppercase mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8">Découvrez notre nouvelle collection et trouvez votre bonheur.</p>
            <Link to="/" className="inline-block bg-black text-white px-10 py-4 text-sm font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors rounded-full shadow-lg">
              Continuer mes achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map(item => (
                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-32 h-40 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.images?.length ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-300">Image</span>
                    )}
                  </div>
                  
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold uppercase tracking-widest text-lg">{item.product.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-primary font-bold mb-4">{item.product.price.toFixed(2)} DH</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                      <span className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Couleur: <span className="font-semibold text-black">{item.selectedColor}</span></span>
                      <span className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Taille: <span className="font-semibold text-black">{item.selectedSize}</span></span>
                    </div>

                    <div className="flex items-center gap-4 border border-gray-200 rounded-lg w-fit">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-4 py-2 hover:bg-gray-50 transition-colors font-bold">-</button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-4 py-2 hover:bg-gray-50 transition-colors font-bold">+</button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 flex justify-start">
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-black transition-colors bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
                  ← Continuer mes achats
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-black text-white p-8 rounded-3xl sticky top-24 shadow-2xl">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">Résumé</h2>
                
                <div className="space-y-4 text-sm mb-8">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} DH</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary font-bold">
                      <span className="flex items-center gap-2"><Tag size={16} /> Remise 2=3</span>
                      <span>-{discount.toFixed(2)} DH</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300 border-b border-gray-800 pb-4">
                    <span>Livraison standard</span>
                    <span className="text-green-400">Gratuite</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="font-bold tracking-widest uppercase text-gray-400">Total</span>
                    <span className="text-3xl font-light text-primary">{totalPrice.toFixed(2)} DH</span>
                  </div>
                </div>

                <Link to="/checkout" className="w-full bg-white text-black py-4 rounded-full font-bold tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-6">
                  Commander <ArrowRight size={18} />
                </Link>
                
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={14} /> Paiement 100% sécurisé à la livraison
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
