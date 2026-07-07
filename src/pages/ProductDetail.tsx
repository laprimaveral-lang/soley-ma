import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ChevronRight, Check, Play, Star, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { ProductService, OrderService, ReviewService, getMediaUrl } from '../services/api';

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

  // Image Zoom & Video states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Recently Viewed & Reviews states
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    
    // Check login status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get recently viewed list
    const localRecentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(localRecentlyViewed);

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

        // Save to recently viewed
        const currentItem = {
          id: foundProduct.id,
          name: foundProduct.name,
          price: foundProduct.price,
          salePrice: foundProduct.salePrice,
          slug: foundProduct.slug,
          images: foundProduct.images
        };
        const updatedRecently = [currentItem, ...localRecentlyViewed.filter((item: any) => item.id !== foundProduct.id)].slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecently));
        setRecentlyViewed(updatedRecently);

        // Fetch reviews
        ReviewService.getReviews(foundProduct.id)
          .then(res => setReviews(res))
          .catch(err => console.error('Failed to load reviews:', err));
      }
      const related = products.filter((p: any) => p.categoryId === foundProduct?.categoryId && p.id !== foundProduct?.id).slice(0, 4);
      setRelatedProducts(related);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await ReviewService.createReview(product.id, newRating, newComment);
      const updated = await ReviewService.getReviews(product.id);
      setReviews(updated);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de l'avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
                <div 
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  className="flex-1 bg-[#F5F5F0] aspect-[3/4] md:aspect-[4/5] relative overflow-hidden cursor-zoom-in"
                >
                  <img 
                    src={mainImage} 
                    style={{
                      transform: isZoomed ? 'scale(2)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                    className="w-full h-full object-cover transition-transform duration-100 ease-out" 
                    alt={product.name} 
                  />
                  <div className="absolute top-6 left-6 flex gap-3">
                    {product.isNew && <span className="bg-black text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase">Nouveau</span>}
                  </div>
                  {product.videoUrl && (
                    <button 
                      onClick={() => setIsVideoModalOpen(true)}
                      className="absolute bottom-6 right-6 bg-white hover:bg-black hover:text-white text-black p-3.5 rounded-full shadow-lg transition-colors flex items-center justify-center"
                      title="Regarder la vidéo"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  )}
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

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 1 && (
          <div className="mt-32 pt-20 border-t border-[#ECECEC]">
            <h2 className="text-xl lg:text-3xl font-serif text-center mb-16 text-black">Produits consultés récemment</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recentlyViewed
                .filter((p: any) => p.id !== product.id)
                .map((p: any) => (
                  <div key={p.id} className="group relative">
                    <Link to={`/products/${p.slug}`}>
                      <div className="aspect-[3/4] bg-[#F5F5F0] overflow-hidden mb-4">
                        {p.images && p.images.length > 0 ? (
                          <img 
                            src={getMediaUrl(p.images[0].image)} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt={p.name} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Soley</div>
                        )}
                      </div>
                      <h3 className="text-xs font-bold tracking-widest uppercase mb-1 truncate text-black">{p.name}</h3>
                      <p className="text-xs text-gray-500 font-light">{p.price} MAD</p>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-32 pt-20 border-t border-[#ECECEC] font-sans">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl lg:text-3xl font-serif text-center mb-4 text-black">Avis de nos clientes</h2>
            
            {/* Summary Score */}
            <div className="flex flex-col items-center justify-center mb-12">
              <div className="flex items-center gap-2 text-2xl font-serif text-black mb-1">
                {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                <span className="text-sm text-gray-400">/ 5</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5;
                  return (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-[#FFC20E] text-[#FFC20E]' : 'text-gray-200'}`} 
                    />
                  );
                })}
              </div>
              <span className="text-xs text-gray-400 font-bold tracking-wider uppercase">({reviews.length} {reviews.length > 1 ? 'avis' : 'avis'})</span>
            </div>

            {/* Review List */}
            <div className="space-y-8 mb-16">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="pb-6 border-b border-[#F2F2F2]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                          {rev.customer?.name || 'Cliente anonyme'}
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-[#FFC20E] text-[#FFC20E]' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(rev.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-light leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 font-light text-sm py-8 font-sans">Aucun avis pour l'instant. Soyez la première à donner votre avis !</p>
              )}
            </div>

            {/* Write a Review */}
            {isLoggedIn ? (
              <form onSubmit={handleAddReview} className="bg-gray-50 p-8 rounded-lg border border-gray-100">
                <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">Partager votre avis</h3>
                
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Note :</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-6 h-6 ${star <= newRating ? 'fill-[#FFC20E] text-[#FFC20E]' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="comment" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Commentaire :</label>
                  <textarea
                    id="comment"
                    required
                    rows={4}
                    placeholder="Votre avis sur la qualité, la pointure, le confort..."
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-1 focus:ring-black focus:border-black font-sans bg-white text-gray-800"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="bg-black hover:bg-gray-900 text-white text-xs font-bold tracking-widest uppercase px-6 py-3 transition-colors disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Envoi...' : 'Soumettre mon avis'}
                </button>
              </form>
            ) : (
              <div className="text-center bg-gray-50 p-8 border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 font-light mb-4 font-sans">Vous devez être connectée pour soumettre un avis.</p>
                <Link 
                  to="/login" 
                  className="inline-block border border-black hover:bg-black hover:text-white transition-colors text-xs font-bold tracking-widest uppercase px-6 py-3"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* VIDEO MODAL */}
      {isVideoModalOpen && product.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-95">
          <div className="relative w-full max-w-4xl aspect-video bg-black flex items-center justify-center">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <X className="w-5 h-5" /> Fermer
            </button>
            {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
              <iframe
                src={product.videoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                title="Product Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={product.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full max-h-[80vh] object-contain"
              ></video>
            )}
          </div>
        </div>
      )}

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
