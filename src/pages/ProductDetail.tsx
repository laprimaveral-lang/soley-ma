import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ChevronRight, Check, Play, Star, X, Share2, Info, RefreshCw } from 'lucide-react';
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
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mainImage, setMainImage] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { addToCart } = useCart();

  // Touch Swipe for mobile gallery
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Image Zoom & Video states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Tabs & Share
  const [activeTab, setActiveTab] = useState<'description' | 'composition' | 'livraison' | 'retours' | 'avis'>('description');
  const [isCopied, setIsCopied] = useState(false);

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
  const [packItems, setPackItems] = useState<any[]>([
    { productId: '', colorId: '', size: '' },
    { productId: '', colorId: '', size: '' },
    { productId: '', colorId: '', size: '' }
  ]);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback high-quality curated product images for realistic rendering
  const fallbackColorImages: { [key: string]: string } = {
    'Noir': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    'Blanc': 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    'Beige': 'https://images.unsplash.com/photo-1515347619252-60a4bf4eff4c?auto=format&fit=crop&w=800&q=80',
    'Tabac': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    'Grenat': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    'Or': 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    'Argent': 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
    'Rose Gold': 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    'Camel': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
  };

  const getProductImages = (prod: any = product, activeColor: any = selectedColor) => {
    if (!prod) return [];
    const imgs = [...(prod.images || [])].map((img: any) => getMediaUrl(img.image));
    const colorName = activeColor?.name;
    const specImg = colorName ? fallbackColorImages[colorName] : null;
    if (specImg && !imgs.includes(specImg)) {
      imgs.unshift(specImg);
    }
    return imgs;
  };

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('customerToken');
    setIsLoggedIn(!!token);

    const localRecentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(localRecentlyViewed);

    ProductService.getProducts().then(products => {
      setAllProducts(products);
      const foundProduct = products.find((p: any) => p.id === id || p.slug === id) || products[0];
      setProduct(foundProduct);

      if (foundProduct) {
        const productColors = Array.from(new Map(foundProduct.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
        if (productColors.length > 0) {
          setSelectedColor(productColors[0]);
        }

        const imgs = getProductImages(foundProduct, productColors[0]);
        if (imgs.length > 0) {
          setMainImage(imgs[0]);
          setActiveImageIdx(0);
        }

        setSelectedSize(null);

        setPackItems([
          { productId: foundProduct.id, colorId: '', size: '' },
          { productId: foundProduct.id, colorId: '', size: '' },
          { productId: foundProduct.id, colorId: '', size: '' }
        ]);

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

        ReviewService.getReviews(foundProduct.id)
          .then(res => setReviews(res))
          .catch(err => console.error('Failed to load reviews:', err));
      }
      const related = products.filter((p: any) => p.categoryId === foundProduct?.categoryId && p.id !== foundProduct?.id).slice(0, 4);
      setRelatedProducts(related);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (selectedColor) {
      const imgs = getProductImages();
      if (imgs.length > 0) {
        setMainImage(imgs[0]);
        setActiveImageIdx(0);
      }
    }
  }, [selectedColor]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    const imgs = getProductImages();

    if (diff > 50) { // Swipe Left -> Next
      setActiveImageIdx(prev => (prev + 1) % imgs.length);
      setMainImage(imgs[(activeImageIdx + 1) % imgs.length]);
      setTouchStart(null);
    } else if (diff < -50) { // Swipe Right -> Prev
      setActiveImageIdx(prev => (prev - 1 + imgs.length) % imgs.length);
      setMainImage(imgs[(activeImageIdx - 1 + imgs.length) % imgs.length]);
      setTouchStart(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
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
    const productColors = Array.from(new Map(product.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
    if (productColors.length > 0 && !selectedColor) {
      alert("Veuillez sélectionner une couleur");
      return;
    }
    if (!selectedSize) {
      alert("Veuillez sélectionner une pointure");
      return;
    }
    addToCart({
      product,
      quantity,
      selectedColor: selectedColor?.name,
      selectedSize: String(selectedSize)
    });
    navigate('/cart');
  };

  const handleExpressOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let items = [];
    if (selectedOffer === 'single') {
      const variant = product.variants?.find((v: any) => 
        (selectedColor ? v.color?.id === selectedColor.id : true) && 
        (selectedSize ? v.size?.value === selectedSize : true)
      ) || product.variants?.[0] || { id: product.id };
      
      items.push({
        productVariantId: variant.id,
        quantity: 1,
        price: product.salePrice || product.price
      });
    } else {
      for (let i = 0; i < 3; i++) {
        const pItem = packItems[i];
        const selectedProd = allProducts.find(p => p.id === pItem.productId) || product;
        const matchingVariant = selectedProd.variants?.find((v: any) => v.color?.id === pItem.colorId && v.size?.value === pItem.size) || selectedProd.variants?.[0] || { id: selectedProd.id };
        
        items.push({
          productVariantId: matchingVariant.id,
          quantity: 1,
          price: i === 2 ? 0 : (selectedProd.salePrice || selectedProd.price)
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
        items
      });

      if (res) {
        setIsCheckoutModalOpen(false);
        alert('Votre commande a été confirmée avec succès !');
        navigate('/');
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
  const allSizes = ['36', '37', '38', '39', '40', '41'];
  
  // Find currently active variant matching both selected size and color
  const activeVariant = product.variants?.find((v: any) => 
    (selectedColor ? v.color?.id === selectedColor.id : true) && 
    (selectedSize ? v.size?.value === selectedSize : true)
  );

  const displayedPrice = activeVariant?.price || product.price;
  const displayedSalePrice = activeVariant?.salePrice || product.salePrice;
  const promotion = displayedSalePrice && displayedSalePrice < displayedPrice;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;

  const productImages = getProductImages();

  return (
    <div className="bg-[#FCFCFC] min-h-screen text-gray-900 font-sans pt-40 pb-20">
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
          
          {/* Gallery */}
          <div className="w-full lg:w-3/5 flex flex-col gap-4">
            {productImages.length > 0 ? (
              <div className="flex flex-col gap-4">
                {/* Main Large Image */}
                <div 
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  className="w-full bg-[#F5F5F0] aspect-[3/4] md:aspect-[4/5] relative overflow-hidden cursor-zoom-in rounded-2xl shadow-soft"
                >
                  <img 
                    src={mainImage} 
                    style={{
                      transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                    className="w-full h-full object-cover transition-transform duration-100 ease-out" 
                    alt={product.name} 
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.isNew && <span className="bg-black text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm">Nouveau</span>}
                    {promotion && <span className="bg-red-500 text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm">Promo</span>}
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

                {/* Thumbnails below */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {productImages.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setMainImage(img);
                        setActiveImageIdx(idx);
                      }}
                      className={`flex-shrink-0 w-20 aspect-[3/4] border-2 transition-all rounded-lg overflow-hidden ${activeImageIdx === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`${product.name} thumbnail ${idx}`} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square bg-[#F5F5F0] flex flex-col items-center justify-center text-gray-300 rounded-2xl">
                <span className="text-xs uppercase tracking-widest">Soley</span>
              </div>
            )}
          </div>

          {/* Sticky Purchase Panel - Right Panel */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 pb-32">
            
            <div className="mb-8">
              <h1 className="text-3xl font-serif tracking-wide mb-3 text-black uppercase">{product.name}</h1>
              
              <div className="flex items-center gap-4 text-sm tracking-widest uppercase">
                {promotion ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-red-600">{displayedSalePrice.toFixed(2)} MAD</span>
                    <span className="text-base text-gray-400 line-through font-light">{displayedPrice.toFixed(2)} MAD</span>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 text-[9px] font-bold rounded">
                      -{Math.round(((displayedPrice - displayedSalePrice) / displayedPrice) * 100)}%
                    </span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-black">{displayedPrice.toFixed(2)} MAD</p>
                )}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-xs text-gray-600 border-y border-[#ECECEC] py-6">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> 100% Cuir original</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Cousu main de maître</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Offre 2+1 Gratuite 🎁</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Satisfait ou remboursé</div>
            </div>

            <div className="space-y-8">

              {/* COLORS SELECTION */}
              {colors.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-[0.1em] text-gray-800 uppercase">Couleurs</span>
                    <span className="text-xs text-gray-400 font-medium">{selectedColor?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {colors.map((color: any) => {
                      const isSelected = selectedColor?.id === color.id;
                      return (
                        <button 
                          type="button" 
                          key={color.id}
                          onClick={() => setSelectedColor(color)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 bg-white
                            ${isSelected ? 'border-black ring-1 ring-black shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs font-bold text-gray-800">{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* POINTURES (SIZES) SELECTION */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-800">Pointure</span>
                  <button type="button" className="text-[10px] text-gray-500 underline underline-offset-4 tracking-widest hover:text-black transition-colors uppercase font-bold">Guide des tailles</button>
                </div>
                
                <div className="grid grid-cols-6 gap-3">
                  {allSizes.map(sz => {
                    // Find variant for selected color and this size value
                    const matchingVar = product.variants?.find((v: any) => 
                      (selectedColor ? v.color?.id === selectedColor.id : true) && v.size?.value === sz
                    );
                    const isAvailable = matchingVar && matchingVar.stock > 0;
                    const isSelected = selectedSize === sz;

                    return (
                      <button
                        type="button"
                        key={sz}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-full aspect-square text-xs font-bold uppercase flex flex-col items-center justify-center border transition-all duration-300 rounded-md
                          ${!isAvailable 
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-30 line-through' 
                            : isSelected 
                              ? 'bg-black text-white border-black shadow-md transform -translate-y-0.5' 
                              : 'bg-white text-black border-gray-200 hover:border-black'}`}
                      >
                        <span>{sz}</span>
                        <span className="text-[9px] mt-0.5">{isAvailable ? '✔' : '✖'}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stock Indicator */}
                {selectedSize && (
                  <div className="mt-4 flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Info size={14} className="text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-600">
                      {currentStock > 5 ? (
                        <span className="text-green-600">Stock disponible ({currentStock} paires)</span>
                      ) : currentStock > 0 ? (
                        <span className="text-orange-500">Stock très limité ! (Plus que {currentStock} paires)</span>
                      ) : (
                        <span className="text-red-500">Rupture de stock pour cette pointure</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 space-y-4">
                <div className="flex gap-4">
                  {/* Add to Cart */}
                  <button 
                    type="button" 
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#ECECEC] hover:bg-gray-200 text-black text-xs font-bold tracking-widest uppercase transition-all duration-300 py-4.5 px-6 rounded-xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} />
                    Ajouter au panier
                  </button>

                  {/* Wishlist */}
                  <button 
                    type="button" 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-14 h-14 flex items-center justify-center border border-gray-200 hover:border-black transition-all duration-500 rounded-xl bg-white"
                  >
                    <Heart className={`w-5 h-5 stroke-1 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500 border-transparent' : 'text-black'}`} />
                  </button>
                  
                  {/* Share */}
                  <button 
                    type="button" 
                    onClick={handleShare}
                    className="w-14 h-14 flex items-center justify-center border border-gray-200 hover:border-black transition-all duration-500 rounded-xl bg-white relative"
                    title="Partager"
                  >
                    <Share2 className="w-5 h-5 stroke-1 text-black" />
                    {isCopied && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
                        Copié !
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Buy Now (Express Order Checkout) */}
                <button 
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="w-full bg-[#28a745] hover:bg-[#218838] text-white rounded-xl transition-all duration-300 py-4 flex flex-col items-center justify-center gap-0.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
                    Commander maintenant
                  </div>
                  <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">
                    Paiement à la livraison + Livraison Gratuite
                  </div>
                </button>
              </div>

              {/* Delivery info */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-[#ECECEC]">
                 <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 stroke-1 text-black" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">Livraison 24/48h</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 stroke-1 text-black" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-600">Échange & Retour 7j</span>
                 </div>
              </div>

              {/* TABBED SECTIONS */}
              <div className="font-sans">
                {/* Tabs Headers */}
                <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none">
                  {['description', 'composition', 'livraison', 'retours', 'avis'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`py-4 px-4 text-[10px] font-bold tracking-widest uppercase border-b-2 transition-all
                        ${activeTab === tab 
                          ? 'border-black text-black' 
                          : 'border-transparent text-gray-400 hover:text-black'}`}
                    >
                      {tab === 'avis' ? `Avis (${reviews.length})` : tab}
                    </button>
                  ))}
                </div>

                {/* Tabs Contents */}
                <div className="py-6">
                  {activeTab === 'description' && (
                    <div className="text-sm text-gray-500 leading-loose font-light">
                      <p className="mb-4">{product.description}</p>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold">RÉFÉRENCE: {product.reference}</p>
                    </div>
                  )}

                  {activeTab === 'composition' && (
                    <div className="text-sm text-gray-500 leading-loose font-light">
                      <p>{product.material || "100% Cuir véritable de haute qualité. Finition soignée. Semelle intérieure matelassée pour un confort optimal."}</p>
                      <p className="mt-2 text-xs text-gray-400">Pour nettoyer, frotter délicatement avec un chiffon sec ou légèrement humide et appliquer un lait de soin pour cuir.</p>
                    </div>
                  )}

                  {activeTab === 'livraison' && (
                    <div className="text-sm text-gray-500 leading-loose font-light space-y-2">
                      <p><strong className="font-bold text-black">Livraison au Maroc :</strong> Expédition express sous 24h à 48h. Livraison gratuite sur l'ensemble des commandes.</p>
                      <p><strong className="font-bold text-black">Paiement :</strong> Option Cash on Delivery (Paiement en espèces lors de la livraison).</p>
                    </div>
                  )}

                  {activeTab === 'retours' && (
                    <div className="text-sm text-gray-500 leading-loose font-light">
                      <p>Échanges ou retours acceptés dans un délai de 7 jours après réception de la commande. Les articles doivent être retournés non portés et dans leur emballage d'origine complet.</p>
                    </div>
                  )}

                  {activeTab === 'avis' && (
                    <div className="space-y-6">
                      {/* Summary Score */}
                      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                        <div className="flex items-center gap-2 text-2xl font-serif text-black mb-1 font-bold">
                          {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                          <span className="text-sm text-gray-400 font-normal">/ 5</span>
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
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">({reviews.length} avis clientes)</span>
                      </div>

                      {/* Review List */}
                      <div className="space-y-6">
                        {reviews.length > 0 ? (
                          reviews.map((rev) => (
                            <div key={rev.id} className="pb-6 border-b border-[#F2F2F2]">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-black block mb-1">
                                    {rev.customer?.name || 'Cliente vérifiée'}
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
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                  {new Date(rev.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 font-light leading-relaxed">{rev.comment}</p>
                              
                              {/* Customer lifestyle photos mock for premium feel */}
                              <div className="flex gap-2 mt-3">
                                <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=80&h=80&q=60" className="w-12 h-12 object-cover rounded-md border border-gray-100" alt="review photo 1" />
                                <img src="https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=80&h=80&q=60" className="w-12 h-12 object-cover rounded-md border border-gray-100" alt="review photo 2" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-400 font-light text-xs py-4">Aucun avis pour le moment.</p>
                        )}
                      </div>

                      {/* Write Review Form */}
                      {isLoggedIn ? (
                        <form onSubmit={handleAddReview} className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8">
                          <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">Donner votre avis</h3>
                          
                          <div className="mb-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Note :</span>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewRating(star)}
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star className={`w-6 h-6 ${star <= newRating ? 'fill-[#FFC20E] text-[#FFC20E]' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <label htmlFor="comment" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Commentaire :</label>
                            <textarea
                              id="comment"
                              required
                              rows={3}
                              placeholder="Votre avis sur la pointure, le confort, la qualité..."
                              className="w-full border border-gray-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="bg-black hover:bg-gray-900 text-white text-[10px] font-bold tracking-widest uppercase px-6 py-3 transition-colors disabled:opacity-50 rounded"
                          >
                            {isSubmittingReview ? 'Envoi...' : 'Envoyer mon avis'}
                          </button>
                        </form>
                      ) : (
                        <div className="text-center bg-gray-50 p-6 border border-gray-100 rounded-xl mt-6">
                          <p className="text-xs text-gray-500 font-light mb-3">Connectez-vous pour rédiger un avis.</p>
                          <Link to="/login" className="inline-block border border-black hover:bg-black hover:text-white transition-colors text-[9px] font-bold tracking-widest uppercase px-5 py-2.5 rounded">
                            Se connecter
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-32 pt-20 border-t border-[#ECECEC]">
          <h2 className="text-xl lg:text-3xl font-serif text-center mb-16 text-black font-semibold">Produits Similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {relatedProducts.length > 0 ? (
              relatedProducts.map(p => <ProductCard key={p.id} {...p} />)
            ) : (
              <div className="col-span-4 text-center text-gray-400 py-10 font-light tracking-widest uppercase text-xs">Aucun produit similaire</div>
            )}
          </div>
        </div>

        {/* You may also like */}
        <div className="mt-24 pt-20 border-t border-[#ECECEC]">
          <h2 className="text-xl lg:text-3xl font-serif text-center mb-16 text-black font-semibold">Vous Aimerez Aussi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {allProducts.slice(0, 4).map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </div>

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 1 && (
          <div className="mt-24 pt-20 border-t border-[#ECECEC]">
            <h2 className="text-xl lg:text-3xl font-serif text-center mb-16 text-black font-semibold font-semibold">Consultés Récemment</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {recentlyViewed
                .filter((p: any) => p.id !== product.id)
                .map((p: any) => (
                  <div key={p.id} className="group relative">
                    <Link to={`/product/${p.id}`}>
                      <div className="aspect-[3/4] bg-[#F5F5F0] overflow-hidden mb-4 rounded-xl">
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
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
              <h3 className="font-bold text-gray-800 text-center flex-1">Remplissez le formulaire pour commander</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <form onSubmit={handleExpressOrder} className="space-y-4">
                
                {/* Offer Selection */}
                <div className="space-y-2">
                  <label 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedOffer === 'single' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
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
                      <div className="font-bold text-sm text-gray-800">Commander 1 Paire</div>
                      <div className="text-[9px] text-green-600 font-bold uppercase tracking-wider">Livraison Offerte</div>
                    </div>
                    <div className="font-bold text-red-600">{(product.salePrice || product.price)}.00 dh</div>
                  </label>

                  <label 
                    className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-colors ${selectedOffer === 'pack' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
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
                        <div className="font-bold text-sm text-gray-800">Offre Spéciale : 2 + 1 Offerte 🎁</div>
                        <div className="text-[9px] text-white bg-orange-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block">Populaire</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 line-through">{(product.salePrice || product.price) * 3}.00 dh</div>
                        <div className="font-bold text-red-600">{(product.salePrice || product.price) * 2}.00 dh</div>
                      </div>
                    </div>

                    {/* Pack Items Selection */}
                    {selectedOffer === 'pack' && (
                      <div className="mt-2 space-y-3 bg-white p-3 rounded-lg border border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Choisissez vos 3 paires :</div>
                        {[0, 1, 2].map(idx => {
                          const pItem = packItems[idx];
                          const selectedProd = allProducts.find(p => p.id === pItem.productId) || product;
                          const prodColors = Array.from(new Map(selectedProd.variants?.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];
                          const prodSizes = Array.from(new Set(selectedProd.variants?.filter((v: any) => (pItem.colorId ? v.color?.id === pItem.colorId : true)).map((v: any) => v.size?.value))).filter(Boolean) as string[];

                          return (
                            <div key={idx} className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Paire {idx + 1} {idx === 2 && <span className="text-orange-500">(Cadeau 🎁)</span>}</span>
                              <div className="flex gap-2">
                                <select 
                                  required
                                  className="flex-1 border border-gray-300 rounded p-1 text-[11px]"
                                  value={pItem.productId}
                                  onChange={(e) => {
                                    const newItems = [...packItems];
                                    newItems[idx] = { ...newItems[idx], productId: e.target.value, colorId: '', size: '' };
                                    setPackItems(newItems);
                                  }}
                                >
                                  {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>

                                {prodColors.length > 0 && (
                                  <select 
                                    required
                                    className="w-24 border border-gray-300 rounded p-1 text-[11px]"
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

                                {prodSizes.length > 0 && (
                                  <select 
                                    required
                                    className="w-16 border border-gray-300 rounded p-1 text-[11px]"
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
                <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 3}.00 dh</span>
                  </div>
                  {selectedOffer === 'pack' && (
                    <div className="flex justify-between text-red-500">
                      <span>Remise Pack</span>
                      <span>-{product.salePrice || product.price}.00 dh</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 mb-2">
                    <span>Livraison</span>
                    <span className="text-green-600 font-semibold">Gratuite</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-sm pt-1">
                    <span>Total</span>
                    <span>{selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 2}.00 dh</span>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3">
                  <input 
                    type="text" 
                    required
                    placeholder="Nom complet" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
                    value={checkoutForm.name}
                    onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                  />
                  <input 
                    type="tel" 
                    required
                    placeholder="Téléphone" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
                    value={checkoutForm.phone}
                    onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                  />
                  <input 
                    type="text" 
                    required
                    placeholder="Adresse de livraison" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-black focus:border-black bg-white text-gray-800"
                    value={checkoutForm.address}
                    onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                  {isSubmitting ? 'Confirmation...' : `Confirmer Commande - ${selectedOffer === 'single' ? (product.salePrice || product.price) : (product.salePrice || product.price) * 2}.00 dh`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
