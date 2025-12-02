import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Save, CheckCircle2 } from 'lucide-react';
import api from '../services/client';

export default function SettingsPage({ onProfileUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile state from backend
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
  });

  // Only password fields
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
  });

  // Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);
        setError(null);

        const res = await api.get('/user/settings/profile');
        const data = res.data?.data || {};

        setProfile({
          displayName: data.display_name ?? '',
          email: data.email ?? '',
        });
      } catch (err: any) {
        console.error('Failed to load profile', err);
        setError(
          err?.response?.data?.message || 'Failed to load profile information.'
        );
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // Save profile + password
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);
    setError(null);

    try {
      // Update profile
      await api.patch('/user/settings/profile', {
        display_name: profile.displayName,
        email: profile.email,
      });

      onProfileUpdated({
        display_name: profile.displayName,
        email: profile.email,
      });

      // Update password (if provided)
      if (security.newPassword.trim()) {
        await api.patch('/user/settings/password', {
          current_password: security.currentPassword,
          new_password: security.newPassword,
        });

        setSecurity({
          currentPassword: '',
          newPassword: '',
        });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(
        err?.response?.data?.message ||
        'Failed to save settings. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-full overflow-y-auto custom-scrollbar pb-20 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-black tracking-tight">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-2">Manage your profile details and security.</p>
        </div>

        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {loadingProfile && !error && (
        <div className="mb-6 text-sm text-gray-400">Loading profile…</div>
      )}

      <form onSubmit={handleSave} className="space-y-12">
        {/* Profile Section */}
        <section>
          <h2 className="text-lg font-bold text-brand-black mb-6 border-b border-gray-100 pb-2">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <div className="relative">
                <input
                  className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg placeholder-gray-300 font-medium"
                  value={profile.displayName}
                  onChange={(e) =>
                    setProfile({ ...profile, displayName: e.target.value })
                  }
                  placeholder={loadingProfile ? 'Loading…' : 'Your name'}
                />
                <User className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg placeholder-gray-300 font-medium"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder={loadingProfile ? 'Loading…' : 'you@example.com'}
                />
                <Mail className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-lg font-bold text-brand-black mb-6 border-b border-gray-100 pb-2">
            Security
          </h2>

          {/* Removed display_name input here */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg font-medium"
                  value={security.currentPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, currentPassword: e.target.value })
                  }
                />
                <Lock className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter to change"
                  className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg font-medium"
                  value={security.newPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, newPassword: e.target.value })
                  }
                />
                <Lock className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-brand-black text-brand-blue rounded-full font-bold hover:bg-gray-900 transition shadow-lg shadow-brand-blue/10 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
