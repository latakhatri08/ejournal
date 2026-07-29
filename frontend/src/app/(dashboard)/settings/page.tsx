'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Appearance</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <div className="flex gap-3">
            {['light', 'dark', 'system'].map(t => (
              <button key={t} onClick={() => setTheme(t)} className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${theme === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSave} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Export Data</h3>
        <p className="text-sm text-gray-500 mb-4">Download all your journal entries as a ZIP file.</p>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
          Export All Data
        </button>
      </div>
      <div className="bg-white border border-red-200 rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all data. This action cannot be undone.</p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>
  );
}
