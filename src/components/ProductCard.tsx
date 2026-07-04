import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ id, name, price, salePrice, images = [], isNew, isBestSeller, variants = [] }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v: any) => v.size?.value))).filter(Boolean);
  const colors = Array.from(new Map(variants.map((v: any) => [v.color?.id, v.color])).values()).filter(Boolean);

  const mainImage = images.length > 0 ? `http://localhost:3001${images[0].image}` : '';
  const promotion = salePrice && salePrice < price;

  return (
    <div 
      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-soft relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {isNew && <span className="bg-black text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded">Nouveau</span>}
        {isBestSeller && <span className="bg-primary text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded">Iconique</span>}
        {promotion && <span className="bg-red-500 text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded">-{Math.round(((price - salePrice) / price) * 100)}%</span>}
      </div>

      <button type="button" 
        onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
        className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full backdrop-blur-sm transition-all duration-500 hover:bg-white hover:scale-110"
      >
        <Heart size={16} className={`stroke-1 transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-black'}`} />
      </button>

      <Link to={`/product/${id}`} className="block w-full bg-[#F5F5F0] aspect-[3/4] relative overflow-hidden">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={name} 
            className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.25,0.1,0.25,1] ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <span className="text-[10px] uppercase tracking-widest">Soley</span>
          </div>
        )}

        {/* Sizes Preview Overlay on Hover */}
        <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/80 to-transparent transition-all duration-500 transform flex flex-col items-center ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex gap-2 justify-center mb-3">
            {sizes.slice(0, 5).map((size: any) => (
              <span key={size?.id || size} className="text-[10px] font-bold border-b border-black text-black">
                {size?.value || size}
              </span>
            ))}
            {sizes.length > 5 && <span className="text-[10px] text-gray-500">+{sizes.length - 5}</span>}
          </div>
          <button type="button" className="w-full bg-black text-white py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-gray-800 transition-colors">
            Ajout Rapide
          </button>
        </div>
      </Link>

      <div className="w-full p-6 text-center bg-white flex flex-col items-center">
        {colors.length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {colors.map((c: any) => (
              <span 
                key={c.id} 
                className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" 
                style={{ backgroundColor: c.hex }} 
                title={c.name}
              />
            ))}
          </div>
        )}
        <h3 className="text-xs font-bold tracking-widest mb-2 uppercase text-gray-900 group-hover:text-gray-500 transition-colors">{name}</h3>
        <div className="flex gap-3 items-center justify-center text-xs tracking-wider">
          {promotion ? (
            <>
              <span className="text-red-600 font-bold">{salePrice.toFixed(2)} MAD</span>
              <span className="text-gray-400 line-through">{price.toFixed(2)} MAD</span>
            </>
          ) : (
            <span className="text-black font-bold">{price.toFixed(2)} MAD</span>
          )}
        </div>
      </div>
    </div>
  );
}
