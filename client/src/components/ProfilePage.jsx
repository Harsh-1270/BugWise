import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Trash2, Edit3, Save, X, Eye, EyeOff, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import LoggedInHeader from './LoggedInHeader';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-600/20 to-green-500/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-gradient-to-r from-red-600/20 to-red-500/20 border-red-500/30 text-red-400';
      default:
        return 'bg-gradient-to-r from-color-1/20 to-purple-500/20 border-color-1/30 text-color-1';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={`fixed top-24 right-5 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`backdrop-blur-xl border rounded-2xl p-4 shadow-2xl max-w-sm ${getToastStyles()}`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className="font-medium flex-1">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

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

export default function ProfilePage({ onLogout }) {
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  // Check authentication status
  const checkAuth = () => {
    const token = getAuthToken();
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      // No token or user data, redirect to login
      handleLogout();
      return false;
    }
    
    try {
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
      setEditedUsername(parsedUserData.name || '');
      return true;
    } catch (error) {
      console.error('Error parsing user data:', error);
      handleLogout();
      return false;
    }
  };

  useEffect(() => {
    // Check authentication first
    if (!checkAuth()) {
      return;
    }

    const fetchProfile = async () => {
      const token = getAuthToken();
      if (!token) {
        handleLogout();
        return;
      }

      try {
        const res = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        
        if (!res.ok) {
          // If unauthorized, logout
          if (res.status === 401 || res.status === 403) {
            handleLogout();
            return;
          }
          throw new Error(data.message || 'Failed to fetch profile');
        }

        setUser(data.data);
        setEditedUsername(data.data.name);
        // Update localStorage with fresh data
        localStorage.setItem('userData', JSON.stringify(data.data));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile:', err.message);
        setError(err.message || 'Something went wrong');
        setLoading(false);
        
        // If it's an auth error, logout
        if (err.message.includes('unauthorized') || err.message.includes('token')) {
          handleLogout();
        }
      }
    };

    fetchProfile();
  }, []);

  const onUpdateProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      showToast('No auth token found', 'error');
      handleLogout();
      return;
    }

    if (!editedUsername || editedUsername.trim().length < 3 || editedUsername.trim().length > 30) {
      showToast('Username must be between 3 and 30 characters', 'error');
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editedUsername.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data.data);
      setEditedUsername(data.data.name);
      setIsEditingUsername(false);
      setError('');
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(data.data));
      showToast('Username updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast(err.message || 'Failed to update username', 'error');
    }
  };

  const onChangePassword = async () => {
    const token = getAuthToken();
    if (!token) {
      showToast('No auth token found', 'error');
      handleLogout();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      setError('');
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      console.error('Error changing password:', err);
      showToast(err.message || 'Failed to change password', 'error');
    }
  };

  const onDeleteAccount = async () => {
    const token = getAuthToken();
    if (!token) {
      showToast('No auth token found', 'error');
      handleLogout();
      return;
    }

    const confirmPassword = prompt('Please confirm your password to delete your account:');
    if (!confirmPassword) return;

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return;
        }
        throw new Error(data.message || 'Failed to delete account');
      }

      showToast('Account deleted successfully!', 'success');
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  const handleSaveUsername = () => {
    if (editedUsername.trim()) {
      onUpdateProfile();
    }
  };

  const handleCancelEdit = () => {
    setEditedUsername(user?.name || '');
    setIsEditingUsername(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    onChangePassword();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      onDeleteAccount();
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
    if (onLogout) {
      onLogout();
    }
  };

  // Show loading or redirect if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color-1 mx-auto mb-4"></div>
          <p className="text-n-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-n-8 relative overflow-hidden">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
              <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
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
              <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
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
                            className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent"
                          />
                          <button
                            onClick={handleSaveUsername}
                            className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl transition-colors duration-300 border border-green-600/30"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-colors duration-300 border border-red-600/30"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white">
                            {user.name}
                          </span>
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="p-2 bg-color-1/20 hover:bg-color-1/30 text-color-1 rounded-xl transition-colors duration-300 border border-color-1/30"
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
              <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-color-1" />
                  Security Settings
                </h2>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="w-full sm:w-auto px-4 py-2 bg-color-1/20 hover:bg-color-1/30 text-color-1 rounded-xl transition-colors duration-300 border border-color-1/30 hover:border-color-1/50"
                    >
                      Change Password
                    </button>

                    {showChangePassword && (
                      <div className="mt-4 space-y-3 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/20">
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent"
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
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent"
                          />
                          <button type="button"
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
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder-n-4 focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent"
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
                            onClick={handleChangePassword}
                            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl transition-colors duration-300 border border-green-600/30"
                          >
                            Update Password
                          </button>
                          <button
                            onClick={() => setShowChangePassword(false)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-n-3 rounded-xl transition-colors duration-300 border border-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Last Login */}
                  {user.lastLogin && (
                    <div className="text-sm text-n-4">
                      <span>Last login: </span>
                      <span className="text-white">{formatDateTime(user.lastLogin)}</span>
                    </div>
                  )}

                  {/* JWT Token Expiry (Debug Info) */}
                  {user.tokenExpiry && (
                    <div className="text-sm text-n-4">
                      <span>Token expires: </span>
                      <span className="text-white">{formatDateTime(user.tokenExpiry)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gradient-to-br from-red-900/10 via-red-800/10 to-red-900/10 backdrop-blur-xl border border-red-800/30 rounded-3xl p-6">
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
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-colors duration-300 border border-red-600/30 hover:border-red-600/50"
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