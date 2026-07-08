import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

// Google Client ID — à configurer dans /xrp/settings ou via variable d'env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google: any;
  }
}

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name: `${firstName} ${lastName}`, email, password });
      navigate('/account');
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('La connexion Google n\'est pas encore configurée. Veuillez utiliser le formulaire.');
      return;
    }
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => initGoogle();
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  };

  const initGoogle = () => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          await loginWithGoogle(response.credential);
          navigate('/account');
        } catch (err: any) {
          setError(err.response?.data?.error || 'Erreur lors de la connexion Google');
        }
      }
    });
    window.google.accounts.id.prompt();
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest uppercase mb-4">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez-nous pour une expérience personnalisée.</p>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white py-3.5 px-4 mb-6 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-gray-700 text-sm shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuer avec Google
        </button>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">ou</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8">
          {error && <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Prénom</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-300 px-4 py-3 focus:border-black outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nom</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-300 px-4 py-3 focus:border-black outline-none transition-colors" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 px-4 py-3 focus:border-black outline-none transition-colors" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mot de passe</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 px-4 py-3 focus:border-black outline-none transition-colors" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 mt-6 font-bold tracking-wider uppercase hover:bg-[#b0946b] transition-colors disabled:opacity-50">
            {loading ? 'Inscription...' : "M'inscrire"}
          </button>
        </form>

        <div className="text-center mt-8 text-sm">
          <p className="text-gray-600">Déjà un compte ?</p>
          <Link to="/login" className="inline-block mt-2 font-bold tracking-wider uppercase border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
            Me Connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
