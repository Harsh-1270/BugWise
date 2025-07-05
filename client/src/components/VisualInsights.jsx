
import React, { useState, useEffect } from 'react';
import { Calendar, Filter, TrendingUp, PieChart, BarChart3, FileText, Download, Bug, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Area, AreaChart } from 'recharts';
import LoggedInHeader from './LoggedInHeader';

const VisualInsightsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [error, setError] = useState(null);

  // Data states
  const [timelineData, setTimelineData] = useState([]);
  const [severityDistribution, setSeverityDistribution] = useState([]);
  const [repoData, setRepoData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [repositories, setRepositories] = useState(['all']);
  const [languages, setLanguages] = useState(['all']);
  const [totalBugs, setTotalBugs] = useState(0);
  const [totalRepos, setTotalRepos] = useState(0);
  const [avgBugsPerScan, setAvgBugsPerScan] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
    const [scanHistory, setScanHistory] = useState([]);
    const [dashboardData, setDashboardData] = useState({
    overview: {
      totalScans: 0,
      completedScans: 0,
      failedScans: 0,
      successRate: 0,
      totalBugsFound: 0,
      totalFilesScanned: 0,
      avgScanTime: 0
    },
    recentActivity: [],
    bugDistribution: {}
  });

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

  // User state using in-memory storage instead of localStorage
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com' });

  // Initialize user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Utility function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  // API call function with auth
  const apiCall = async (url, options = {}) => {
    const token = getAuthToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json();
  };

  // Helper function to convert date range to days
  const getDateRangeDays = (range) => {
    switch (range) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case '1year': return 365;
      default: return 30;
    }
  };

  // Fetch analytics data using the new API endpoint
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        dateRange: getDateRangeDays(dateRange).toString(),
        ...(severityFilter !== 'all' && { severity: severityFilter }),
        ...(selectedRepo !== 'all' && { repository: selectedRepo }),
        ...(languageFilter !== 'all' && { language: languageFilter })
      });

      // Use the new analytics overview endpoint
      const response = await apiCall(`/api/scan/analytics/overview?${params}`);

      if (!response.success) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = response.data;
