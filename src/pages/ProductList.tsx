import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, SearchX } from 'lucide-react';
import { ProductService, CategoryService } from '../services/api';
import FadeUp from '../components/animations/FadeUp';

export default function ProductList() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (category && category !== 'nouveau' && category !== 'all') params.category = category;
    if (category === 'nouveau') params.isNew = 'true';
    if (searchQuery) params.search = searchQuery;

    Promise.all([ProductService.getProducts(params), CategoryService.getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, searchQuery]);

  const categoryName = searchQuery 
    ? `Résultats pour "${searchQuery}"`
    : category === 'nouveau' 
    ? 'NOUVELLE COLLECTION' 
    : categories.find(c => c.slug === category)?.name || 'COLLECTION';

  return (
    <div className="bg-white min-h-screen pt-48 pb-32">
      <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
        {/* Header */}
        <FadeUp className="text-center mb-24 mt-12">
          <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">{categoryName}</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
            Découvrez notre sélection exclusive conçue pour allier confort absolu et élégance intemporelle.
          </p>
        </FadeUp>

        {/* Toolbar */}
        <FadeUp delay={0.2} className="flex justify-between items-center py-6 border-y border-[#ECECEC] mb-16 bg-white">
          <button className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase hover:text-gray-500 transition-colors">
            <Filter className="w-4 h-4 stroke-1" /> Filtres
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase hidden md:inline">Trier par :</span>
            <button className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase hover:text-gray-500 transition-colors">
              Recommandé <ChevronDown className="w-4 h-4 stroke-1" />
            </button>
          </div>
        </FadeUp>

        {loading ? (
          <div className="text-center py-32 text-[10px] tracking-widest uppercase text-gray-400">
            Chargement...
          </div>
        ) : products.length === 0 ? (
          <FadeUp className="text-center py-32 max-w-2xl mx-auto">
            <SearchX className="mx-auto w-12 h-12 stroke-1 text-gray-300 mb-6" />
            <h3 className="text-sm font-bold mb-4 tracking-[0.2em] uppercase">Aucun résultat</h3>
            <p className="text-gray-500 text-sm">Nous n'avons trouvé aucune pièce correspondant à votre sélection.</p>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {products.map((p, idx) => (
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
