'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Journal { _id: string; title: string; plainText: string; mood: string; createdAt: string; wordCount: number; category?: { name: string; color: string }; tags?: { name: string; color: string }[]; }

const moodEmojis: Record<string, string> = { great: '😄', good: '🙂', neutral: '😐', bad: '😔', terrible: '😢' };

export default function BookmarksPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const data = await api.get('/journals?bookmarked=true&limit=50');
      setJournals(data.journals);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const removeBookmark = async (id: string) => {
    await api.put(`/journals/${id}/bookmark`, {});
    fetchBookmarks();
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading bookmarks...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookmarks</h1>
      {journals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No bookmarks yet</p>
          <p className="text-sm text-gray-400">Bookmark journal entries to find them quickly</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map(journal => (
            <div key={journal._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link href={`/journals/${journal._id}/edit`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                    {journal.title}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{journal.plainText?.substring(0, 150)}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    <span>{new Date(journal.createdAt).toLocaleDateString()}</span>
                    <span>{journal.wordCount} words</span>
                    {journal.mood && <span>{moodEmojis[journal.mood]} {journal.mood}</span>}
                    {journal.category && (
                      <span className="px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: journal.category.color }}>{journal.category.name}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => removeBookmark(journal._id)} className="ml-3 p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg" title="Remove bookmark">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
