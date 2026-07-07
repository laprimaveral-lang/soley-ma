import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { getMediaUrl } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ id, name, price, salePrice, images = [], isNew, variants = [] }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v: any) => v.size?.value))).filter(Boolean) as string[];
  const colors = Array.from(new Map(variants.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean) as any[];

  const mainImage = images.length > 0 ? getMediaUrl(images[0].image) : '';
  const secondImage = images.length > 1 ? getMediaUrl(images[1].image) : mainImage;
  const promotion = salePrice && salePrice < price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select first available variant with stock
    const activeVar = variants.find((v: any) => v.stock > 0) || variants[0];
    addToCart({
      product: { id, name, price, salePrice, images, variants } as any,
      quantity: 1,
      selectedColor: activeVar?.color?.name || '',
      selectedSize: activeVar?.size?.value || ''
    });
  };

  return (
    <div 
      className="group flex flex-col bg-white overflow-hidden transition-all duration-350 relative border border-gray-100 hover:border-gray-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges on top left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {isNew && (
          <span className="bg-black text-white px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-sm shadow-sm">
            Nouveau
          </span>
        )}
        {promotion && (
          <span className="bg-red-500 text-white px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-sm shadow-sm">
            -{Math.round(((price - salePrice) / price) * 100)}%
          </span>
        )}
      </div>

      {/* Heart Wishlist Button on top right */}
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-105 shadow-sm border border-gray-100/50"
      >
        <Heart size={14} className={`stroke-1 transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black'}`} />
      </button>

      {/* Zara Aspect Ratio Product Image */}
      <Link to={`/product/${id}`} className="block w-full bg-gray-50 aspect-[3/4] relative overflow-hidden">
        {mainImage ? (
          <img 
            src={isHovered && secondImage ? secondImage : mainImage} 
            alt={name} 
            className="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-[1.025]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Soley</span>
          </div>
        )}

        {/* Hover Sizes Drawer Overlay */}
        <div className={`absolute inset-x-0 bottom-0 p-3 bg-white/90 backdrop-blur-sm transition-all duration-300 transform flex flex-col items-center border-t border-gray-100 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex gap-1.5 justify-center mb-2">
            {sizes.slice(0, 6).map((size) => (
              <span key={size} className="text-[8px] font-bold bg-white text-gray-800 border border-gray-200 px-1.5 py-0.5 rounded-sm uppercase">
                {size}
              </span>
            ))}
          </div>
          <button 
            type="button" 
            onClick={handleQuickAdd}
            className="w-full bg-black text-white py-2 px-4 rounded font-bold text-[8px] tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={10} />
            Ajout Rapide
          </button>
        </div>
      </Link>

      {/* Zara Style Minimal Text Details */}
      <div className="w-full p-4 bg-white flex flex-col items-start border-t border-gray-50">
        {/* Colors swatches preview */}
        {colors.length > 0 && (
          <div className="flex gap-1.5 mb-2.5">
            {colors.map((c: any) => (
              <span 
                key={c.id} 
                className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-sm flex-shrink-0" 
                style={{ backgroundColor: c.hex }} 
                title={c.name}
              />
            ))}
          </div>
        )}
        
        <h3 className="text-[10px] font-bold tracking-widest mb-1.5 uppercase text-gray-900 truncate w-full hover:text-gray-500 transition-colors">
          {name}
        </h3>
        
        <div className="flex gap-2.5 items-baseline text-[10px] tracking-wider">
          {promotion ? (
            <>
              <span className="text-red-600 font-bold">{salePrice.toFixed(2)} MAD</span>
              <span className="text-gray-400 line-through font-light">{price.toFixed(2)} MAD</span>
            </>
          ) : (
            <span className="text-black font-bold">{price.toFixed(2)} MAD</span>
          )}
        </div>
      </div>
    </div>
  );
}
