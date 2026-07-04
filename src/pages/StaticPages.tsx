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
    title="À Propos de Soley.ma" 
    content={
      <>
        <p className="mb-6">Soley.ma est née en 1997 d'une passion pour le confort et l'élégance. Depuis plus de 20 ans, nous avons pour mission de libérer les femmes de la douleur liée au port de chaussures inadaptées, sans jamais sacrifier le style.</p>
        <p className="mb-6">Nos artisans travaillent avec des matériaux premium pour créer des collections intemporelles de sandales, mules, sabots et mocassins.</p>
        <p>L'excellence marocaine au service de votre bien-être.</p>
      </>
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
