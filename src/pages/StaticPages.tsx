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

export const CGV = () => (
  <StaticPage 
    title="Conditions Générales de Vente" 
    content={
      <>
        <h3 className="text-xl font-bold mb-3 mt-8">1. Objet</h3>
        <p className="mb-6">Les présentes Conditions Générales de Vente régissent les ventes de chaussures et accessoires sur le site Soley.ma. Tout achat implique l'acceptation sans réserve de ces conditions.</p>
        
        <h3 className="text-xl font-bold mb-3">2. Prix</h3>
        <p className="mb-6">Les prix de nos produits sont indiqués en Dirhams Marocains (MAD), toutes taxes comprises, hors frais de traitement et d'expédition.</p>
        
        <h3 className="text-xl font-bold mb-3">3. Paiement</h3>
        <p className="mb-6">Le règlement de vos achats s'effectue à la livraison (Cash on Delivery) ou par carte bancaire selon les options disponibles lors de la validation de la commande.</p>
      </>
    } 
  />
);

export const Privacy = () => (
  <StaticPage 
    title="Politique de Confidentialité" 
    content={
      <>
        <h3 className="text-xl font-bold mb-3 mt-8">Collecte des données</h3>
        <p className="mb-6">Nous collectons les informations nécessaires pour traiter vos commandes : nom, adresse de livraison, numéro de téléphone et e-mail.</p>
        
        <h3 className="text-xl font-bold mb-3">Utilisation des données</h3>
        <p className="mb-6">Vos données sont utilisées exclusivement pour l'expédition de vos commandes et pour vous informer de nos nouveautés, avec votre accord.</p>
        
        <h3 className="text-xl font-bold mb-3">Protection des données</h3>
        <p className="mb-6">Nous nous engageons à ne jamais vendre ou céder vos données personnelles à des tiers. Vous pouvez à tout moment demander la modification ou la suppression de vos données.</p>
      </>
    } 
  />
);

export const Cookies = () => (
  <StaticPage 
    title="Gestion des Cookies" 
    content={
      <>
        <h3 className="text-xl font-bold mb-3 mt-8">Qu'est-ce qu'un cookie ?</h3>
        <p className="mb-6">Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site. Il permet de retenir vos préférences et d'améliorer votre navigation.</p>
        
        <h3 className="text-xl font-bold mb-3">Utilisation des cookies sur Soley.ma</h3>
        <p className="mb-6">Nous utilisons des cookies essentiels pour le fonctionnement du panier d'achat, de la connexion à votre compte, et des cookies analytiques pour comprendre comment vous utilisez notre site et l'améliorer.</p>
        
        <h3 className="text-xl font-bold mb-3">Gestion de vos préférences</h3>
        <p className="mb-6">Vous pouvez configurer votre navigateur pour refuser les cookies. Cependant, certaines fonctionnalités de notre site (comme le panier d'achat) pourraient ne plus fonctionner correctement.</p>
      </>
    } 
  />
);

export const Returns = () => (
  <StaticPage 
    title="Politique de Retours" 
    content={
      <>
        <h3 className="text-xl font-bold mb-3 mt-8">Conditions de retour</h3>
        <p className="mb-6">Vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour nous retourner les produits qui ne vous conviendraient pas.</p>
        
        <h3 className="text-xl font-bold mb-3">État des articles</h3>
        <p className="mb-6">Les articles doivent être retournés neufs, non portés, et dans leur emballage d'origine. Tout article endommagé ou sali ne pourra être remboursé ni échangé.</p>
        
        <h3 className="text-xl font-bold mb-3">Frais de retour</h3>
        <p className="mb-6">Sauf erreur de notre part (article défectueux ou erreur de modèle), les frais de retour sont à la charge du client.</p>
      </>
    } 
  />
);
