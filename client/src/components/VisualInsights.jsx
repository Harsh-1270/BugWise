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

  // Mock data for visualizations
  const timelineData = [
    { date: '2024-01-01', total: 15, critical: 3, major: 7, minor: 5 },
    { date: '2024-01-08', total: 22, critical: 5, major: 10, minor: 7 },
    { date: '2024-01-15', total: 18, critical: 2, major: 8, minor: 8 },
    { date: '2024-01-22', total: 28, critical: 8, major: 12, minor: 8 },
    { date: '2024-01-29', total: 16, critical: 4, major: 6, minor: 6 },
    { date: '2024-02-05', total: 35, critical: 12, major: 15, minor: 8 },
    { date: '2024-02-12', total: 24, critical: 6, major: 11, minor: 7 },
    { date: '2024-02-19', total: 31, critical: 9, major: 14, minor: 8 }
  ];

  const severityDistribution = [
    { name: 'Critical', value: 49, color: '#ef4444' },
    { name: 'Major', value: 83, color: '#f97316' },
    { name: 'Minor', value: 57, color: '#eab308' }
  ];

  const repoData = [
    { name: 'e-commerce-app', bugs: 45, critical: 12, major: 20, minor: 13 },
    { name: 'user-auth-service', bugs: 32, critical: 8, major: 15, minor: 9 },
    { name: 'payment-gateway', bugs: 28, critical: 15, major: 8, minor: 5 },
    { name: 'inventory-system', bugs: 24, critical: 6, major: 11, minor: 7 },
    { name: 'notification-api', bugs: 20, critical: 4, major: 9, minor: 7 }
  ];

  const fileData = [
    { file: '/src/components/Login.jsx', bugs: 18 },
    { file: '/utils/payment-processor.js', bugs: 15 },
    { file: '/src/components/Dashboard.jsx', bugs: 12 },
    { file: '/utils/validation.js', bugs: 11 },
    { file: '/src/api/user-service.js', bugs: 9 },
    { file: '/components/ProductList.jsx', bugs: 8 },
    { file: '/utils/database-helper.js', bugs: 7 }
  ];

  const repositories = [
    'all',
    'e-commerce-app',
    'user-auth-service',
    'payment-gateway',
    'inventory-system',
    'notification-api'
  ];

  const languages = ['all', 'JavaScript', 'Python', 'Java', 'TypeScript', 'PHP'];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');

    // Redirect to login page
    window.location.href = '/';
  };

  const totalBugs = severityDistribution.reduce((sum, item) => sum + item.value, 0);
  const totalRepos = repoData.length;
  const avgBugsPerScan = (totalBugs / timelineData.length).toFixed(1);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Bug className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400">Total Bugs Found</p>
                  <p className="text-3xl font-bold text-n-1">{totalBugs}</p>
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
                <h3 className="text-xl font-bold text-n-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-color-1" />
                  Bugs Found Over Time
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-n-1 rounded-xl hover:bg-white/15 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3} name="Total" />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
                  <Line type="monotone" dataKey="major" stroke="#f97316" strokeWidth={2} name="Major" />
                  <Line type="monotone" dataKey="minor" stroke="#eab308" strokeWidth={2} name="Minor" />
                </LineChart>
              </ResponsiveContainer>
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
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        color: '#111827',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      labelStyle={{
                        color: '#374151',
                        fontWeight: '600'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Top Buggy Repositories */}
              <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-n-1 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-color-1" />
                  Top Buggy Repositories
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={repoData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#9CA3AF"
                      fontSize={12}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Bar dataKey="bugs" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Horizontal Bar Chart - Top Buggy Files */}
            <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-n-1 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-color-1" />
                Buggiest Files
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fileData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis
                    type="category"
                    dataKey="file"
                    stroke="#9CA3AF"
                    fontSize={11}
                    width={200}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="bugs" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stacked Area Chart - Bug Severity per Repo */}
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
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                  <Bar dataKey="major" stackId="a" fill="#f97316" name="Major" />
                  <Bar dataKey="minor" stackId="a" fill="#eab308" name="Minor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualInsightsPage;