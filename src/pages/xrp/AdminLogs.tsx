import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { ActivityLogService } from '../../services/api';
import DataTable from '../../components/xrp/DataTable';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ActivityLogService.getLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      header: 'Date & Heure',
      accessor: (row: any) => new Date(row.createdAt).toLocaleString('fr-FR')
    },
    {
      header: 'Admin ID',
      accessor: (row: any) => <span className="font-mono text-xs text-gray-500">{row.adminId}</span>
    },
    {
      header: 'Action',
      accessor: (row: any) => (
        <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
          row.action.includes('CREATE') ? 'bg-green-100 text-green-700' :
          row.action.includes('DELETE') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {row.action}
        </span>
      )
    },
    {
      header: 'Détails',
      accessor: (row: any) => <span className="text-sm font-medium text-gray-700">{row.details}</span>
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8 font-sans">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity size={32} /> Journaux d'Audit
          </h1>
          <p className="text-gray-500 mt-1">Consultez l'historique des actions administratives effectuées sur la plateforme.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-sans text-xs uppercase tracking-widest text-gray-400">Chargement des logs...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 font-sans">
          <DataTable data={logs} columns={columns} searchPlaceholder="Rechercher une action ou un ID..." />
        </div>
      )}
    </div>
  );
}
