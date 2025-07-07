import React, { useState, useEffect } from 'react';
import { Search, Github, FileText, Clock, AlertTriangle, AlertCircle, Info, Download, Filter, Eye, RefreshCw, Trash2, Calendar, ExternalLink, ChevronLeft, ChevronRight, Loader2, X, Check } from 'lucide-react';
import LoggedInHeader from './LoggedInHeader';

const BugHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [scansData, setScansData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [statistics, setStatistics] = useState({});
  const [error, setError] = useState(null);
  const [rescanningIds, setRescanningIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const itemsPerPage = 10;
// Pick the API base URL from the env var, fall back to localhost in dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Footer Component
const Footer = () => {
  return (
    <footer className="relative mt-8">
      <div className="max-w-7xl mx-auto px-5 lg:px-7.5 xl:px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-n-4 text-sm">© 2025 BugWise. All rights reserved.</p>
          <p className="text-n-4 text-sm mt-2 md:mt-0">Made with ❤️ for developers</p>
        </div>
      </div>
    </footer>
  );
};

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
    return { name: 'User', email: 'user@example.com' };
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  // API call to fetch scan history
  const fetchScanHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE}/api/scan/history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setScansData(data.data || []);
        setPagination(data.pagination || {});
        setStatistics(data.statistics || {});
      } else {
        throw new Error(data.message || 'Failed to fetch scan history');
      }
    } catch (err) {
      console.error('Error fetching scan history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // API call to delete a scan
  const deleteScan = async (scanId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/scan/${scanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Refresh the data after successful deletion
        fetchScanHistory();
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete scan');
      }
    } catch (err) {
      console.error('Error deleting scan:', err);
      alert(`Error deleting scan: ${err.message}`);
      return false;
    }
  };

  // API call to start a new scan (rescan)
  const startRescan = async (repoUrl, scanId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Add to rescanning set
      setRescanningIds(prev => new Set([...prev, scanId]));

      const response = await fetch('${API_BASE}/api/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ repoUrl })
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Show success message and refresh data
        setTimeout(() => {
          setToast({
            type: 'success',
            message: 'Rescan started successfully!',
            description: `Repository "${repoUrl.split('/').pop()}" is being rescanned.`
          });
          fetchScanHistory();
        }, 2000); // Keep animation for 2 seconds
        return true;
      } else {
        throw new Error(data.message || 'Failed to start scan');
      }
    } catch (err) {
      console.error('Error starting rescan:', err);
      setRescanningIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(scanId);
        return newSet;
      });
      alert(`Error starting rescan: ${err.message}`);
      return false;
    }
  };

  setTimeout(() => setToast(null), 5000);
  // Effect to fetch data when component mounts or filters change
  useEffect(() => {
    fetchScanHistory();
  }, [currentPage, sortBy, sortOrder, statusFilter]);

  // Client-side filtering for search (removed severity filter)
  const filteredData = scansData.filter(item => {
    const matchesSearch = item.repoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.repoUrl.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'scanning': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-n-3 bg-n-6 border-n-5';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'scanning': return '🔄';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const handleLogout = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');

    // Redirect to login page
    window.location.href = '/';
  };

  const handleView = (scan) => {
  try {
    // Store scan data in sessionStorage for reliable access
    sessionStorage.setItem('selectedScanData', JSON.stringify(scan));
    
    // Navigate to detect-bugs page
    window.location.href = '/detect-bugs';
  } catch (error) {
    console.error('Error storing scan data:', error);
    // Fallback: try the original method
    const scanData = encodeURIComponent(JSON.stringify(scan));
    window.location.href = `/detect-bugs?scanData=${scanData}`;
  }
};

  const showConfirmDialog = (action, item) => {
    setConfirmAction({ action, item });
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    const { action, item } = confirmAction;

    setShowConfirmModal(false);
    setConfirmAction(null);

    if (action === 'rescan') {
      await startRescan(item.repoUrl, item.scanId);
    } else if (action === 'delete') {
      await deleteScan(item.scanId);
    }

  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleExport = () => {
    // Export functionality - you can implement CSV/PDF export
    const csvContent = [
      ['Repository', 'Status', 'Bugs Found', 'Files Scanned', 'Scan Date', 'Scan Type'].join(','),
      ...filteredData.map(scan => [
        scan.repoName,
        scan.status,
        scan.totalBugs || 0,
        scan.filesScanned || 0,
        new Date(scan.createdAt).toISOString(),
        scan.scanType || 'ai-powered'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (newSortValue) => {
    const [field, order] = newSortValue.split('-');
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const totalPages = pagination.totalPages || 1;
    const currentPage = pagination.currentPage || 1;
    const pages = [];

    // Always show first page
    pages.push(1);

    if (totalPages <= 5) {
      // If total pages is 5 or less, show all pages
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic
      if (currentPage <= 3) {
        // Show first 4 pages + last page
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        if (totalPages > 5) pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + last 4 pages
        if (totalPages > 5) pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        // Show first + current-1, current, current+1 + last
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return [...new Set(pages)]; // Remove duplicates
  };

  // Confirmation Modal Component
  const ConfirmModal = () => {
    if (!showConfirmModal || !confirmAction) return null;

    const { action, item } = confirmAction;
    const isRescan = action === 'rescan';

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white/10 via-white/20 to-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isRescan ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
              {isRescan ? (
                <RefreshCw className="w-8 h-8 text-green-400" />
              ) : (
                <Trash2 className="w-8 h-8 text-red-400" />
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {isRescan ? 'Confirm Rescan' : 'Confirm Delete'}
            </h3>

            <p className="text-n-3 mb-6 leading-relaxed">
              {isRescan
                ? `Are you sure you want to rescan "${item.repoName}"? This will start a new scan in the background.`
                : `Are you sure you want to delete the scan history for "${item.repoName}"? This action cannot be undone.`
              }
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${isRescan
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-500/90 hover:to-green-600/90 text-white'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-500/90 hover:to-red-600/90 text-white'
                  }`}
              >
                {isRescan ? 'Start Rescan' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && scansData.length === 0) {
    return (
      <div className="min-h-screen bg-n-8 relative overflow-hidden">
        <LoggedInHeader onLogout={handleLogout} user={user} />
        <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-color-1 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-n-2 mb-2">Loading Scan History</h3>
                <p className="text-n-4">Please wait while we fetch your scan data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-n-8 relative overflow-hidden">
        <LoggedInHeader onLogout={handleLogout} user={user} />
        <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-n-2 mb-2">Error Loading Data</h3>
                <p className="text-n-4 mb-4">{error}</p>
                <button
                  onClick={() => fetchScanHistory()}
                  className="px-6 py-3 bg-gradient-to-r from-color-1 to-purple-600 text-white font-semibold rounded-xl hover:from-color-1/90 hover:to-purple-600/90 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-n-8 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
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

      <LoggedInHeader
        onLogout={handleLogout}
        user={user}
      />

      <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-6">
              {/* Title Section */}
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-color-1 to-purple-400 bg-clip-text text-transparent mb-1">
                  Bug Scan History
                </h1>
                <p className="text-n-3 text-lg lg:text-l font-light">
                  View and manage all your previously scanned repositories
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search Section */}
          <div className="relative mb-8">
            <div className="relative bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-color-1/5 via-purple-500/5 to-blue-500/5 rounded-3xl opacity-50"></div>
              <div className="absolute inset-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl"></div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Filter & Search</h2>
                  <p className="text-n-3">Find specific repositories and scans</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by repo name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent text-white placeholder-white/60"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent appearance-none text-white [&>option]:bg-gray-800 [&>option]:text-white"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all" className="bg-gray-800 text-white">All Status</option>
                      <option value="pending" className="bg-gray-800 text-white">⏳ Pending</option>
                      <option value="scanning" className="bg-gray-800 text-white">🔄 Scanning</option>
                      <option value="completed" className="bg-gray-800 text-white">✅ Completed</option>
                      <option value="failed" className="bg-gray-800 text-white">❌ Failed</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent appearance-none text-white [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="repoName-asc">Name A-Z</option>
                      <option value="repoName-desc">Name Z-A</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-n-3">
                    Showing {filteredData.length} of {pagination.totalScans || 0} results
                    {loading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                  </div>

                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-color-1 to-purple-600 text-white font-semibold rounded-xl hover:from-color-1/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    Export History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-n-7 border border-n-6 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-n-6 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">#</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Repo Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Date Scanned</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Bugs Found</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Files</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.scanId} className="border-b border-n-6 hover:bg-n-6/30 transition-colors">
                      <td className="py-4 px-6 text-n-3 font-mono">
                        {(pagination.currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-color-1/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                            <Github className="w-4 h-4 text-color-1" />
                          </div>
                          <div>
                            <a
                              href={item.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-color-1 hover:text-color-1/80 transition-colors flex items-center gap-1 font-medium"
                            >
                              {item.repoName}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-n-2 font-mono text-sm">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                          <span>{getStatusIcon(item.status)}</span>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="font-bold text-n-1">{item.totalBugs || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-n-2 font-mono">
                        {item.filesScanned || 0}
                      </td>
                      <td className="py-4 px-6 text-n-2 font-mono text-sm">
                        {item.scanType || 'ai-powered'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => showConfirmDialog('rescan', item)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors relative"
                            title="Re-scan"
                            disabled={rescanningIds.has(item.scanId)}
                          >
                            <RefreshCw className={`w-4 h-4 ${rescanningIds.has(item.scanId) ? 'animate-spin' : ''}`} />
                            {rescanningIds.has(item.scanId) && (
                              <div className="absolute inset-0 bg-green-500/10 rounded-lg animate-pulse"></div>
                            )}
                          </button>
                          <button
                            onClick={() => showConfirmDialog('delete', item)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && !loading && (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-n-4 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-n-2 mb-2">No Scans Found</h3>
                <p className="text-n-4 mb-6">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No scans match your current filters. Try adjusting your search criteria.'
                    : 'You haven\'t performed any scans yet. Start by scanning your first repository!'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-color-1 to-purple-600 text-white font-semibold rounded-xl hover:from-color-1/90 hover:to-purple-600/90 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-n-6 hover:bg-n-5 disabled:opacity-50 disabled:cursor-not-allowed text-n-2 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {generatePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...' || page === currentPage}
                    className={`px-4 py-3 rounded-xl transition-colors font-medium ${page === currentPage
                      ? 'bg-gradient-to-r from-color-1 to-purple-600 text-white'
                      : page === '...'
                        ? 'text-n-4 cursor-default'
                        : 'bg-n-6 hover:bg-n-5 text-n-2'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-3 bg-n-6 hover:bg-n-5 disabled:opacity-50 disabled:cursor-not-allowed text-n-2 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`bg-gradient-to-br backdrop-blur-xl border rounded-2xl p-4 shadow-2xl transform transition-all duration-500 min-w-80 ${toast.type === 'success'
              ? 'from-green-500/20 via-green-400/10 to-green-500/20 border-green-500/30'
              : 'from-red-500/20 via-red-400/10 to-red-500/20 border-red-500/30'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                {toast.type === 'success' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{toast.message}</h4>
                {toast.description && (
                  <p className="text-n-3 text-xs mt-1">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-n-4 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmModal />
      {/* Quick Actions Footer */}
      <div className="mt-12 mb-8 mr-15 ml-15">
        <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-n-1 mb-1">Need Help?</h3>
              <p className="text-n-4 text-sm">
                Check our documentation or contact support for assistance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open('/docspage', '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl transition-all duration-300"
              >
                <FileText className="w-4 h-4" />
                Documentation
              </button>
              <button
                onClick={() => window.location.href = '/detect-bugs'}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-color-1 to-purple-600 text-white font-semibold rounded-xl hover:from-color-1/90 hover:to-purple-600/90 transition-all duration-300"
              >
                <Github className="w-4 h-4" />
                New Scan
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};



export default BugHistoryPage;