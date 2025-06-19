import React, { useState } from 'react';
import { Search, Github, FileText, Clock, AlertTriangle, AlertCircle, Info, Download, Filter, Eye, RefreshCw, Trash2, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import LoggedInHeader from './LoggedInHeader';

const BugHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

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

  // Mock history data
  const mockHistoryData = [
    {
      id: 1,
      repoName: 'github.com/user/NoteApp',
      repoUrl: 'https://github.com/user/NoteApp',
      dateScanned: '2025-06-15T10:30:00Z',
      bugsFound: 12,
      topSeverity: 'Critical',
      filesScanned: 25,
      scanDuration: 8.5,
      status: 'completed'
    },
    {
      id: 2,
      repoName: 'github.com/user/AuthAPI',
      repoUrl: 'https://github.com/user/AuthAPI',
      dateScanned: '2025-06-10T14:20:00Z',
      bugsFound: 5,
      topSeverity: 'Major',
      filesScanned: 18,
      scanDuration: 6.2,
      status: 'completed'
    },
    {
      id: 3,
      repoName: 'github.com/user/TaskManager',
      repoUrl: 'https://github.com/user/TaskManager',
      dateScanned: '2025-06-08T09:15:00Z',
      bugsFound: 8,
      topSeverity: 'Major',
      filesScanned: 32,
      scanDuration: 12.1,
      status: 'completed'
    },
    {
      id: 4,
      repoName: 'github.com/user/ShoppingCart',
      repoUrl: 'https://github.com/user/ShoppingCart',
      dateScanned: '2025-06-05T16:45:00Z',
      bugsFound: 3,
      topSeverity: 'Minor',
      filesScanned: 14,
      scanDuration: 4.8,
      status: 'completed'
    },
    {
      id: 5,
      repoName: 'github.com/user/WeatherApp',
      repoUrl: 'https://github.com/user/WeatherApp',
      dateScanned: '2025-06-02T11:30:00Z',
      bugsFound: 15,
      topSeverity: 'Critical',
      filesScanned: 28,
      scanDuration: 9.7,
      status: 'completed'
    },
    {
      id: 6,
      repoName: 'github.com/user/BlogPlatform',
      repoUrl: 'https://github.com/user/BlogPlatform',
      dateScanned: '2025-05-28T13:20:00Z',
      bugsFound: 7,
      topSeverity: 'Major',
      filesScanned: 35,
      scanDuration: 11.3,
      status: 'completed'
    },
    {
      id: 7,
      repoName: 'github.com/user/ChatApp',
      repoUrl: 'https://github.com/user/ChatApp',
      dateScanned: '2025-05-25T15:10:00Z',
      bugsFound: 20,
      topSeverity: 'Critical',
      filesScanned: 42,
      scanDuration: 15.2,
      status: 'completed'
    },
    {
      id: 8,
      repoName: 'github.com/user/Dashboard',
      repoUrl: 'https://github.com/user/Dashboard',
      dateScanned: '2025-05-20T10:45:00Z',
      bugsFound: 4,
      topSeverity: 'Minor',
      filesScanned: 16,
      scanDuration: 5.1,
      status: 'completed'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'major': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'minor': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-n-3 bg-n-6 border-n-5';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '🔴';
      case 'major': return '🟠';
      case 'minor': return '🟡';
      default: return '⚪';
    }
  };

  // Filter and sort data
  const filteredData = mockHistoryData.filter(item => {
    const matchesSearch = item.repoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || item.topSeverity.toLowerCase() === severityFilter;

    let matchesDate = true;
    if (dateRange !== 'all') {
      const itemDate = new Date(item.dateScanned);
      const now = new Date();
      const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

      switch (dateRange) {
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        case 'quarter':
          matchesDate = daysDiff <= 90;
          break;
      }
    }

    return matchesSearch && matchesSeverity && matchesDate;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'date':
        aVal = new Date(a.dateScanned);
        bVal = new Date(b.dateScanned);
        break;
      case 'bugs':
        aVal = a.bugsFound;
        bVal = b.bugsFound;
        break;
      case 'name':
        aVal = a.repoName.toLowerCase();
        bVal = b.repoName.toLowerCase();
        break;
      case 'severity':
        const severityOrder = { 'critical': 3, 'major': 2, 'minor': 1 };
        aVal = severityOrder[a.topSeverity.toLowerCase()] || 0;
        bVal = severityOrder[b.topSeverity.toLowerCase()] || 0;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');

    // Redirect to login page
    window.location.href = '/';
  };

  const handleView = (repo) => {
    // Navigate to detailed view - you can implement this based on your routing
    console.log('View details for:', repo);
  };

  const handleRescan = (repo) => {
    // Trigger rescan - you can implement this based on your scan logic
    console.log('Rescan:', repo);
  };

  const handleDelete = (repo) => {
    // Delete history entry - you can implement this based on your data management
    if (window.confirm(`Are you sure you want to delete the scan history for ${repo.repoName}?`)) {
      console.log('Delete:', repo);
    }
  };

  const handleExport = () => {
    // Export functionality - you can implement CSV/PDF export
    console.log('Export history');
  };

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

                  {/* Date Range */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent appearance-none text-white [&>option]:bg-gray-800 [&>option]:text-white"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all" className="bg-gray-800 text-white">All Time</option>
                      <option value="week" className="bg-gray-800 text-white">Last Week</option>
                      <option value="month" className="bg-gray-800 text-white">Last Month</option>
                      <option value="quarter" className="bg-gray-800 text-white">Last 3 Months</option>
                    </select>
                  </div>

                  {/* Severity Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent appearance-none text-white [&>option]:bg-gray-800 [&>option]:text-white"
                      style={{colorScheme: 'dark'}}
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">🔴 Critical</option>
                      <option value="major">🟠 Major</option>
                      <option value="minor">🟡 Minor</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                      className="w-full pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent appearance-none text-white [&>option]:bg-gray-800 [&>option]:text-white"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="bugs-desc">Most Bugs</option>
                      <option value="bugs-asc">Least Bugs</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="severity-desc">Severity High-Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-n-3">
                    Showing {paginatedData.length} of {filteredData.length} results
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
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Bugs Found</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Top Severity</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Files</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Duration</th>
                    <th className="text-left py-4 px-6 font-semibold text-n-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={item.id} className="border-b border-n-6 hover:bg-n-6/30 transition-colors">
                      <td className="py-4 px-6 text-n-3 font-mono">
                        {(currentPage - 1) * itemsPerPage + index + 1}
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
                        {formatDate(item.dateScanned)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="font-bold text-n-1">{item.bugsFound}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(item.topSeverity)}`}>
                          <span>{getSeverityIcon(item.topSeverity)}</span>
                          {item.topSeverity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-n-2 font-mono">
                        {item.filesScanned}
                      </td>
                      <td className="py-4 px-6 text-n-2 font-mono">
                        {item.scanDuration}s
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
                            onClick={() => handleRescan(item)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                            title="Re-scan"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
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

              {paginatedData.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-n-6 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-n-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-n-2 mb-2">No Results Found</h3>
                  <p className="text-n-4">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-n-6 px-6 py-4 flex items-center justify-between border-t border-n-5">
                <div className="text-n-3 text-sm">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-n-7 hover:bg-n-5 text-n-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                            ? 'bg-color-1 text-white'
                            : 'bg-n-7 hover:bg-n-5 text-n-2'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-n-7 hover:bg-n-5 text-n-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugHistoryPage;