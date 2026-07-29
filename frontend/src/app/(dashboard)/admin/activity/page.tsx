'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Log { _id: string; action: string; resource: string; details: string; createdAt: string; user: { name: string; email: string }; }

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-gray-100 text-gray-700',
  export: 'bg-yellow-100 text-yellow-700',
  upload: 'bg-indigo-100 text-indigo-700',
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/activity?page=${page}&limit=30`);
      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page]);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Logs</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Action</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Resource</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">Details</th>
                  <th className="text-right px-5 py-3 text-sm font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-3 text-sm">
                      <p className="font-medium text-gray-900">{log.user?.name || 'Unknown'}</p>
                      <p className="text-gray-500 text-xs">{log.user?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 capitalize">{log.resource}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{log.details}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 text-right">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-50">Previous</button>
              <span className="px-3 py-1 text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
