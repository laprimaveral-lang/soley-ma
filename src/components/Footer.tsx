import { Link } from 'react-router-dom';
import { Truck, CreditCard, Droplets, RefreshCw, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProductService } from '../services/api';

export default function Footer() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    ProductService.getProducts()
      .then((products: any[]) => {
        // Extract up to 5 unique product images
        const images: string[] = [];
        for (const p of products) {
          if (p.images && p.images.length > 0) {
            images.push(`http://localhost:3001${p.images[0].image}`);
            if (images.length === 5) break;
          }
        }
        setGalleryImages(images);
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-white text-[#111111] font-sans border-t border-[#ECECEC] mt-auto">
      {/* 
        Generous vertical spacing: 120px top and bottom for the main container.
        Using max-w-[1400px] for a very wide, modern look.
      */}
      <div className="container mx-auto px-6 md:px-12 py-[120px] max-w-[1400px]">
        
        {/* PREMIUM PRODUCT GALLERY */}
        {galleryImages.length > 0 && (
          <div className="mb-[120px]">
            <div className="text-center mb-12">
              <h3 className="text-sm font-bold tracking-[0.25em] uppercase text-black mb-4">L'Univers Soley</h3>
              <p className="text-xs text-gray-500 tracking-widest uppercase">Découvrez notre collection</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-0">
              {galleryImages.map((img, i) => (
                <div key={i} className="group relative aspect-[4/5] overflow-hidden bg-[#F5F5F0] block">
                  <img src={img} alt="Collection piece" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOP SECTION: 4 Premium Service Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-[120px]">
          <div className="flex flex-col items-start group">
            <Truck className="stroke-1 w-7 h-7 mb-6 text-black group-hover:translate-x-1 transition-transform duration-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3">Livraison rapide</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
              Recevez vos commandes en 24h à 48h partout au Maroc. Une livraison express et sécurisée.
            </p>
          </div>
          
          <div className="flex flex-col items-start group">
            <CreditCard className="stroke-1 w-7 h-7 mb-6 text-black group-hover:translate-x-1 transition-transform duration-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3">Paiement à la livraison</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
              Commandez en toute sérénité. Vous ne payez qu'une fois votre colis entre vos mains.
            </p>
          </div>
          
          <div className="flex flex-col items-start group">
            <Droplets className="stroke-1 w-7 h-7 mb-6 text-black group-hover:translate-x-1 transition-transform duration-500" />
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3">Cuir véritable</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
              Des matières premières rigoureusement sélectionnées pour une durabilité et un confort absolus.
            </p>
          </div>
          
          <div className="flex flex-col items-start group">
            <RefreshCw className="stroke-1 w-7 h-7 mb-6 text-black group-hover:rotate-180 transition-transform duration-700" />
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3">Retour sous 7 jours</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
              Vous avez changé d'avis ? Retournez ou échangez votre article facilement sous 7 jours.
            </p>
          </div>
        </div>

        {/* THIN DIVIDER */}
        <div className="w-full h-px bg-[#ECECEC] mb-[120px]"></div>

        {/* MIDDLE SECTION: 5 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-[120px]">
          
          {/* Column 1: Logo & Description (Takes 3 cols on large screens) */}
          <div className="lg:col-span-3 flex flex-col">
            <Link to="/" className="text-4xl font-bold tracking-widest mb-8 hover:opacity-70 transition-opacity">
              Soley<span className="text-sm align-super">®</span>
            </Link>
            <p className="text-sm text-gray-500 leading-loose max-w-sm">
              L'élégance intemporelle redéfinie. Des chaussures conçues pour les femmes qui refusent de choisir entre le confort absolu et le design pointu.
            </p>
          </div>

          {/* Column 2: Collections (Takes 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-gray-900">Collections</h4>
            <ul className="space-y-5 text-sm text-gray-500">
              <li><Link to="/collections/nouveau" className="hover:text-black hover:translate-x-1 transition-all inline-block">Nouveautés</Link></li>
              <li><Link to="/collections/sandales" className="hover:text-black hover:translate-x-1 transition-all inline-block">Sandales</Link></li>
              <li><Link to="/collections/mules" className="hover:text-black hover:translate-x-1 transition-all inline-block">Mules</Link></li>
              <li><Link to="/collections/mocassins" className="hover:text-black hover:translate-x-1 transition-all inline-block">Mocassins</Link></li>
              <li><Link to="/collections/sabots" className="hover:text-black hover:translate-x-1 transition-all inline-block">Sabots</Link></li>
              <li><Link to="/collections/slippers" className="hover:text-black hover:translate-x-1 transition-all inline-block">Slippers</Link></li>
            </ul>
          </div>

          {/* Column 3: Service Client (Takes 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-gray-900">Service Client</h4>
            <ul className="space-y-5 text-sm text-gray-500">
              <li><Link to="/contact" className="hover:text-black hover:translate-x-1 transition-all inline-block">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-black hover:translate-x-1 transition-all inline-block">FAQ</Link></li>
              <li><Link to="/delivery" className="hover:text-black hover:translate-x-1 transition-all inline-block">Livraison</Link></li>
              <li><Link to="/returns" className="hover:text-black hover:translate-x-1 transition-all inline-block">Retours</Link></li>
            </ul>
          </div>

          {/* Column 4: Informations (Takes 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-gray-900">Informations</h4>
            <ul className="space-y-5 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-black hover:translate-x-1 transition-all inline-block">À propos</Link></li>
              <li><Link to="/cgv" className="hover:text-black hover:translate-x-1 transition-all inline-block">CGV</Link></li>
              <li><Link to="/privacy" className="hover:text-black hover:translate-x-1 transition-all inline-block">Politique de confidentialité</Link></li>
              <li><Link to="/cookies" className="hover:text-black hover:translate-x-1 transition-all inline-block">Cookies</Link></li>
            </ul>
          </div>

          {/* Column 5: Newsletter (Takes 3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] mb-8 text-gray-900">Newsletter</h4>
            <p className="text-sm text-gray-500 leading-loose mb-6 max-w-sm">
              Inscrivez-vous pour découvrir nos nouvelles collections et offres exclusives en avant-première.
            </p>
            <form className="relative group max-w-sm">
              <input 
                type="email" 
                placeholder="Votre adresse e-mail" 
                className="w-full border-b border-[#ECECEC] bg-transparent py-3 pr-10 text-sm focus:outline-none focus:border-black transition-colors"
                required
              />
              <button 
                type="submit" 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors"
              >
                <ArrowRight className="w-5 h-5 stroke-1" />
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM SECTION: Social & Copyright */}
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
            <a href="#" className="hover:text-gray-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">Instagram</a>
            <a href="#" className="hover:text-gray-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">Facebook</a>
            <a href="#" className="hover:text-gray-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">TikTok</a>
            <a href="#" className="hover:text-gray-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">Pinterest</a>
            <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300">WhatsApp</a>
          </div>
          
          <div className="text-[11px] text-gray-400 tracking-widest text-center">
            © {new Date().getFullYear()} SOLEY. TOUS DROITS RÉSERVÉS.
          </div>
        </div>
        
      </div>
    </footer>
  );
}
