import React, { useState } from 'react';
import { Search, Github, FileText, Clock, AlertTriangle, AlertCircle, Info, Download, Filter, Play, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoggedInHeader from './LoggedInHeader';

const DetectBugsPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [currentScanFile, setCurrentScanFile] = useState('');
  const [bugsFoundSoFar, setBugsFoundSoFar] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const currentPath = window.location.pathname;

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

  // Mock data for demonstration
  const mockScanResults = {
    totalBugs: 17,
    filesScanned: 32,
    scanDuration: 12.4,
    bugsByFile: [
      { file: '/src/components/Login.jsx', bugs: 5 },
      { file: '/utils/api.js', bugs: 4 },
      { file: '/src/components/Dashboard.jsx', bugs: 3 },
      { file: '/utils/validation.js', bugs: 2 },
      { file: '/src/App.js', bugs: 2 },
      { file: '/components/UserProfile.jsx', bugs: 1 }
    ],
    bugsBySeverity: [
      { name: 'Critical', value: 6, color: '#ef4444' },
      { name: 'Major', value: 7, color: '#f97316' },
      { name: 'Minor', value: 4, color: '#eab308' }
    ],
    detailedBugs: [
      {
        id: 1,
        file: '/src/components/Login.jsx',
        line: 24,
        description: 'Unhandled error in login flow - missing try-catch block',
        severity: 'Critical'
      },
      {
        id: 2,
        file: '/utils/api.js',
        line: 88,
        description: 'Deprecated method .substr() used instead of .substring()',
        severity: 'Major'
      },
      {
        id: 3,
        file: '/src/App.js',
        line: 17,
        description: 'Missing PropTypes validation for component props',
        severity: 'Minor'
      },
      {
        id: 4,
        file: '/src/components/Dashboard.jsx',
        line: 156,
        description: 'Potential memory leak - event listener not cleaned up',
        severity: 'Critical'
      },
      {
        id: 5,
        file: '/utils/validation.js',
        line: 42,
        description: 'Weak password validation regex pattern',
        severity: 'Major'
      }
    ]
  };

  const validateGitHubUrl = (url) => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return githubRegex.test(url);
  };

 const simulateScan = async () => {
  if (!validateGitHubUrl(repoUrl)) {
    alert('Please enter a valid GitHub repository URL');
    return;
  }

  setIsScanning(true);
  setScanResults(null);
  setBugsFoundSoFar(0);
  setCurrentScanFile('Connecting to server...');

  try {
    const token = localStorage.getItem('authToken'); // Get JWT from localStorage
    const response = await fetch('http://localhost:8000/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Send token for authenticated route
      },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong during scan');
    }

    setScanResults(data); // Actual bug data from backend
  } catch (err) {
    console.error('Scan error:', err);
    alert(err.message || 'Failed to scan repository');
  } finally {
    setIsScanning(false);
    setCurrentScanFile('');
  }
};


  const filteredBugs = scanResults?.detailedBugs.filter(bug => {
    const matchesSearch = bug.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || bug.severity.toLowerCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  }) || [];

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'major': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'minor': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-n-3 bg-n-6 border-n-5';
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

      <LoggedInHeader 
        onLogout={handleLogout} 
        user={user} 
      />
      
      <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
         <div className="mb-12">
  <div className="flex items-center gap-6 mb-6">
    {/* Enhanced Icon */}
    {/* <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-color-1 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
      <div className="relative w-16 h-16 bg-gradient-to-br from-color-1 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300">
        <Search className="w-8 h-8 text-white" />
      </div>
    </div> */}
    
    {/* Title Section */}
    <div>
      <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-color-1 to-purple-400 bg-clip-text text-transparent mb-1">
        Bug Detection
      </h1>
      <p className="text-n-3 text-lg lg:text-l font-light">
        Analyze your GitHub repository for potential bugs and vulnerabilities
      </p>
    </div>
  </div>
</div>

          {/* Enhanced Input Section */}
