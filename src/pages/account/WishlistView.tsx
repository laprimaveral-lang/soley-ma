import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, Loader } from 'lucide-react';
import { WishlistService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function WishlistView() {
  const { addToCart } = useCart();
  const { isAuthenticated } = useCustomerAuth();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await WishlistService.getWishlist();
      setItems(res);
    } catch (err: any) {
      console.error(err);
      setError('Impossible de charger votre liste de favoris.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemove = async (productId: string) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      setItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (product: any) => {
    // Determine default variant if available
    const defaultColor = product.variants?.[0]?.color?.name || 'Standard';
    const defaultSize = product.variants?.[0]?.size?.value || 'Standard';
    
    addToCart({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        description: product.description,
        category: product.category?.name || 'Chaussures',
        images: product.images?.map((img: any) => img.image) || [],
        colors: [],
        sizes: [],
        stock: product.stock,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller
      },
      quantity: 1,
      selectedColor: defaultColor,
      selectedSize: defaultSize
    });
    
    // Auto-remove from wishlist or keep it (e-commerce standard: keep it or remove it, let's keep it but show feedback)
    alert(`${product.name} ajouté au panier !`);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-4">Ma Wishlist</h2>
        <p className="text-gray-500 mb-6">Veuillez vous connecter pour voir vos articles favoris.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 border-l-4 border-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-10 border-b border-[#ECECEC] pb-4">
        Ma Wishlist ({items.length})
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 tracking-wider">
          Votre liste de favoris est vide.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
          {items.map((item) => {
            const product = item.product;
            const primaryImage = product.images?.[0]?.image || '/logo.png';
            return (
              <div key={item.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] bg-[#F5F5F0] mb-4 overflow-hidden">
                  <img 
                    src={primaryImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-white text-black p-3 hover:bg-black hover:text-white transition-colors cursor-pointer" 
                      title="Ajouter au panier"
                    >
                      <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                    </button>
                    <button 
                      onClick={() => handleRemove(product.id)}
                      className="bg-white text-red-500 p-3 hover:bg-red-500 hover:text-white transition-colors cursor-pointer" 
                      title="Retirer"
                    >
                      <Trash2 className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1">
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.material || 'Cuir véritable'}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#ECECEC]">
                    <p className="font-serif text-lg">{product.price} dh</p>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${product.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {product.stock === 0 ? 'Épuisé' : 'En stock'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
