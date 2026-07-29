'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Category { _id: string; name: string; color: string; icon: string; journalCount: number; }

const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(colors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const fetchCategories = async () => {
    const data = await api.get('/categories');
    setCategories(data.categories);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/categories', { name, color });
    setName('');
    fetchCategories();
  };

  const handleUpdate = async (id: string) => {
    await api.put(`/categories/${id}`, { name: editName, color: editColor });
    setEditingId(null);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Journals in it will become uncategorized.')) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>
      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">New Category</h3>
        <div className="flex gap-3">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none" required />
          <div className="flex gap-1">
            {colors.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Add</button>
        </div>
      </form>
      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            {editingId === cat._id ? (
              <div className="flex items-center gap-3 flex-1">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-3 py-1.5 border rounded-lg outline-none" />
                <div className="flex gap-1">
                  {colors.map(c => (
                    <button key={c} type="button" onClick={() => setEditColor(c)} className={`w-6 h-6 rounded-full border-2 ${editColor === c ? 'border-gray-900' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <button onClick={() => handleUpdate(cat._id)} className="text-sm text-indigo-600 font-medium">Save</button>
                <button onClick={() => setEditingId(null)} className="text-sm text-gray-500">Cancel</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  <span className="text-sm text-gray-400">{cat.journalCount} journals</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingId(cat._id); setEditName(cat.name); setEditColor(cat.color); }} className="text-sm text-gray-500 hover:text-indigo-600">Edit</button>
                  <button onClick={() => handleDelete(cat._id)} className="text-sm text-gray-500 hover:text-red-600">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="text-center text-gray-500 py-8">No categories yet</p>}
      </div>
    </div>
  );
}
