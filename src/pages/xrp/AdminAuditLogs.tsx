import { useState, useEffect } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import DataTable from '../../components/xrp/DataTable';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/erp/audit-logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Horodatage', accessor: (row: any) => new Date(row.createdAt).toLocaleString('fr-FR') },
    { 
      header: 'Action', 
      accessor: (row: any) => (
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${
          row.action.startsWith('DELETE') ? 'bg-red-50 text-red-700 border-red-200' :
          row.action.startsWith('CREATE') ? 'bg-green-50 text-green-700 border-green-200' :
          'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          {row.action}
        </span>
      ) 
    },
    { header: 'Détails de l\'opération', accessor: (row: any) => <span className="font-semibold text-gray-800 text-xs">{row.details}</span> },
    { header: 'Opérateur', accessor: (row: any) => <span className="font-mono text-xs">ID: {row.adminId.substring(0, 8)}</span> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 tracking-wide flex items-center gap-3">
            <Activity size={32} /> Journal d'Audit Système
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Historique complet des actions, connexions, modifications et créations d'objets</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert size={18} className="text-gray-400" />
          <h2 className="text-base font-bold uppercase tracking-wider text-black">Trace d'audit administrative (Dernières 200 opérations)</h2>
        </div>
        <DataTable data={logs} columns={columns} searchPlaceholder="Rechercher une opération..." />
      </div>
    </div>
  );
}