await Promise.all([
        fetchDashboardData(),
        fetchScanHistory()
      ]);
      // Set summary metrics
      setTotalBugs(data.summary.totalBugs);
      setTotalRepos(data.summary.totalRepos);
      setAvgBugsPerScan(data.summary.avgBugsPerScan);
      setTotalScans(data.summary.totalScans);

      // Set chart data - Fix severity distribution mapping
      setSeverityDistribution(data.severityDistribution || []);
      setTimelineData(data.timeline || []);
      setRepoData(data.topRepositories || []);
      setFileData(data.topFiles || []);

      // Set filter options
      setRepositories(data.filters.repositories || ['all']);
      setLanguages(data.filters.languages || ['all']);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

    // Process scan history into timeline data
  const processTimelineData = (scans) => {
    const timelineMap = new Map();
    
    scans.forEach(scan => {
      const date = new Date(scan.createdAt).toISOString().split('T')[0];
      
      if (!timelineMap.has(date)) {
        timelineMap.set(date, {
          date,
          total: 0,
          critical: 0,
          completed: 0,
          failed: 0
        });
      }
      
      const dayData = timelineMap.get(date);
      dayData.total += 1;
      dayData[scan.status] = (dayData[scan.status] || 0) + 1;
      
      if (scan.totalBugs) {
        dayData.bugs = (dayData.bugs || 0) + scan.totalBugs;
      }
    });

    return Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Process bug distribution data
  const processBugDistribution = (bugDistribution) => {
    const colors = {
      critical: '#ef4444',
      major: '#f97316', 
      minor: '#eab308',
      unknown: '#6b7280'
    };

    return Object.entries(bugDistribution).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: colors[severity] || colors.unknown
    }));
  };

   // Fetch dashboard statistics
  const fetchDashboardData = async () => {
    try {
      const response = await apiCall(`/api/scan/stats/dashboard?timeRange=${dateRange}`);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw err;
    }
  };

  // Fetch scan history for timeline
  const fetchScanHistory = async () => {
    try {
      const response = await apiCall(`/api/scan/history?limit=50&sortBy=createdAt&sortOrder=desc`);
      
      if (response.success) {
        setScanHistory(response.data);
        
        // Filter by date range and severity
        let filteredScans = response.data;
        
        if (dateRange !== 'all') {
          const days = parseInt(dateRange.replace('d', ''));
          const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          filteredScans = filteredScans.filter(scan => new Date(scan.createdAt) >= cutoffDate);
        }
        
        setTimelineData(processTimelineData(filteredScans));
      } else {
        throw new Error('Failed to fetch scan history');
      }
    } catch (err) {
      console.error('Error fetching scan history:', err);
      throw err;
    }
  };

  // Main data fetching function
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data in parallel for better performance
      await Promise.all([
        fetchDashboardData(),
        fetchScanHistory()
      ]);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  // Re-fetch data when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, severityFilter, selectedRepo, languageFilter]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    window.location.href = '/';
  };

  const handleExportCSV = () => {
    // Create CSV data
    const csvData = [
      ['Repository', 'Total Bugs', 'Critical', 'Major', 'Minor', 'Unknwon'],
      ...repoData.map(repo => [
        repo.name,
        repo.bugs,
        repo.critical || 0,
        repo.major || 0,
        repo.minor || 0,
        repo.unknown || 0
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugwise-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

const handleExportPDF = () => {
  import('jspdf').then(jsPDFModule => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDFModule.jsPDF();
      doc.setFontSize(18);
      doc.text('BugWise - Visual Insights Report', 14, 22);

      const headers = [['Repository', 'Total Bugs', 'Critical', 'Major', 'Minor', 'Unknown']];
      const rows = repoData.map(repo => [
        repo.name,
        repo.bugs,
        repo.critical || 0,
        repo.major || 0,
        repo.minor || 0,
        repo.unknown || 0
      ]);

      doc.autoTable({
        startY: 30,
        head: headers,
        body: rows,
        styles: { fontSize: 10 }
      });

      doc.save(`bugwise-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    });
  });
};


  if (error) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-2">Error loading data</p>
          <p className="text-n-3 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-6 py-2 bg-color-1 text-white rounded-xl hover:bg-color-1/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-color-1 mx-auto mb-4" />
          <p className="text-n-3 text-lg">Loading visual insights...</p>
        </div>
      </div>
    );
  }

  const bugDistributionData = processBugDistribution(dashboardData.bugDistribution);

  return (
    <div className="min-h-screen bg-n-8 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-green-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
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
                  Visual Insights
                </h1>
                <p className="text-n-3 text-lg lg:text-l font-light">
                  Analyze bug trends, severity, and hotspots across all your scanned repositories
                </p>
              </div>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bug className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400">Total Bugs Found</p>
                  <p className="text-3xl font-bold text-n-1">{totalBugs.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-color-1/20 to-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-color-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-color-1">Total Repos Scanned</p>
                  <p className="text-3xl font-bold text-n-1">{totalRepos}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">Avg. Bugs per Scan</p>
                  <p className="text-3xl font-bold text-n-1">{avgBugsPerScan}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-400">Total Scans</p>
                  <p className="text-3xl font-bold text-n-1">{totalScans}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-color-1" />
              <h3 className="text-lg font-semibold text-white">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-n-3 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="1year">Last year</option>
                </select>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-medium text-n-3 mb-2">Severity Level</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
              </div>

              {/* Repo Selector */}
              <div>
                <label className="block text-sm font-medium text-n-3 mb-2">Repository</label>
                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  {repositories.map(repo => (
                    <option key={repo} value={repo}>
                      {repo === 'all' ? 'All Repositories' : repo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-n-3 mb-2">Language</label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent [&>option]:bg-gray-800 [&>option]:text-white"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang === 'all' ? 'All Languages' : lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="space-y-8">
            {/* Line Chart - Bugs Over Time */}
            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-color-1" />
                  <h3 className="text-lg font-semibold text-white">Bug Trends Over Time</h3>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '12px',
                        color: '#F3F4F6',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                    />
                    {severityFilter === 'all' && (
                      <Area
                        type="monotone"
                        dataKey="critical"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCritical)"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart - Severity Distribution */}
              <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-n-1 mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-color-1" />
                  Severity Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '12px',
                        color: '#F3F4F6',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelStyle={{
                        color: '#F3F4F6',
                        fontWeight: '600'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

               {/* Recent Activity */}
              <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-color-1" />
                  <h3 className="text-lg font-semibold text-white">Recent Scan Activity</h3>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.status === 'completed' ? 'bg-green-400' : 
                            activity.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                          <div>
                            <p className="text-white font-medium">{activity.repoName}</p>
                            <p className="text-n-3 text-sm">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-n-1 font-medium">{activity.bugsFound} bugs</p>
                          <p className={`text-sm capitalize ${
                            activity.status === 'completed' ? 'text-green-400' : 
                            activity.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {activity.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-n-3">No recent activity found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stacked Bar Chart - Bug Severity per Repo */}
            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-n-1 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-color-1" />
                Bug Severity per Repository
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={repoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '12px',
                      color: '#F3F4F6',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                  <Bar dataKey="major" stackId="a" fill="#f97316" name="Major" />
                  <Bar dataKey="minor" stackId="a" fill="#eab308" name="Minor" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Export Options */}
            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-color-1" />
                  <h3 className="text-lg font-semibold text-white">Export Data</h3>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-gradient-to-r from-color-1 to-purple-500 text-white rounded-xl hover:from-color-1/80 hover:to-purple-500/80 transition-all duration-200 font-medium"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-500/80 hover:to-emerald-500/80 transition-all duration-200 font-medium"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <p className="text-n-3 text-sm mt-2">
                Export your visual insights data for further analysis or reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VisualInsightsPage;