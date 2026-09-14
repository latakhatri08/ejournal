'use client';
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Category { _id: string; name: string; color: string; }
interface Tag { _id: string; name: string; color: string; }

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [mood, setMood] = useState('neutral');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/journals/${id}`),
      api.get('/categories'),
      api.get('/tags'),
    ]).then(([journalData, catData, tagData]) => {
      const j = journalData.journal;
      setTitle(j.title);
      setContent(j.content);
      setPlainText(j.plainText || '');
      setMood(j.mood || 'neutral');
      setCategoryId(j.category?._id || '');
      setSelectedTags(j.tags?.map((t: { _id: string }) => t._id) || []);

      setCategories(catData.categories);
      setTags(tagData.tags);
      setLoading(false);
    }).catch(() => router.push('/journals'));
  }, [id, router]);

  const autoSave = useCallback(async () => {
    if (!title && !content) return;
    try {
      await api.put(`/journals/${id}`, { title, content, plainText, mood, category: categoryId || undefined, tags: selectedTags, isDraft: true });
    } catch { /* empty */ }
  }, [id, title, content, plainText, mood, categoryId, selectedTags]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setPlainText(value.replace(/<[^>]*>/g, ''));
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(autoSave, 3000);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const data = await api.post('/categories', { name: newCategoryName, color: newCategoryColor });
      setCategories(prev => [...prev, data.category]);
      setCategoryId(data.category._id);
      setNewCategoryName('');
      setNewCategoryColor('#6366f1');
      setShowNewCategory(false);
    } catch { /* empty */ }
  };

  const categoryColors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

  const handleSave = async (isDraft: boolean) => {
    setSaving(true);
    try {
      await api.put(`/journals/${id}`, { title, content, plainText, mood, category: categoryId || undefined, tags: selectedTags, isDraft });
      router.push('/journals');
    } catch { /* empty */ }
    setSaving(false);
  };

  const moods = [
    { value: 'great', emoji: '😄', label: 'Great' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'bad', emoji: '😔', label: 'Bad' },
    { value: 'terrible', emoji: '😢', label: 'Terrible' },
  ];

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Journal Entry</h1>
        <div className="flex gap-2">
          <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <input type="text" placeholder="Journal title..." value={title} onChange={e => setTitle(e.target.value)} className="w-full px-6 py-4 text-xl font-semibold border-b border-gray-200 outline-none" />
        <textarea placeholder="Start writing..." value={content} onChange={e => handleContentChange(e.target.value)} className="w-full px-6 py-4 min-h-[400px] outline-none resize-none text-gray-700 leading-relaxed" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl mt-4 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
            <div className="flex gap-2">
              {moods.map(m => (
                <button key={m.value} onClick={() => setMood(m.value)} className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${mood === m.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs mt-1">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            {showNewCategory ? (
              <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg">
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Category name" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
                <div className="flex gap-1.5">
                  {categoryColors.map(c => (
                    <button key={c} type="button" onClick={() => setNewCategoryColor(c)} className="w-6 h-6 rounded-full border-2 transition-colors" style={{ backgroundColor: c, borderColor: newCategoryColor === c ? '#1f2937' : 'transparent' }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateCategory} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">Create</button>
                  <button onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <button onClick={() => setShowNewCategory(true)} className="px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 whitespace-nowrap">+ New</button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button key={tag._id} onClick={() => setSelectedTags(prev => prev.includes(tag._id) ? prev.filter(t => t !== tag._id) : [...prev, tag._id])} className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedTags.includes(tag._id) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

        </div>
        <div className="mt-3 text-xs text-gray-400">{plainText.split(/\s+/).filter(Boolean).length} words</div>
      </div>
    </div>
  );
}