<div className="relative mb-8">
  {/* Glass morphism container with gradient border */}
  <div className="relative bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-color-1/5 via-purple-500/5 to-blue-500/5 rounded-3xl opacity-50"></div>
    
    {/* Inner glow effect */}
    <div className="absolute inset-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl"></div>
    
    <div className="relative z-10 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Repository Analysis</h2>
        <p className="text-n-3">Enter your GitHub repository URL to begin comprehensive code analysis</p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-white mb-4 text-center">
          GitHub Repository URL
        </label>
        
        {/* Enhanced glass input field */}
        <div className="relative group">
          {/* Input glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-color-1/30 via-purple-500/30 to-blue-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden group-hover:border-white/40 transition-colors duration-300">
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-color-1/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-center">
              <div className="absolute left-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-color-1/20 to-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                  <Github className="w-6 h-6 text-color-1" />
                </div>
              </div>
              
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-24 pr-16 py-6 bg-transparent text-white placeholder-white/60 text-lg focus:outline-none focus:ring-0 border-0"
                disabled={isScanning}
              />
              
              {/* URL validation indicator */}
              {repoUrl && (
                <div className="absolute right-6">
                  <div className={`w-4 h-4 rounded-full ${validateGitHubUrl && validateGitHubUrl(repoUrl) ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'} shadow-lg animate-pulse`}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
        {/* Enhanced CTA Button */}
        <button
          onClick={simulateScan}
          disabled={isScanning || !repoUrl}
          className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-color-1 to-purple-600 text-white font-bold rounded-2xl hover:from-color-1/90 hover:to-purple-600/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          {/* Button glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-color-1 to-purple-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          
          <div className="relative flex items-center gap-3">
            {isScanning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            )}
            <span className="text-lg">
              {isScanning ? 'Analyzing Repository...' : 'Start AI Analysis'}
            </span>
          </div>
        </button>
        
        {/* Enhanced Info Badge */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/15 transition-colors duration-300">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Info className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm text-white/80 font-medium">Repository must be public</span>
        </div>
      </div>
    </div>
  </div>
  
  {/* Floating particles effect */}
  <div className="absolute -top-4 -left-4 w-8 h-8 bg-color-1/20 rounded-full blur-sm animate-pulse"></div>
  <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-500/20 rounded-full blur-sm animate-pulse delay-1000"></div>
  <div className="absolute top-1/2 -right-6 w-4 h-4 bg-blue-500/20 rounded-full blur-sm animate-pulse delay-500"></div>
</div>
          {/* Scanning Status */}
          {isScanning && (
            <div className="bg-n-7 border border-color-1/50 rounded-xl p-8 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="w-6 h-6 animate-spin text-color-1" />
                  <h3 className="text-xl font-semibold text-n-1">AI Analysis in Progress...</h3>
                </div>
                
                <div className="space-y-3 text-n-3">
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Scanning: <span className="font-mono text-color-1">{currentScanFile}</span></span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Issues Found: <span className="font-bold text-orange-400">{bugsFoundSoFar}</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanResults && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-n-7 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-400">Total Issues</p>
                      <p className="text-3xl font-bold text-n-1">{scanResults.totalBugs}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-n-7 border border-color-1/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-color-1/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-color-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-color-1">Files Scanned</p>
                      <p className="text-3xl font-bold text-n-1">{scanResults.filesScanned}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-n-7 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-400">Scan Duration</p>
                      <p className="text-3xl font-bold text-n-1">{scanResults.scanDuration}s</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="bg-n-7 border border-n-6 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-n-1 mb-6 flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Issues per File
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scanResults.bugsByFile}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="file" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        fontSize={12}
                        stroke="#9CA3AF"
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value) => [value, 'Issues']}
                        labelFormatter={(label) => `File: ${label}`}
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Bar dataKey="bugs" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-n-7 border border-n-6 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-n-1 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Issues by Severity
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={scanResults.bugsBySeverity}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {scanResults.bugsBySeverity.map((entry, index) => (
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Issues Table */}
              <div className="bg-n-7 border border-n-6 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-n-1 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Detailed Issues
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-n-6 border border-n-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent text-n-1 placeholder-n-4"
                      />
                    </div>
                    
                    {/* Filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-n-4 w-4 h-4" />
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-n-6 border border-n-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-color-1 focus:border-transparent appearance-none text-n-1"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                    
                    {/* Export */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-n-6 border border-n-5 text-n-1 rounded-lg hover:bg-n-5 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-n-6">
                        <th className="text-left py-3 px-4 font-semibold text-n-2">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-n-2">File Path</th>
                        <th className="text-left py-3 px-4 font-semibold text-n-2">Line</th>
                        <th className="text-left py-3 px-4 font-semibold text-n-2">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-n-2">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBugs.map((bug, index) => (
                        <tr key={bug.id} className="border-b border-n-6 hover:bg-n-6/50 transition-colors">
                          <td className="py-4 px-4 text-n-3">{index + 1}</td>
                          <td className="py-4 px-4">
                            <code className="text-sm bg-n-6 px-2 py-1 rounded text-color-1">
                              {bug.file}
                            </code>
                          </td>
                          <td className="py-4 px-4 text-n-3 font-mono">{bug.line}</td>
                          <td className="py-4 px-4 text-n-2 max-w-md">
                            {bug.description}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(bug.severity)}`}>
                              {bug.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredBugs.length === 0 && (
                    <div className="text-center py-8 text-n-4">
                      No issues found matching your search criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectBugsPage;