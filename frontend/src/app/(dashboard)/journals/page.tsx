'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Journal {
  _id: string;
  title: string;
  plainText: string;
  mood: string;
  isPinned: boolean;
  isBookmarked: boolean;
  wordCount: number;
  createdAt: string;
  category?: { name: string; color: string };
  tags?: { _id: string; name: string; color: string }[];
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

const moodEmojis: Record<string, string> = {
  great: '😄', good: '🙂', neutral: '😐', bad: '😔', terrible: '😢'
};

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchJournals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', sort: '-isPinned,-createdAt' });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const data = await api.get(`/journals?${params}`);
      setJournals(data.journals);
      setTotalPages(data.pages);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, search, categoryFilter]);

  useEffect(() => {
    api.get('/categories').then(data => setCategories(data.categories || []) ).catch(() => setCategories([]));
    fetchJournals();
  }, [fetchJournals]);

  const togglePin = async (id: string) => {
    await api.put(`/journals/${id}/pin`, {});
    fetchJournals();
  };

  const toggleBookmark = async (id: string) => {
    await api.put(`/journals/${id}/bookmark`, {});
    fetchJournals();
  };

  const deleteJournal = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await api.delete(`/journals/${id}`);
    fetchJournals();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Journals</h1>
        <Link
          href="/journals/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Entry
        </Link>
      </div>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search journals..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : journals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No journals yet. Start writing!</p>
          <Link href="/journals/new" className="text-indigo-600 font-medium hover:text-indigo-700">
            Create your first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map(journal => (
            <div key={journal._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {journal.isPinned && (
                      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                      </svg>
                    )}
                    <Link href={`/journals/${journal._id}/edit`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 truncate">
                      {journal.title}
                    </Link>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                    {journal.plainText?.substring(0, 150) || 'No content'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{new Date(journal.createdAt).toLocaleDateString()}</span>
                    <span>{journal.wordCount} words</span>
                    {journal.mood && <span>{moodEmojis[journal.mood]} {journal.mood}</span>}
                    {journal.category && (
                      <span className="px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: journal.category.color }}>
                        {journal.category.name}
                      </span>
                    )}
                    {journal.tags?.map(tag => (
                      <span key={tag._id} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button onClick={() => togglePin(journal._id)} className={`p-1.5 rounded-lg ${journal.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`} title="Pin">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                    </svg>
                  </button>
                  <button onClick={() => toggleBookmark(journal._id)} className={`p-1.5 rounded-lg ${journal.isBookmarked ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`} title="Bookmark">
                    <svg className="w-4 h-4" fill={journal.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                    </svg>
                  </button>
                  <Link href={`/journals/${journal._id}/edit`} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button onClick={() => deleteJournal(journal._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-50">
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
