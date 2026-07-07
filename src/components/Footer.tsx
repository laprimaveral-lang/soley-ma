import { Link } from 'react-router-dom';
import { Truck, CreditCard, Droplets, RefreshCw, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProductService, getMediaUrl } from '../services/api';

export default function Footer() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    ProductService.getProducts()
      .then((products: any[]) => {
        // Extract up to 5 unique product images
        const images: string[] = [];
        for (const p of products) {
          if (p.images && p.images.length > 0) {
            images.push(getMediaUrl(p.images[0].image));
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
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
            {/* Instagram */}
            <a href="https://www.instagram.com/soley_shoes_/" target="_blank" rel="noreferrer" aria-label="Instagram"
              className="group flex flex-col items-center gap-2 hover:opacity-60 transition-opacity">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">Instagram</span>
            </a>

            {/* Facebook */}
            <a href="#" target="_blank" rel="noreferrer" aria-label="Facebook"
              className="group flex flex-col items-center gap-2 hover:opacity-60 transition-opacity">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">Facebook</span>
            </a>

            {/* TikTok */}
            <a href="https://www.tiktok.com/@soley_shoes_fabrication" target="_blank" rel="noreferrer" aria-label="TikTok"
              className="group flex flex-col items-center gap-2 hover:opacity-60 transition-opacity">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">TikTok</span>
            </a>

            {/* Pinterest */}
            <a href="#" target="_blank" rel="noreferrer" aria-label="Pinterest"
              className="group flex flex-col items-center gap-2 hover:opacity-60 transition-opacity">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">Pinterest</span>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="group flex flex-col items-center gap-2 hover:opacity-60 transition-opacity">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">WhatsApp</span>
            </a>
          </div>
          
          <div className="text-[11px] text-gray-400 tracking-widest text-center">
            © {new Date().getFullYear()} SOLEY. TOUS DROITS RÉSERVÉS.
          </div>
        </div>
        
      </div>
    </footer>
  );
}
