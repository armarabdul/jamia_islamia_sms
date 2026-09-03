import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Plus, Pin, Calendar, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    title_urdu: '',
    content: '',
    content_urdu: '',
    audience: 'ALL',
    is_pinned: false,
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/announcements/', newNotice);
      setShowCreateModal(false);
      fetchAnnouncements();
      alert('Announcement published successfully.');
    } catch (err) {
      alert('Failed to publish announcement.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-400" />
            <span>{t('nav.announcements')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'جامعہ اسلامیہ کے سرکاری اعلانات، سرکلرز اور اہم اطلاعات' 
              : 'Official school notices, event invitations, and administrative announcements.'}
          </p>
        </div>

        {(role === 'ADMIN' || role === 'TEACHER') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`glass-panel p-6 space-y-3 transition-all ${
              ann.is_pinned ? 'border-amber-500/40 bg-amber-950/10' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {ann.is_pinned && (
                  <span className="badge badge-gold text-[10px]">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                <span className="badge badge-present text-[10px]">
                  Audience: {ann.audience}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                {new Date(ann.published_at).toLocaleDateString()}
              </span>
            </div>

            <h2 className="text-base font-bold text-white">
              {isUrdu ? ann.title_urdu || ann.title : ann.title}
            </h2>

            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {isUrdu ? ann.content_urdu || ann.content : ann.content}
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5">
              Published by <strong className="text-slate-200">{ann.author_name}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">New Announcement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Title (Urdu)</label>
                <input
                  type="text"
                  value={newNotice.title_urdu}
                  onChange={(e) => setNewNotice({ ...newNotice, title_urdu: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Audience</label>
                <select
                  value={newNotice.audience}
                  onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })}
                  className="input-field"
                >
                  <option value="ALL">School-wide (Everyone)</option>
                  <option value="PARENTS">Parents Only</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="TEACHERS">Teachers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Content (English)</label>
                <textarea
                  rows={3}
                  required
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Content (Urdu)</label>
                <textarea
                  rows={3}
                  value={newNotice.content_urdu}
                  onChange={(e) => setNewNotice({ ...newNotice, content_urdu: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={newNotice.is_pinned}
                  onChange={(e) => setNewNotice({ ...newNotice, is_pinned: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="pin" className="text-slate-300 text-xs">Pin to top of notice board</label>
              </div>

              <button type="submit" className="btn btn-primary w-full py-2 mt-2">
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
