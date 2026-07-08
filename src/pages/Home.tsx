import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Wallet, Clock, ShieldCheck } from 'lucide-react';
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
      {/* HERO SECTION - LUXURY MINIMALIST CENTERED */}
      <section className="relative h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden bg-[#F5F5F0]">
        {/* Large Lifestyle Photography with Parallax */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 bg-fixed"
          style={{ backgroundImage: `url('${mainBanner.image}')` }}
        ></div>
        
        {/* Very subtle linear gradient just from top for header visibility if needed, but mostly rely on text shadows */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>

        {/* Content Container - Pushed slightly above center */}
        <div className="container mx-auto px-6 relative z-10 w-full flex flex-col items-center justify-start pt-32 md:pt-48 pb-10">
          <FadeUp className="max-w-[520px] w-full text-center flex flex-col items-center" duration={1.5}>
            
            <span className="block text-[10px] md:text-xs font-bold tracking-[0.3em] text-white/95 mb-5 uppercase drop-shadow-md">
              Collection Printemps / Été
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 leading-tight uppercase tracking-wider drop-shadow-lg">
              La Qualité À Son Meilleur
            </h1>
            
            <h2 className="text-sm md:text-base font-sans text-white/95 mb-6 font-light tracking-widest italic drop-shadow-md">
              Savoir-faire marocain depuis 1997
            </h2>
            
            <p className="text-white/90 text-xs md:text-sm leading-relaxed mb-10 font-light max-w-sm drop-shadow-md">
              L'excellence du cuir véritable. Des créations façonnées à la main pour offrir élégance intemporelle et confort absolu.
            </p>
            
            <Link 
              to={mainBanner.link || "/collections/nouveau"} 
              className="inline-flex items-center justify-center gap-3 bg-white/95 backdrop-blur-sm text-black hover:bg-white hover:scale-105 hover:shadow-2xl px-10 py-4 text-[11px] font-bold tracking-[0.25em] uppercase transition-all duration-500 rounded-full group"
            >
              Découvrir <ArrowRight className="w-4 h-4 stroke-1 group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
            
          </FadeUp>
        </div>
      </section>

      {/* REASSURANCE BAND */}
      <div className="bg-black text-white border-b border-white/10 relative z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center justify-center space-y-2 p-2">
              <Truck className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Livraison Rapide</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 p-2">
              <Wallet className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Paiement à la livraison</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 p-2">
              <Clock className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Depuis 1997</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 p-2">
              <ShieldCheck className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Cuir Véritable</span>
            </div>
          </div>
        </div>
      </div>

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

      {/* BEST SELLERS */}
      <section className="container mx-auto px-6 md:px-12 py-[80px] max-w-[1400px]">
        <FadeUp className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-md">
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase mb-4 text-black">Les Meilleures Ventes</h2>
            <div className="w-px h-12 bg-black mb-6 hidden md:block"></div>
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

      {/* CATEGORIES */}
      <section className="bg-gray-50 py-[100px]">
        <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
          <FadeUp className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase mb-4 text-black">Nos Catégories</h2>
            <div className="w-px h-12 bg-black mb-6"></div>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sandales', img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=1000&auto=format&fit=crop', link: '/collections/sandales' },
              { name: 'Mules', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop', link: '/collections/mules' },
              { name: 'Talons', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', link: '/collections/talons' }
            ].map((cat, i) => (
              <FadeUp key={i} delay={i * 0.1} className="relative h-[400px] group overflow-hidden bg-black">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                  style={{ backgroundImage: `url('${cat.img}')` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link 
                    to={cat.link}
                    className="bg-white/90 backdrop-blur-sm text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    {cat.name}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
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

    </div>
  );
}
