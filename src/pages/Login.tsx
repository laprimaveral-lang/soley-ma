import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login: customerLogin } = useCustomerAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // First try customer login
      await customerLogin({ email, password });
      
      // If the user happens to be an admin logging in from the main form, set the admin token too
      const userStr = localStorage.getItem('customerUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          localStorage.setItem('adminToken', localStorage.getItem('customerToken') || '');
          localStorage.setItem('adminUser', userStr);
        }
      }
      
      navigate('/account');
    } catch (err: any) {
      // If failed, try admin login
      try {
        const data = await AuthService.login({ email, password });
        if (data.user?.role === 'admin') {
          navigate('/xrp');
        }
      } catch (adminErr: any) {
        setError(err.response?.data?.error || adminErr.response?.data?.error || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest uppercase mb-4">Connexion</h1>
          <p className="text-gray-500 text-sm">Connectez-vous pour accéder à votre espace.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-gray-200 p-8">
          {error && <div className="mb-4 text-red-500 text-sm font-bold bg-red-50 p-3 rounded">{error}</div>}
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 focus:border-black outline-none transition-colors" 
            />
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Mot de passe</label>
              <a href="#" className="text-xs text-gray-500 hover:text-black">Mot de passe oublié ?</a>
            </div>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 focus:border-black outline-none transition-colors" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 mt-6 font-bold tracking-wider uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se Connecter'}
          </button>
        </form>

        <div className="text-center mt-8 text-sm">
          <p className="text-gray-600">Nouveau client ?</p>
          <Link to="/register" className="inline-block mt-2 font-bold tracking-wider uppercase border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
