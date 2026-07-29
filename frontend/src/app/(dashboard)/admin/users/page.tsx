'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User { _id: string; name: string; email: string; role: string; journalCount: number; createdAt: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const data = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const updateRole = async (id: string, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role });
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their data?')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 outline-none" />
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Role</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Journals</th>
                <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Joined</th>
                <th className="text-right px-5 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <select value={user.role} onChange={e => updateRole(user._id, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{user.journalCount}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteUser(user._id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
