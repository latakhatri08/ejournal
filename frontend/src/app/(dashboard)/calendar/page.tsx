'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Journal { _id: string; title: string; mood: string; isPinned: boolean; createdAt: string; }

const moodEmojis: Record<string, string> = { great: '😄', good: '🙂', neutral: '😐', bad: '😔', terrible: '😢' };

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    api.get(`/journals/calendar?year=${year}&month=${month + 1}`).then(d => setJournals(d.journals)).catch(() => {});
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const journalsByDay: Record<number, Journal[]> = {};
  journals.forEach(j => {
    const day = new Date(j.createdAt).getDate();
    if (!journalsByDay[day]) journalsByDay[day] = [];
    journalsByDay[day].push(j);
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-lg font-semibold">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-gray-50 min-h-[80px]" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const dayJournals = journalsByDay[day] || [];
            return (
              <div key={day} onClick={() => setSelectedDay(selectedDay === day ? null : day)} className={`bg-white min-h-[80px] p-1.5 cursor-pointer hover:bg-indigo-50 transition-colors ${isToday ? 'ring-2 ring-indigo-500' : ''} ${selectedDay === day ? 'bg-indigo-50' : ''}`}>
                <span className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {dayJournals.slice(0, 3).map(j => (
                    <Link key={j._id} href={`/journals/${j._id}/edit`} onClick={e => e.stopPropagation()} className="block text-[10px] truncate bg-indigo-100 text-indigo-700 rounded px-1 py-0.5 hover:bg-indigo-200">
                      {moodEmojis[j.mood] || ''} {j.title}
                    </Link>
                  ))}
                  {dayJournals.length > 3 && <span className="text-[10px] text-gray-400">+{dayJournals.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDay && journalsByDay[selectedDay] && (
        <div className="bg-white border border-gray-200 rounded-xl mt-4 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Entries for {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay}</h3>
          <div className="space-y-2">
            {journalsByDay[selectedDay].map(j => (
              <Link key={j._id} href={`/journals/${j._id}/edit`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <span className="font-medium text-gray-900">{j.title}</span>
                <span className="text-lg">{moodEmojis[j.mood] || '😐'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
