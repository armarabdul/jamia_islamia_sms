import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Award, Calendar, Check, X, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { TeacherStaff } from '../types';

export const TeachersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isUrdu = i18n.language === 'ur';

  const [staffList, setStaffList] = useState<TeacherStaff[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    api.get('/staff/').then((res) => setStaffList(res.data.results || res.data));
    api.get('/staff/leaves/').then((res) => setLeaves(res.data.results || res.data));
  }, []);

  const handleApproveLeave = async (id: string) => {
    try {
      await api.post(`/staff/leaves/${id}/approve/`);
      const res = await api.get('/staff/leaves/');
      setLeaves(res.data.results || res.data);
    } catch (err) {
      alert('Action failed.');
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await api.post(`/staff/leaves/${id}/reject/`);
      const res = await api.get('/staff/leaves/');
      setLeaves(res.data.results || res.data);
    } catch (err) {
      alert('Action failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          <span>{t('nav.teachers')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isUrdu 
            ? 'جامعہ اسلامیہ کے مؤقر اساتذہ کرام اور ملازمین کا مکمل ریکارڈ' 
            : 'Faculty directory, employee designations, academic qualifications, and leave requests.'}
        </p>
      </div>

      {/* Staff Directory */}
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 font-bold text-sm text-white">
          Active Teachers & Staff Members
        </div>
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Qualification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => (
                <tr key={st.id}>
                  <td className="font-mono text-xs font-bold text-amber-400">{st.employee_code}</td>
                  <td>
                    <div className="font-semibold text-white text-xs">{st.full_name}</div>
                    <div className="text-[10px] text-slate-400">{st.email}</div>
                  </td>
                  <td className="text-xs">{st.designation}</td>
                  <td className="text-xs text-emerald-400">{st.department}</td>
                  <td className="text-xs text-slate-300">{st.qualification || '-'}</td>
                  <td>
                    <span className="badge badge-present text-[10px]">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Requests Management */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Staff Leave Applications</h2>
        
        <div className="divide-y divide-white/5">
          {leaves.length > 0 ? (
            leaves.map((l) => (
              <div key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-white">
                    {l.staff_name} <span className="text-slate-400 font-mono">({l.staff_code})</span>
                  </div>
                  <div className="text-slate-300 mt-0.5">{l.reason}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Dates: {l.start_date} to {l.end_date}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${l.status === 'APPROVED' ? 'badge-present' : l.status === 'REJECTED' ? 'badge-absent' : 'badge-gold'}`}>
                    {l.status}
                  </span>

                  {user?.role === 'ADMIN' && l.status === 'PENDING' && (
                    <div className="flex gap-1 ms-2">
                      <button
                        onClick={() => handleApproveLeave(l.id)}
                        className="btn btn-primary text-xs py-1 px-2.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectLeave(l.id)}
                        className="btn btn-danger text-xs py-1 px-2.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-slate-500">No pending leave requests.</div>
          )}
        </div>
      </div>

    </div>
  );
};
