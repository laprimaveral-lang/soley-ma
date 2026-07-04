import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name: `${firstName} ${lastName}`, email, password });
      navigate('/account');
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest uppercase mb-4">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez-nous pour une expérience personnalisée.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8">
          {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
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
          
          <button type="submit" className="w-full bg-primary text-white py-4 mt-6 font-bold tracking-wider uppercase hover:bg-[#b0946b] transition-colors">
            M'inscrire
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
