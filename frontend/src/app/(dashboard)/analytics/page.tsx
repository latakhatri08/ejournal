'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Dashboard {
  totalJournals: number;
  totalDrafts: number;
  totalBookmarks: number;
  streak: number;
  recentJournals: { _id: string; title: string; mood: string; createdAt: string; category?: { name: string; color: string } }[];
  moodDistribution: { _id: string; count: number }[];
  monthlyActivity: { _id: number; count: number }[];
}

const moodColors: Record<string, string> = { great: '#10b981', good: '#6366f1', neutral: '#f59e0b', bad: '#f97316', terrible: '#ef4444' };
const moodEmojis: Record<string, string> = { great: '😄', good: '🙂', neutral: '😐', bad: '😔', terrible: '😢' };

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(d => { setDashboard(d.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
  if (!dashboard) return <div className="text-center py-12 text-gray-500">Failed to load analytics</div>;

  const maxMood = Math.max(...dashboard.moodDistribution.map(m => m.count), 1);
  const maxMonthly = Math.max(...dashboard.monthlyActivity.map(m => m.count), 1);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Journals', value: dashboard.totalJournals, color: 'bg-indigo-500' },
          { label: 'Drafts', value: dashboard.totalDrafts, color: 'bg-yellow-500' },
          { label: 'Bookmarks', value: dashboard.totalBookmarks, color: 'bg-pink-500' },
          { label: 'Day Streak', value: dashboard.streak, color: 'bg-orange-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className={`${stat.color} text-white text-2xl font-bold rounded-lg py-2 mb-2`}>{stat.value}</div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Mood Distribution</h3>
          {dashboard.moodDistribution.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No mood data yet</p>
          ) : (
            <div className="space-y-3">
              {dashboard.moodDistribution.map(mood => (
                <div key={mood._id} className="flex items-center gap-3">
                  <span className="text-lg w-8">{moodEmojis[mood._id] || '😐'}</span>
                  <span className="text-sm w-16 capitalize">{mood._id}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(mood.count / maxMood) * 100}%`, backgroundColor: moodColors[mood._id] || '#999' }} />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{mood.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Activity</h3>
          {dashboard.monthlyActivity.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No activity data</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {dashboard.monthlyActivity.map(day => (
                <div key={day._id} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${(day.count / maxMonthly) * 100}%`, minHeight: 4 }} />
                  <span className="text-[10px] text-gray-400 mt-1">{day._id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Journals</h3>
        {dashboard.recentJournals.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No journals yet</p>
        ) : (
          <div className="space-y-3">
            {dashboard.recentJournals.map(j => (
              <div key={j._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{j.title}</p>
                  <p className="text-xs text-gray-400">{new Date(j.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {j.category && <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: j.category.color }}>{j.category.name}</span>}
                  {j.mood && <span className="text-lg">{moodEmojis[j.mood]}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
