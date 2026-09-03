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
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LibraryIcon className="w-6 h-6 text-emerald-400" />
            <span>{t('nav.library')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'جامعہ اسلامیہ کے کتب خانے میں اسلامی علوم و درسی کتب کا ذخیرہ' 
              : 'Institutional catalog of Islamic sciences, Hadith, Tafseer, literature, and school reference books.'}
          </p>
        </div>
      </div>

      {/* Active Borrowed Books */}
      {myLoans.length > 0 && (
        <div className="glass-panel p-5 border-amber-500/30">
          <h2 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>My Active Borrowed Books</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {myLoans.map((loan) => (
              <div key={loan.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                <div className="font-bold text-white">{loan.book_title}</div>
                {loan.book_title_urdu && (
                  <div className="text-emerald-400 font-serif text-[11px]">{loan.book_title_urdu}</div>
                )}
                <div className="text-slate-400 text-[10px] mt-1">Due Date: {loan.due_date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
            placeholder="Search title, scholar, or ISBN..."
            className="input-field ps-9 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field text-xs py-2 w-full sm:w-48"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((b) => (
          <div key={b.id} className="glass-panel p-5 space-y-3 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-gold text-[10px]">
                  {b.category_display}
                </span>
                <span className={`text-[10px] font-semibold ${b.available_copies > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {b.available_copies} / {b.total_copies} Available
                </span>
              </div>

              <h2 className="text-sm font-bold text-white mt-2 line-clamp-2">
                {b.title}
              </h2>

              {b.title_urdu && (
                <div className="text-xs text-emerald-400 font-serif mt-0.5">
                  {b.title_urdu}
                </div>
              )}

              <div className="text-xs text-slate-400 mt-2">
                By <strong className="text-slate-200">{b.author}</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>{b.shelf_location || 'Main Stacks'}</span>
              <span className="font-mono">{b.isbn}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
