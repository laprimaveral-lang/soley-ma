import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/api';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in as admin, redirect to dashboard
    const adminToken = localStorage.getItem('adminToken');
    const adminUserStr = localStorage.getItem('adminUser');
    if (adminToken && adminUserStr) {
      try {
        const user = JSON.parse(adminUserStr);
        if (user.role === 'admin') {
          navigate('/xrp');
        }
      } catch (e) {}
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });
      if (data.user?.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/xrp');
      } else {
        setError('Accès refusé. Privilèges insuffisants.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 md:p-12 shadow-xl border border-gray-100 rounded-xl">
        <div className="text-center mb-10">
          <Lock className="w-8 h-8 mx-auto mb-4 text-black" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold tracking-widest uppercase mb-2">Administration</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">Accès Sécurisé</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-xs font-bold text-center mb-6 border border-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[11px] font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-50 mt-8 rounded"
          >
            {loading ? 'Vérification...' : 'S\'authentifier'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          <a href="/" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors">Retour au site Soley.ma</a>
        </div>
      </div>
    </div>
  );
}
