import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, User, Clock } from 'lucide-react';
import api from '../services/api';

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/audit-logs/')
      .then((res) => {
        setLogs(res.data.results || res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>{t('nav.audit_logs')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Security audit trail recording administrative actions, logins, and sensitive changes.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="font-semibold text-white text-xs">{log.username || 'System'}</div>
                    </td>
                    <td>
                      <span className="badge badge-gold text-[10px] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs text-emerald-400 font-mono">
                      {log.resource_type} {log.resource_id ? `#${log.resource_id.slice(0, 8)}` : ''}
                    </td>
                    <td className="font-mono text-xs text-slate-400">
                      {log.ip_address || '-'}
                    </td>
                    <td className="text-xs text-slate-400 font-mono">
                      {JSON.stringify(log.changes || {})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    {isLoading ? t('common.loading') : 'No audit records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
