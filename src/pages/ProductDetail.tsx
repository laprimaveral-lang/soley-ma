import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ChevronRight, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { ProductService, OrderService, getMediaUrl } from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState<string>('');
  const { addToCart } = useCart();

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<'single' | 'pack'>('single');
  // Store full pack items: [{ productId, colorId, size: string }]
  const [packItems, setPackItems] = useState<any[]>([
    { productId: '', colorId: '', size: '' },
    { productId: '', colorId: '', size: '' },
    { productId: '', colorId: '', size: '' }
  ]);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    ProductService.getProducts().then(products => {
      setAllProducts(products);
      const foundProduct = products.find((p: any) => p.id === id || p.slug === id) || products[0];
      setProduct(foundProduct);
      if (foundProduct) {
        // Extract variants
        const colors = Array.from(new Map(foundProduct.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
        if (colors.length > 0) setSelectedColor(colors[0]);
        
        if (foundProduct.images && foundProduct.images.length > 0) {
          setMainImage(getMediaUrl(foundProduct.images[0].image));
        }

        setPackItems([
          { productId: foundProduct.id, colorId: '', size: '' },
          { productId: foundProduct.id, colorId: '', size: '' },
          { productId: foundProduct.id, colorId: '', size: '' }
        ]);
      }
      const related = products.filter((p: any) => p.categoryId === foundProduct?.categoryId && p.id !== foundProduct?.id).slice(0, 4);
      setRelatedProducts(related);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    const colors = Array.from(new Map(product.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
    const availableSizes = Array.from(
      new Set(
        product.variants
          ?.filter((v: any) => (colors.length > 0 ? v.color?.id === selectedColor?.id : true))
          .map((v: any) => v.size?.value)
      )
    ).filter(Boolean) as string[];

    if (colors.length > 0 && !selectedColor) {
      alert("Veuillez sélectionner une couleur");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      alert("Veuillez sélectionner une taille");
      return;
    }
    addToCart({
      product,
      quantity,
      selectedColor: selectedColor?.name,
      selectedSize: String(selectedSize)
    });
    
    // Redirect to cart or show visual feedback
    navigate('/cart');
  };

  const handleExpressOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Fallback size/color if variants exist but none selected in single mode
    // Normally, the modal requires these to be set, but let's be safe.
    let items = [];
    if (selectedOffer === 'single') {
      const variant = product.variants?.[0] || { id: product.id };
      items.push({
        productVariantId: variant.id,
        quantity: 1,
        price: product.salePrice || product.price
      });
    } else {
      // Pack of 3
      for (let i = 0; i < 3; i++) {
        const pItem = packItems[i];
        // Find the matching variant
        const selectedProd = allProducts.find(p => p.id === pItem.productId) || product;
        const matchingVariant = selectedProd.variants?.find((v: any) => v.color?.id === pItem.colorId && v.size?.value === pItem.size) || selectedProd.variants?.[0] || { id: selectedProd.id };
        
        items.push({
          productVariantId: matchingVariant.id,
          quantity: 1,
          price: i === 2 ? 0 : (selectedProd.salePrice || selectedProd.price),
          size: pItem.size
        });
      }
    }

    const subtotal = selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 3;
    const discount = selectedOffer === 'single' ? 0 : (product.salePrice || product.price);
    const total = subtotal - discount;

    try {
      const res = await OrderService.createOrder({
        customerName: checkoutForm.name,
        customerPhone: checkoutForm.phone,
        shippingAddress: checkoutForm.address,
        subtotal,
        total,
        shipping: 0,
        discount,
        items: items.map((i: any) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
          price: i.price
        }))
      });

      if (res) {
        setIsCheckoutModalOpen(false);
        alert('Votre commande a été confirmée avec succès !');
        // Optionally redirect to a thank you page
      } else {
        alert('Erreur lors de la confirmation.');
      }
    } catch (err) {
      alert('Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;
  if (!product) return <div className="text-center py-20">Produit introuvable.</div>;

  const colors = Array.from(new Map(product.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
  const availableSizes = Array.from(
    new Set(
      product.variants
        ?.filter((v: any) => (colors.length > 0 ? v.color?.id === selectedColor?.id : true))
        .map((v: any) => v.size?.value)
    )
  ).filter(Boolean) as string[];

  const promotion = product.salePrice && product.salePrice < product.price;

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pt-48">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-[10px] text-gray-400 mb-12 tracking-[0.2em] uppercase font-bold">
          <Link to="/" className="hover:text-black transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all">Accueil</Link> 
          <ChevronRight className="w-3 h-3 mx-4 stroke-1" />
          <Link to={`/collections/${product.category?.slug}`} className="hover:text-black transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all">{product.category?.name || 'Collection'}</Link> 
          <ChevronRight className="w-3 h-3 mx-4 stroke-1" />
          <span className="text-black">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative items-start">
          
          {/* Gallery - Vertical Thumbnails on Left, Main Image on Right */}
          <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-4">
            {product.images && product.images.length > 0 ? (
              <>
                {/* Thumbnails */}
                <div className="w-full md:w-24 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
                  {product.images.map((img: any) => (
                    <button 
                      key={img.id}
                      onClick={() => setMainImage(getMediaUrl(img.image))}
                      className={`flex-shrink-0 w-20 md:w-full aspect-[3/4] border transition-all ${mainImage === getMediaUrl(img.image) ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={getMediaUrl(img.image)} className="w-full h-full object-cover" alt={`${product.name} thumbnail`} />
                    </button>
                  ))}
                </div>
                {/* Main Image */}
                <div className="flex-1 bg-[#F5F5F0] aspect-[3/4] md:aspect-[4/5] relative overflow-hidden cursor-zoom-in">
                  <img src={mainImage} className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-[0.25,0.1,0.25,1]" alt={product.name} />
                  <div className="absolute top-6 left-6 flex gap-3">
                    {product.isNew && <span className="bg-black text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase">Nouveau</span>}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full aspect-square bg-[#F5F5F0] flex flex-col items-center justify-center text-gray-300">
                <span className="text-xs uppercase tracking-widest">Soley</span>
              </div>
            )}
          </div>

          {/* Sticky Purchase Panel - Right Panel */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 pb-32">
            
            <div className="mb-8">
              <h1 className="text-3xl font-serif tracking-wide mb-3 text-black uppercase">{product.name}</h1>
              {promotion && <div className="bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 inline-block mb-4">Promo</div>}
              
              <div className="flex items-end gap-4 text-sm tracking-widest uppercase">
                {promotion ? (
                  <>
                    <span className="text-green-600 font-bold">{product.salePrice.toFixed(2)} MAD</span>
                    <span className="text-gray-400 line-through">{product.price.toFixed(2)} MAD</span>
                  </>
                ) : (
                  <p className="font-bold text-black">{product.price.toFixed(2)} MAD</p>
                )}
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 mb-10 text-xs text-gray-600 border-y border-[#ECECEC] py-6">
              <div className="flex items-center gap-2"><Check className="w-4 h-4" /> 100% Cuir original</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4" /> Cousu à la main</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4" /> 1+1 = 1 Paire offerte 🎁</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4" /> Satisfait ou remboursé</div>
            </div>

            <div className="space-y-8">

              {/* SECTION 1: Color */}
              {colors.length > 0 && (
                <div>
                  <div className="mb-4">
                    <span className="text-[11px] font-bold tracking-[0.1em] text-gray-800">Couleur : {selectedColor?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color: any) => (
                      <button type="button" 
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className={`w-16 h-16 transition-all flex items-center justify-center p-[2px] border ${selectedColor?.id === color.id ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}>
                          <div className="w-full h-full" style={{ backgroundColor: color.hex }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: Size */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Pointure</span>
                    <button type="button" className="text-[10px] text-gray-500 underline underline-offset-4 tracking-widest hover:text-black transition-colors">Guide des tailles</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button type="button" 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 text-[12px] transition-all duration-300 border flex items-center justify-center
                          ${selectedSize === size 
                            ? 'border-black border-[1.5px] font-bold text-black' 
                            : 'border-[#ECECEC] text-gray-500 hover:border-gray-400 font-medium'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Area */}
              <div className="pt-8">
                <div className="flex gap-4 mb-4">
                  <button type="button" 
                    onClick={handleAddToCart}
                    className="flex-grow bg-[#EAEAEA] text-[#34A853] text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-gray-200 transition-all duration-300 py-4 px-8 rounded-sm"
                  >
                    Ajouter au panier
                  </button>
                  <button type="button" 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-14 h-14 flex items-center justify-center border border-[#ECECEC] hover:border-black transition-all duration-500 group rounded-sm"
                  >
                    <Heart className={`w-5 h-5 stroke-1 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black group-hover:text-red-500'}`} />
                  </button>
                </div>
                
                {/* Express Checkout Button */}
                <button type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full bg-[#18a318] hover:bg-[#128212] text-white rounded-md transition-all duration-300 py-3 flex flex-col items-center justify-center gap-1 shadow-sm"
                >
                  <div className="flex items-center gap-2 font-bold text-[14px]">
                    <ShoppingBag className="w-4 h-4" />
                    Commander maintenant
                  </div>
                  <div className="text-[11px] font-medium opacity-90">
                    Paiement à la livraison
                  </div>
                </button>
              </div>

              {/* Premium Delivery Icons */}
              <div className="grid grid-cols-2 gap-4 py-8 border-y border-[#ECECEC]">
                 <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 stroke-1 text-black" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">Livraison 24/48h</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 stroke-1 text-black" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">Retour 7 Jours</span>
                 </div>
              </div>

              {/* Accordions Container */}
              <div className="divide-y divide-[#ECECEC]">
                
                <details className="group" open>
                  <summary className="text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer list-none flex justify-between items-center py-6">
                    Description
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <ChevronRight className="w-4 h-4 stroke-1 transform rotate-90" />
                    </span>
                  </summary>
                  <div className="pb-8 text-sm text-gray-500 leading-loose font-light">
                    <p className="mb-6">{product.description}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400">RÉF: {product.reference}</p>
                  </div>
                </details>

                <details className="group">
                  <summary className="text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer list-none flex justify-between items-center py-6">
                    Matières & Entretien
                  </summary>
                  <div className="pb-8 text-sm text-gray-500 leading-loose font-light">
                    <p>{product.material || "Cuir véritable sélectionné avec soin. Pour préserver sa beauté, nettoyez avec un chiffon doux. Conservez dans son pochon d'origine à l'abri de la lumière."}</p>
                  </div>
                </details>

                <details className="group">
                  <summary className="text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer list-none flex justify-between items-center py-6">
                    Livraison & Retours
                  </summary>
                  <div className="pb-8 text-sm text-gray-500 leading-loose font-light space-y-4">
                    <p><strong className="font-bold text-black">Livraison Standard :</strong> 24h à 48h jours ouvrés au Maroc. Paiement à la livraison disponible.</p>
                    <p><strong className="font-bold text-black">Retours :</strong> Échanges ou retours acceptés sous 7 jours. Les articles doivent être retournés dans leur état et emballage d'origine.</p>
                  </div>
                </details>

              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-40 pt-20 border-t border-[#ECECEC]">
          <h2 className="text-xl lg:text-3xl font-serif text-center mb-16 text-black">Complétez l'allure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {relatedProducts.length > 0 ? (
              relatedProducts.map(p => <ProductCard key={p.id} {...p} />)
            ) : (
              <div className="col-span-4 text-center text-gray-400 py-10 font-light tracking-widest uppercase text-xs">Aucun produit similaire</div>
            )}
          </div>
        </div>

      </div>

      {/* EXPRESS CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
              <h3 className="font-bold text-gray-800 text-center flex-1">Veuillez remplir le formulaire pour commander!</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <form onSubmit={handleExpressOrder} className="space-y-4">
                
                {/* Offer Selection */}
                <div className="space-y-2">
                  <label 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedOffer === 'single' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="offer" 
                      checked={selectedOffer === 'single'} 
                      onChange={() => setSelectedOffer('single')}
                      className="hidden" 
                    />
                    <img src={mainImage} alt={product.name} className="w-10 h-10 object-cover rounded mr-3" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-800">Je veux une</div>
                      <div className="text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded inline-block">Livraison Gratuite</div>
                    </div>
                    <div className="font-bold text-red-600">{product.salePrice || product.price}.00 dh</div>
                  </label>

                  <label 
                    className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${selectedOffer === 'pack' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center mb-2">
                      <input 
                        type="radio" 
                        name="offer" 
                        checked={selectedOffer === 'pack'} 
                        onChange={() => setSelectedOffer('pack')}
                        className="hidden" 
                      />
                      <img src={mainImage} alt={product.name} className="w-10 h-10 object-cover rounded mr-3" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-800">Pack 2 + La 3ème Gratuite 🎁 au choix</div>
                        <div className="text-[10px] text-white bg-orange-500 px-1.5 py-0.5 rounded inline-block font-bold">Offre la plus vendue</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 line-through">{(product.salePrice || product.price) * 3}.00 dh</div>
                        <div className="font-bold text-red-600">{(product.salePrice || product.price) * 2}.00 dh</div>
                      </div>
                    </div>

                    {/* Pack Items Selection */}
                    {selectedOffer === 'pack' && (
                      <div className="mt-2 space-y-3 bg-white p-3 rounded border border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="text-[11px] font-bold text-gray-700">Composez votre Pack</div>
                        {[0, 1, 2].map(idx => {
                          const pItem = packItems[idx];
                          const selectedProd = allProducts.find(p => p.id === pItem.productId) || product;
                          const prodColors = Array.from(new Map(selectedProd.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
                          const prodSizes = Array.from(new Set(selectedProd.variants?.filter((v: any) => (pItem.colorId ? v.color?.id === pItem.colorId : true)).map((v: any) => v.size?.value))).filter(Boolean) as string[];

                          return (
                            <div key={idx} className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded border border-gray-200">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Article {idx + 1} {idx === 2 && <span className="text-orange-500">(Gratuit)</span>}</span>
                              <div className="flex gap-2">
                                {/* Model */}
                                <select 
                                  required
                                  className="flex-1 border border-gray-300 rounded p-1 text-xs"
                                  value={pItem.productId}
                                  onChange={(e) => {
                                    const newItems = [...packItems];
                                    newItems[idx] = { ...newItems[idx], productId: e.target.value, colorId: '', size: '' };
                                    setPackItems(newItems);
                                  }}
                                >
                                  {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>

                                {/* Color */}
                                {prodColors.length > 0 && (
                                  <select 
                                    required
                                    className="w-24 border border-gray-300 rounded p-1 text-xs"
                                    value={pItem.colorId}
                                    onChange={(e) => {
                                      const newItems = [...packItems];
                                      newItems[idx] = { ...newItems[idx], colorId: e.target.value, size: '' };
                                      setPackItems(newItems);
                                    }}
                                  >
                                    <option value="">Couleur</option>
                                    {prodColors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                )}

                                {/* Size */}
                                {prodSizes.length > 0 && (
                                  <select 
                                    required
                                    className="w-16 border border-gray-300 rounded p-1 text-xs"
                                    value={pItem.size}
                                    onChange={(e) => {
                                      const newItems = [...packItems];
                                      newItems[idx] = { ...newItems[idx], size: e.target.value };
                                      setPackItems(newItems);
                                    }}
                                  >
                                    <option value="">Taille</option>
                                    {prodSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </label>
                </div>

                {/* Subtotals */}
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 3}.00 dh</span>
                  </div>
                  {selectedOffer === 'pack' && (
                    <div className="flex justify-between text-red-500">
                      <span>Remise</span>
                      <span>-{product.salePrice || product.price}.00 dh</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 mb-2">
                    <span>Livraison</span>
                    <span>Gratuit</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
                    <span>Total</span>
                    <span>{selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 2}.00 dh</span>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    <input 
                      type="text" 
                      required
                      placeholder="الاسم الكامل / Nom complet" 
                      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 text-right"
                      value={checkoutForm.name}
                      onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                    <input 
                      type="tel" 
                      required
                      placeholder="رقم الهاتف / Téléphone" 
                      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 text-right"
                      value={checkoutForm.phone}
                      onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </span>
                    <input 
                      type="text" 
                      required
                      placeholder="العنوان / Adresse" 
                      className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 text-right"
                      value={checkoutForm.address}
                      onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#1da025] hover:bg-[#15801b] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
                  {isSubmitting ? 'Traitement...' : `Commandez maintenant - ${selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 2}.00 dh`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
