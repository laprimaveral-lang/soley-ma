import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useState, useEffect } from 'react';
import { ProductService, BannerService } from '../services/api';
import FadeUp from '../components/animations/FadeUp';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductService.getProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    BannerService.getBanners().then(data => {
      setBanners(data.filter((b: any) => b.active));
    }).catch(console.error);
  }, []);

  // Display only 3 items per row for a more luxurious, spacious feel
  const newProducts = products.filter(p => p.isNew).slice(0, 3);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 3);

  const mainBanner = banners.length > 0 ? banners[0] : {
    title: "SOLEY",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2500&auto=format&fit=crop",
    link: "/collections/nouveau"
  };

  return (
    <div className="bg-white">
      {/* HERO SECTION - LUXURIOUS LEFT-ALIGNED BANNER */}
      <section className="relative h-[90vh] md:h-screen w-full flex items-center justify-start overflow-hidden bg-[#F5F5F0]">
        {/* Large Lifestyle Photography */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95 scale-105 transform transition-transform duration-[10s] hover:scale-100"
          style={{ backgroundImage: `url('${mainBanner.image}')` }}
        ></div>
        
        {/* Subtle dark gradient overlay from left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent"></div>

        <div className="container mx-auto px-6 md:px-12 max-w-[1400px] relative z-10 w-full mt-24">
          <FadeUp className="max-w-xl text-left bg-black/35 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-white/10" duration={1.2}>
            <span className="block text-[11px] font-bold tracking-[0.3em] text-white/90 mb-4 uppercase">
              Collection Printemps / Été
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-2 leading-tight uppercase font-extrabold tracking-wider">
              {mainBanner.title.replace('<br />', ' ')}
            </h1>
            <h2 className="text-lg md:text-xl font-sans text-white/90 mb-6 font-light tracking-wide italic">
              L'élégance à vos pieds
            </h2>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-8 font-light">
              Découvrez nos créations exclusives façonnées à la main dans des cuirs d'exception pour sublimer chacun de vos pas.
            </p>
            <Link 
              to={mainBanner.link || "/collections/nouveau"} 
              className="inline-flex items-center gap-4 bg-white text-black hover:bg-transparent hover:text-white border border-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-lg shadow-lg"
            >
              Découvrir <ArrowRight className="w-4 h-4 stroke-2" />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* NEW COLLECTION */}
      <section className="container mx-auto px-6 md:px-12 py-[100px] max-w-[1400px]">
        <FadeUp>
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase mb-4 text-black">Nouveautés</h2>
            <div className="w-px h-12 bg-black mb-6"></div>
            <p className="text-gray-500 text-xs max-w-lg leading-relaxed uppercase tracking-wider">
              Une fusion parfaite entre design pointu et confort absolu pour la femme moderne.
            </p>
          </div>
        </FadeUp>
        
        {loading ? (
          <div className="text-center py-20 text-xs tracking-widest uppercase text-gray-400">Chargement...</div>
        ) : newProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {newProducts.map((p, idx) => (
              <FadeUp key={p.id} delay={idx * 0.1}>
                <ProductCard {...p} />
              </FadeUp>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 text-gray-400 text-xs tracking-widest uppercase">
            Collection en cours de préparation
          </div>
        )}
        
        <FadeUp className="text-center mt-16">
          <Link to="/collections/nouveau" className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-black relative after:absolute after:bottom-[-8px] after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-[1px] after:bg-black hover:after:w-full transition-all duration-500 pb-2">
            Voir toute la collection
          </Link>
        </FadeUp>
      </section>

      {/* LUXURY ABOUT BANNER */}
      <section className="bg-ivory py-[120px]">
        <FadeUp className="container mx-auto px-6 max-w-4xl text-center">
          <span className="block text-[10px] font-bold tracking-[0.3em] uppercase mb-8 text-primary">La Maison Soley</span>
          <h2 className="text-3xl md:text-5xl font-serif text-secondary mb-12 leading-snug">
            "Le véritable luxe réside dans l'alliance de l'élégance intemporelle et du confort absolu."
          </h2>
          <p className="text-sm text-gray-500 leading-loose font-light max-w-2xl mx-auto mb-12">
            Depuis plus de 20 ans, nos artisans sélectionnent les cuirs les plus nobles pour concevoir des chaussures qui respectent l'anatomie féminine. Chaque pièce est le fruit d'un savoir-faire méticuleux.
          </p>
          <Link to="/about" className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-500 group">
            <ArrowRight className="w-5 h-5 stroke-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeUp>
      </section>

      {/* BEST SELLERS */}
      <section className="container mx-auto px-6 md:px-12 py-[120px] max-w-[1400px]">
        <FadeUp className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-md">
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase mb-4 text-black">Les Iconiques</h2>
            <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-wider">
              Les pièces signature de la maison Soley. Celles qui ont conquis nos clientes.
            </p>
          </div>
          <Link to="/collections/best-sellers" className="hidden md:inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-gray-500 transition-colors">
            Explorer <ArrowRight className="w-4 h-4 stroke-1" />
          </Link>
        </FadeUp>

        {loading ? (
          <div className="text-center py-20 text-xs tracking-widest uppercase text-gray-400">Chargement...</div>
        ) : bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {bestSellers.map((p, idx) => (
              <FadeUp key={p.id} delay={idx * 0.1}>
                <ProductCard {...p} />
              </FadeUp>
            ))}
          </div>
        ) : null}
      </section>

    </div>
  );
}
