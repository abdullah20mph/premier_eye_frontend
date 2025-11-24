import React, { useState } from 'react';
import { User, Lock, Mail, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [profile, setProfile] = useState({
    displayName: 'Dr. Smith',
    email: 'dr.smith@agentum.ai'
  });

  const [security, setSecurity] = useState({
    username: 'drsmith',
    currentPassword: '',
    newPassword: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto h-full overflow-y-auto custom-scrollbar pb-20 pt-4">
      
      <div className="flex items-center justify-between mb-12">
        <div>
            <h1 className="text-3xl font-bold text-brand-black tracking-tight">Account Settings</h1>
            <p className="text-gray-500 mt-2">Manage your profile details and security.</p>
        </div>
        {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="w-4 h-4" />
                Saved
            </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        
        {/* Profile Section */}
        <section>
            <h2 className="text-lg font-bold text-brand-black mb-6 border-b border-gray-100 pb-2">
                Profile Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
                <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-blue transition-colors">Display Name</label>
                    <div className="relative">
                        <input 
                            className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg placeholder-gray-300 font-medium"
                            value={profile.displayName}
                            onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        />
                        <User className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-blue transition-colors">Email Address</label>
                    <div className="relative">
                        <input 
                            type="email"
                            className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg placeholder-gray-300 font-medium"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
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
          
            <div className="space-y-6">
                <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-blue transition-colors">Username</label>
                    <div className="relative">
                        <input 
                            className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg placeholder-gray-300 font-medium"
                            value={security.username}
                            onChange={(e) => setSecurity({...security, username: e.target.value})}
                        />
                        <div className="absolute right-2 top-3 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">PUBLIC</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-blue transition-colors">Current Password</label>
                        <div className="relative">
                            <input 
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg font-medium"
                                value={security.currentPassword}
                                onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                            />
                             <Lock className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-blue transition-colors">New Password</label>
                        <div className="relative">
                            <input 
                                type="password"
                                placeholder="Enter to change"
                                className="w-full p-3 bg-transparent border-b border-gray-200 focus:border-brand-blue outline-none transition text-brand-black text-lg font-medium"
                                value={security.newPassword}
                                onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                            />
                             <Lock className="absolute right-2 top-3 w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div className="pt-8">
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 bg-brand-black text-brand-blue rounded-full font-bold hover:bg-gray-900 transition shadow-lg shadow-brand-blue/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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