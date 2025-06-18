import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Camera, LogOut, Trash2, Edit3, Save, X, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage({ user, onLogout, onUpdateProfile, onDeleteAccount }) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.name || '');
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

  // Mock user data if not provided
  const userData = user || {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: '2024-01-15',
    lastLogin: '2025-06-15T10:30:00Z',
    tokenExpiry: '2025-06-22T10:30:00Z',
    avatar: null
  };

  const handleSaveUsername = () => {
    if (editedUsername.trim()) {
      onUpdateProfile && onUpdateProfile({ name: editedUsername });
      setIsEditingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUsername(userData.name);
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

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-red-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-44 h-44 bg-purple-500/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-red-500/15 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-20 w-52 h-52 bg-pink-600/12 rounded-full blur-3xl animate-pulse delay-1200"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-800"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-red-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 border border-red-600/30 hover:border-red-600/50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                    {userData.avatar ? (
                      <img src={userData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      userData.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors duration-300">
                    <Camera size={14} className="text-white" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold text-white">{userData.name}</h3>
                <p className="text-gray-400 text-sm">{userData.email}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-purple-400" />
                  <span className="text-gray-300">Joined {formatDate(userData.joinDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User size={16} className="text-purple-400" />
                  <span className="text-gray-300">Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-400" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <div className="flex items-center gap-2">
                    {isEditingUsername ? (
                      <>
                        <input
                          type="text"
                          value={editedUsername}
                          onChange={(e) => setEditedUsername(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
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
                        <span className="flex-1 px-3 py-2 bg-gray-800/30 border border-gray-700/30 rounded-lg text-white">
                          {userData.name}
                        </span>
                        <button
                          onClick={() => setIsEditingUsername(true)}
                          className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors duration-300"
                        >
                          <Edit3 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-white">{userData.email}</span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-white">{formatDate(userData.joinDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={20} className="text-purple-400" />
                Security Settings
              </h2>

              <div className="space-y-4">
                {/* Change Password */}
                <div>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors duration-300 border border-purple-600/30 hover:border-purple-600/50"
                  >
                    Change Password
                  </button>
                  
                  {showChangePassword && (
                    <div className="mt-4 space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Current Password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-3 py-2 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
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
                          className="w-full px-3 py-2 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
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
                          className="w-full px-3 py-2 pr-10 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
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
                          className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-colors duration-300 border border-gray-600/30"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Last Login */}
                <div className="text-sm text-gray-400">
                  <span>Last login: </span>
                  <span className="text-white">{formatDateTime(userData.lastLogin)}</span>
                </div>

                {/* JWT Token Expiry (Debug Info) */}
                <div className="text-sm text-gray-400">
                  <span>Token expires: </span>
                  <span className="text-white">{formatDateTime(userData.tokenExpiry)}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/20 backdrop-blur-xl border border-red-800/30 rounded-2xl p-6 shadow-2xl shadow-red-500/5 ring-1 ring-red-500/10">
              <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                <Trash2 size={20} />
                Danger Zone
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
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
  );
}