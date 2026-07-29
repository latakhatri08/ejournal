'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Tag { _id: string; name: string; color: string; journalCount: number; }

const colors = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4', '#84cc16'];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const fetchTags = async () => { const data = await api.get('/tags'); setTags(data.tags); };
  useEffect(() => { fetchTags(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/tags', { name, color });
    setName('');
    fetchTags();
  };

  const handleUpdate = async (id: string) => {
    await api.put(`/tags/${id}`, { name: editName, color: editColor });
    setEditingId(null);
    fetchTags();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    await api.delete(`/tags/${id}`);
    fetchTags();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>
      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">New Tag</h3>
        <div className="flex gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tag name" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none" required />
          <div className="flex gap-1">
            {colors.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Add</button>
        </div>
      </form>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div key={tag._id} className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2">
            {editingId === tag._id ? (
              <div className="flex items-center gap-2">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="px-2 py-1 border rounded outline-none text-sm w-24" />
                <div className="flex gap-1">
                  {colors.map(c => (
                    <button key={c} type="button" onClick={() => setEditColor(c)} className={`w-5 h-5 rounded-full border-2 ${editColor === c ? 'border-gray-900' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <button onClick={() => handleUpdate(tag._id)} className="text-xs text-indigo-600">Save</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">Cancel</button>
              </div>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-sm font-medium">{tag.name}</span>
                <span className="text-xs text-gray-400">({tag.journalCount})</span>
                <button onClick={() => { setEditingId(tag._id); setEditName(tag.name); setEditColor(tag.color); }} className="text-xs text-gray-500 hover:text-indigo-600 ml-1">Edit</button>
                <button onClick={() => handleDelete(tag._id)} className="text-xs text-gray-500 hover:text-red-600">Del</button>
              </>
            )}
          </div>
        ))}
        {tags.length === 0 && <p className="text-center text-gray-500 py-8 w-full">No tags yet</p>}
      </div>
    </div>
  );
}
