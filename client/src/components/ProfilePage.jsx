import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Trash2, Edit3, Save, X, Eye, EyeOff } from 'lucide-react';
import LoggedInHeader from './LoggedInHeader';

// Footer Component
const Footer = () => {
  return (
    <footer className="relative mt-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-7.5 xl:px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-n-4 text-sm">© 2025 BugWise. All rights reserved.</p>
          <p className="text-n-4 text-sm mt-2 md:mt-0">Made with ❤️ for developers</p>
        </div>
      </div>
    </footer>
  );
};

export default function ProfilePage({ onLogout, onUpdateProfile, onDeleteAccount }) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });3
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(() => {
    // Get user data from localStorage or your auth system
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return { 
      name: 'John Doe', 
      email: 'john.doe@example.com',
      joinDate: '2024-01-15',
      lastLogin: '2025-06-15T10:30:00Z',
      tokenExpiry: '2025-06-22T10:30:00Z',
      avatar: null
    };
  });

  // Initialize editedUsername with current user name
  React.useEffect(() => {
    setEditedUsername(user?.name || '');
  }, [user]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  const handleSaveUsername = () => {
    if (editedUsername.trim()) {
      onUpdateProfile && onUpdateProfile({ name: editedUsername });
      setIsEditingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUsername(user.name);
    setIsEditingUsername(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Handle password change logic here
    console.log('Changing password...');
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      onDeleteAccount && onDeleteAccount();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    onLogout && onLogout();
  };

  return (
    <div className="min-h-screen bg-n-8 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-40 h-40 bg-red-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-red-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-20 w-44 h-44 bg-pink-600/18 rounded-full blur-3xl animate-pulse delay-1200"></div>

        <div
          className="absolute top-1/4 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-3/4 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />
      </div>

      <LoggedInHeader onLogout={handleLogout} user={user} />

      <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-6">
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-color-1 to-purple-400 bg-clip-text text-transparent mb-1">
                  Profile Settings
                </h1>
                <p className="text-n-3 text-lg lg:text-xl font-light">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-n-7 border border-n-6 rounded-2xl p-6 shadow-2xl">
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-r from-color-1 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                  <p className="text-n-3 text-sm">{user.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-color-1" />
                    <span className="text-n-2">Joined {formatDate(user.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-color-1" />
                    <span className="text-n-2">Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-n-7 border border-n-6 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-color-1" />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-n-2 mb-2">Username</label>
                    <div className="flex items-center gap-2">
                      {isEditingUsername ? (
                        <>
                          <input
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="flex-1 px-3 py-2 bg-n-6 border border-n-5 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-color-1/50 focus:border-color-1/50"
                          />
                          <button
                            onClick={handleSaveUsername}
                            className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors duration-300"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors duration-300"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 px-3 py-2 bg-n-6/50 border border-n-5/50 rounded-lg text-white">
                            {user.name}
                          </span>
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="p-2 bg-color-1/20 hover:bg-color-1/30 text-color-1 rounded-lg transition-colors duration-300"
                          >
                            <Edit3 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-n-2 mb-2">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-n-4" />
                      <span className="text-white">{user.email}</span>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-medium text-n-2 mb-2">Member Since</label>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-n-4" />
                      <span className="text-white">{formatDate(user.joinDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-n-7 border border-n-6 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-color-1" />
                  Security Settings
                </h2>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="w-full sm:w-auto px-4 py-2 bg-color-1/20 hover:bg-color-1/30 text-color-1 rounded-lg transition-colors duration-300 border border-color-1/30 hover:border-color-1/50"
                    >
                      Change Password
                    </button>
                    
                    {showChangePassword && (
                      <div className="mt-4 space-y-3 p-4 bg-n-6/30 rounded-lg border border-n-5/30">
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 bg-n-6 border border-n-5 rounded-lg text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1/50"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-n-4 hover:text-color-1"
                          >
                            {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 bg-n-6 border border-n-5 rounded-lg text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1/50"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-n-4 hover:text-color-1"
                          >
                            {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 bg-n-6 border border-n-5 rounded-lg text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1/50"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-n-4 hover:text-color-1"
                          >
                            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleChangePassword(e);
                            }}
                            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors duration-300 border border-green-600/30"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => setShowChangePassword(false)}
                            className="px-4 py-2 bg-n-6/20 hover:bg-n-6/30 text-n-3 rounded-lg transition-colors duration-300 border border-n-6/30"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Last Login */}
                  <div className="text-sm text-n-4">
                    <span>Last login: </span>
                    <span className="text-white">{formatDateTime(user.lastLogin)}</span>
                  </div>

                  {/* JWT Token Expiry (Debug Info) */}
                  <div className="text-sm text-n-4">
                    <span>Token expires: </span>
                    <span className="text-white">{formatDateTime(user.tokenExpiry)}</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <Trash2 size={20} />
                  Danger Zone
                </h2>
                
                <div className="space-y-4">
                  <p className="text-n-3 text-sm">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors duration-300 border border-red-600/30 hover:border-red-600/50"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}