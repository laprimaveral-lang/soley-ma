export default function StaticPage({ title, content }: { title: string, content: React.ReactNode }) {
  return (
    <div className="bg-white min-h-[60vh] py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-light tracking-widest uppercase mb-12 text-center">{title}</h1>
        <div className="prose prose-lg mx-auto text-gray-600 font-light leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}

export const About = () => (
  <StaticPage 
    title="À PROPOS DE SOLEY" 
    content={
      <div className="flex flex-col gap-6 text-center max-w-2xl mx-auto">
        <p className="font-medium text-black">
          SOLEY est un fabricant marocain de chaussures pour femmes et enfants basé à Fès depuis 1997.
        </p>
        
        <p>
          Fort de plus de 25 ans d'expérience, nous concevons et fabriquons des chaussures alliant confort, qualité et élégance. Notre mission est d'offrir des produits durables, fabriqués avec soin, à partir de matériaux sélectionnés pour garantir le bien-être de nos clientes.
        </p>
        
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
          <p className="text-sm font-bold tracking-widest text-black uppercase">
            Fabricant de chaussures femme et enfant à Fès depuis 1997
          </p>
          <div className="flex gap-4 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            <span>Qualité</span>
            <span>•</span>
            <span>Confort</span>
            <span>•</span>
            <span>Élégance</span>
          </div>
        </div>
      </div>
    } 
  />
);

export const FAQ = () => (
  <StaticPage 
    title="Questions Fréquentes" 
    content={
      <>
        <h3 className="text-xl font-bold mb-3 mt-8">Quels sont les délais de livraison ?</h3>
        <p className="mb-6">La livraison standard prend entre 48h et 72h ouvrées partout au Maroc.</p>
        
        <h3 className="text-xl font-bold mb-3">Comment puis-je retourner un article ?</h3>
        <p className="mb-6">Vous disposez de 14 jours après réception de votre commande pour nous retourner les articles non portés dans leur emballage d'origine.</p>

        <h3 className="text-xl font-bold mb-3">Où sont fabriquées vos chaussures ?</h3>
        <p>Toutes nos chaussures sont dessinées et fabriquées avec soin dans nos ateliers au Maroc.</p>
      </>
    } 
  />
);

export const DeliveryReturns = () => (
  <StaticPage 
    title="Livraison & Retours" 
    content={
      <>
        <h2 className="text-2xl font-bold mb-4">Livraison</h2>
        <ul className="list-disc pl-5 mb-8">
          <li className="mb-2">Livraison à domicile via nos partenaires logistiques.</li>
          <li className="mb-2">Frais de livraison : Gratuite à partir de 500 DH d'achat, sinon 35 DH.</li>
          <li className="mb-2">Délais : 2 à 3 jours ouvrables.</li>
        </ul>
        
        <h2 className="text-2xl font-bold mb-4">Retours</h2>
        <p>Les échanges et retours sont possibles sous 14 jours. Le produit doit être intact. Les frais de retour sont à la charge du client sauf en cas de défaut de fabrication.</p>
      </>
    } 
  />
);

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
    <h1 className="text-8xl font-light text-primary mb-6">404</h1>
    <h2 className="text-2xl font-bold tracking-widest uppercase mb-4">Page Introuvable</h2>
    <p className="text-gray-500 mb-8 max-w-md mx-auto">La page que vous recherchez n'existe pas ou a été déplacée.</p>
    <a href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors">
      Retour à l'accueil
    </a>
  </div>
);
