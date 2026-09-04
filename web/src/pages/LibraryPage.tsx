import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Library as LibraryIcon, Search, Plus, BookOpen, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Book } from '../types';

export const LibraryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await api.get('/library/books/', { params });
      setBooks(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    if (role === 'STUDENT' || role === 'TEACHER' || role === 'PARENT') {
      api.get('/library/transactions/my_loans/').then((res) => setMyLoans(res.data));
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header__title flex items-center gap-2.5">
            <LibraryIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('nav.library')}</span>
          </h1>
          <p className="page-header__subtitle mt-1">
            {isUrdu 
              ? 'جامعہ اسلامیہ کے کتب خانے میں اسلامی علوم و درسی کتب کا ذخیرہ' 
              : 'Institutional catalog of Islamic sciences, Hadith, Tafseer, literature, and school reference books.'}
          </p>
        </div>
      </div>

      {/* Active Borrowed Books */}
      {myLoans.length > 0 && (
        <div className="card border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20">
          <h2 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>My Active Borrowed Books</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myLoans.map((loan) => (
              <div key={loan.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/40 text-xs shadow-xs">
                <div className="font-bold text-[var(--text-primary)]">{loan.book_title}</div>
                {loan.book_title_urdu && (
                  <div className="text-emerald-600 dark:text-emerald-400 font-serif text-[11px] mt-0.5">{loan.book_title_urdu}</div>
                )}
                <div className="text-[var(--text-muted)] text-[11px] mt-1.5">Due Date: <span className="font-semibold text-[var(--text-secondary)]">{loan.due_date}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
            placeholder="Search title, scholar, or ISBN..."
            className="input-control ps-9 text-xs w-full"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select-control text-xs w-full sm:w-56"
        >
          <option value="">All Categories</option>
          <option value="TAFSEER">Quran & Tafseer</option>
          <option value="HADITH">Hadith & Sunnah</option>
          <option value="FIQH">Fiqh & Jurisprudence</option>
          <option value="ARABIC">Arabic Literature</option>
          <option value="URDU">Urdu Literature</option>
          <option value="SCIENCE">Science & Technology</option>
          <option value="MATHEMATICS">Mathematics</option>
        </select>
      </div>

      {/* Book Catalog Grid */}
      <div className="library-grid">
        {books.map((b) => (
          <div key={b.id} className="card p-5 space-y-3.5 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-amber text-[10px]">
                  {b.category_display}
                </span>
                <span className={`badge ${b.available_copies > 0 ? 'badge-emerald' : 'badge-danger'} text-[10px]`}>
                  {b.available_copies} / {b.total_copies} Available
                </span>
              </div>

              <h2 className="text-sm font-bold text-[var(--text-primary)] mt-2.5 line-clamp-2 leading-snug">
                {b.title}
              </h2>

              {b.title_urdu && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-serif mt-1">
                  {b.title_urdu}
                </div>
              )}

              <div className="text-xs text-[var(--text-muted)] mt-2">
                By <strong className="text-[var(--text-secondary)]">{b.author}</strong>
              </div>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span>{b.shelf_location || 'Main Stacks'}</span>
              <span className="font-mono bg-[var(--bg-surface-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[10px]">{b.isbn}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
