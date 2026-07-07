import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, SearchX, X, Check } from 'lucide-react';
import { ProductService, CategoryService, SizeService, ColorService } from '../services/api';
import FadeUp from '../components/animations/FadeUp';

export default function ProductList() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1200);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (category && category !== 'nouveau' && category !== 'all') params.category = category;
    if (category === 'nouveau') params.isNew = 'true';
    if (searchQuery) params.search = searchQuery;

    Promise.all([
      ProductService.getProducts(params),
      CategoryService.getCategories(),
      SizeService.getSizes(),
      ColorService.getColors()
    ])
      .then(([productsData, categoriesData, sizesData, colorsData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setSizes(sizesData);
        setColors(colorsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, searchQuery]);

  const toggleSize = (sizeVal: string) => {
    setSelectedSizes(prev => 
      prev.includes(sizeVal) ? prev.filter(s => s !== sizeVal) : [...prev, sizeVal]
    );
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter(p => {
      // Price Filter
      const actualPrice = p.salePrice || p.price;
      if (actualPrice > priceRange) return false;

      // Size Filter
      if (selectedSizes.length > 0) {
        const hasSize = p.variants?.some((v: any) => v.size && selectedSizes.includes(v.size.value));
        if (!hasSize) return false;
      }

      // Color Filter
      if (selectedColors.length > 0) {
        const hasColor = p.variants?.some((v: any) => v.colorId && selectedColors.includes(v.colorId));
        if (!hasColor) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0; // Default recommended
    });

  const categoryName = searchQuery 
    ? `Résultats pour "${searchQuery}"`
    : category === 'nouveau' 
    ? 'NOUVELLE COLLECTION' 
    : categories.find(c => c.slug === category)?.name || 'COLLECTION';

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(1200);
  };

  return (
    <div className="bg-white min-h-screen pt-48 pb-32">
      <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
        {/* Header */}
        <FadeUp className="text-center mb-16 mt-12">
          <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">{categoryName}</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Découvrez notre sélection exclusive conçue pour allier confort absolu et élégance intemporelle.
          </p>
        </FadeUp>

        {/* Toolbar */}
        <FadeUp delay={0.2} className="flex justify-between items-center py-6 border-y border-[#ECECEC] mb-8 bg-white relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase hover:text-gray-500 transition-colors ${showFilters ? 'text-black' : 'text-gray-500'}`}
          >
            <Filter className="w-4 h-4 stroke-1" /> {showFilters ? 'Masquer Filtres' : 'Filtres'}
            {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange < 1200) && (
              <span className="w-2 h-2 rounded-full bg-black"></span>
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase hover:text-gray-500 transition-colors"
            >
              {sortBy === 'recommended' ? 'Recommandé' :
               sortBy === 'price-asc' ? 'Prix croissant' :
               sortBy === 'price-desc' ? 'Prix décroissant' : 'Nouveautés'}
              <ChevronDown className="w-4 h-4 stroke-1" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-[#ECECEC] shadow-xl z-20 font-sans">
                <button 
                  onClick={() => { setSortBy('recommended'); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold tracking-wider uppercase hover:bg-gray-50 transition-colors"
                >
                  Recommandé
                </button>
                <button 
                  onClick={() => { setSortBy('price-asc'); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold tracking-wider uppercase hover:bg-gray-50 transition-colors"
                >
                  Prix croissant
                </button>
                <button 
                  onClick={() => { setSortBy('price-desc'); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold tracking-wider uppercase hover:bg-gray-50 transition-colors"
                >
                  Prix décroissant
                </button>
                <button 
                  onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-bold tracking-wider uppercase hover:bg-gray-50 transition-colors"
                >
                  Nouveautés
                </button>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <FadeUp delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-[#ECECEC] mb-16">
            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">Prix Maximum : {priceRange} MAD</h4>
              <input 
                type="range" 
                min="0" 
                max="1200" 
                step="50"
                value={priceRange} 
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-black cursor-pointer bg-gray-200 h-1 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-2">
                <span>0 MAD</span>
                <span>1200 MAD</span>
              </div>
            </div>

            {/* Sizes Filter */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">Pointures</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSize(s.value)}
                    className={`w-10 h-10 border text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all ${
                      selectedSizes.includes(s.value)
                        ? 'bg-black text-white border-black'
                        : 'border-[#ECECEC] hover:border-black text-gray-700'
                    }`}
                  >
                    {s.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-black">Couleurs</h4>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleColor(c.id)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-8 h-8 rounded-full border shadow-sm relative transition-transform hover:scale-110 ${
                      selectedColors.includes(c.id) ? 'ring-2 ring-black ring-offset-2 scale-110' : 'border-[#ECECEC]'
                    }`}
                    title={c.name}
                  >
                    {selectedColors.includes(c.id) && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto mix-blend-difference" />
                    )}
                  </button>
                ))}
              </div>

              {/* Reset button */}
              {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange < 1200) && (
                <button 
                  onClick={resetFilters}
                  className="mt-8 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Réinitialiser les filtres
                </button>
              )}
            </div>
          </FadeUp>
        )}

        {loading ? (
          <div className="text-center py-32 text-[10px] tracking-widest uppercase text-gray-400">
            Chargement...
          </div>
        ) : filteredProducts.length === 0 ? (
          <FadeUp className="text-center py-32 max-w-2xl mx-auto">
            <SearchX className="mx-auto w-12 h-12 stroke-1 text-gray-300 mb-6" />
            <h3 className="text-sm font-bold mb-4 tracking-[0.2em] uppercase">Aucun résultat</h3>
            <p className="text-gray-500 text-sm">Nous n'avons trouvé aucune pièce correspondant à votre sélection.</p>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filteredProducts.map((p, idx) => (
              <FadeUp key={p.id} delay={0.1 * (idx % 6)}>
                <ProductCard {...p} />
              </FadeUp>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
