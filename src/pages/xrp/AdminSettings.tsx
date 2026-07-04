import { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { SettingService } from '../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await SettingService.getSettings();
    const formatted: Record<string, string> = {};
    data.forEach((s: any) => formatted[s.key] = s.value);
    setSettings(formatted);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const keys = Object.keys(settings);
      for (const key of keys) {
        await SettingService.saveSetting(key, settings[key]);
      }
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings size={32} /> Paramètres de la Boutique
        </h1>
        <p className="text-gray-500 mt-1">Gérez les configurations globales de Soley.ma.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section: Informations Générales */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100">Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la boutique</label>
              <input 
                type="text" 
                value={settings['store_name'] || ''}
                onChange={e => handleChange('store_name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email de contact</label>
              <input 
                type="email" 
                value={settings['contact_email'] || ''}
                onChange={e => handleChange('contact_email', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
              <input 
                type="text" 
                value={settings['contact_phone'] || ''}
                onChange={e => handleChange('contact_phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Section: Frais de Livraison */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100">Livraison & Frais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Frais de livraison standards (MAD)</label>
              <input 
                type="number" 
                value={settings['shipping_fee'] || ''}
                onChange={e => handleChange('shipping_fee', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Livraison gratuite à partir de (MAD)</label>
              <input 
                type="number" 
                value={settings['free_shipping_threshold'] || ''}
                onChange={e => handleChange('free_shipping_threshold', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Section: SEO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100">SEO Global</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Méta Titre de la page d'accueil</label>
              <input 
                type="text" 
                value={settings['seo_title'] || ''}
                onChange={e => handleChange('seo_title', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Méta Description</label>
              <textarea 
                value={settings['seo_description'] || ''}
                onChange={e => handleChange('seo_description', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:outline-none" 
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-gray-800 transition-all shadow-lg shadow-black/20 disabled:opacity-50"
          >
            <Save size={20} /> {isSaving ? 'Enregistrement...' : 'Sauvegarder les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}
