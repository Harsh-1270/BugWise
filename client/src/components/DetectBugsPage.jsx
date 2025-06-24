import React, { useState } from 'react';
import { Search, Github, FileText, Clock, AlertTriangle, AlertCircle, Info, Download, Filter, Play, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoggedInHeader from './LoggedInHeader';
import { useEffect } from 'react';

const DetectBugsPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [currentScanFile, setCurrentScanFile] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [error, setError] = useState('');

useEffect(() => {
  const storedResults = sessionStorage.getItem('scanResults');
  const storedRepoUrl = sessionStorage.getItem('repoUrl');
  const storedSeverity = sessionStorage.getItem('severityFilter');
  const storedSearch = sessionStorage.getItem('searchTerm');

  if (storedResults) {
    setScanResults(JSON.parse(storedResults));
    setRepoUrl(storedRepoUrl || '');
    setSeverityFilter(storedSeverity || 'all');
    setSearchTerm(storedSearch || '');
  }
}, []);

  // Get user data from localStorage (no need to use localStorage in state)
  const [user] = useState(() => {
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

  const validateGitHubUrl = (url) => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return githubRegex.test(url);
  };

  // Transform backend scan results to frontend format
  const transformScanResults = (backendResults) => {
    if (!backendResults || !backendResults.bugs) {
      return {
        totalBugs: 0,
        filesScanned: backendResults?.filesScanned || 0,
        scanDuration: backendResults?.scanDuration || 0,
        detailedBugs: [],
        bugsByFile: [],
        bugsBySeverity: []
      };
    }

    const bugs = backendResults.bugs || [];

    // Group bugs by file for chart
    const bugsByFile = {};
    bugs.forEach(bug => {
      const fileName = bug.file || 'Unknown';
      bugsByFile[fileName] = (bugsByFile[fileName] || 0) + 1;
    });

    const bugsByFileArray = Object.entries(bugsByFile).map(([file, count]) => ({
      file: file.split('/').pop() || file, // Show only filename for readability
      bugs: count
    }));

    // Group bugs by severity for pie chart
    const bugsBySeverity = {};
    bugs.forEach(bug => {
      const severity = bug.severity || 'unknown';
      bugsBySeverity[severity] = (bugsBySeverity[severity] || 0) + 1;
    });

    const severityColors = {
      'critical': '#EF4444',
      'major': '#F97316',
      'minor': '#EAB308',
      'unknown': '#6B7280'
    };

    const bugsBySeverityArray = Object.entries(bugsBySeverity).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: severityColors[severity.toLowerCase()] || '#6B7280'
    }));

    // Transform detailed bugs with proper IDs
    const detailedBugs = bugs.map((bug, index) => ({
      id: bug.id || `bug-${index}`,
      file: bug.file || 'Unknown',
      line: bug.line || 'N/A',
      description: bug.description || bug.message || 'No description available',
      severity: bug.severity || 'unknown'
    }));

    return {
      totalBugs: bugs.length,
      filesScanned: backendResults.filesScanned || 0,
      scanDuration: backendResults.scanDuration || 0,
      detailedBugs,
      bugsByFile: bugsByFileArray,
      bugsBySeverity: bugsBySeverityArray
    };
  };

  const startScan = async () => {
    if (!validateGitHubUrl(repoUrl)) {
      setError('❌ Please enter a valid GitHub repository URL');
      return;
    }

    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!authToken) {
      setError('❌ You are not authenticated. Please log in again.');
      return;
    }

    setIsScanning(true);
    setScanResults(null);
    setCurrentScanFile('🔄 Initializing scan...');
    setError('');

    try {
      // Step 1: Start the scan
      console.log('Starting scan for:', repoUrl);
      const response = await fetch('http://localhost:8000/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },

        body: JSON.stringify({ repoUrl })
      });

      const result = await response.json();
      console.log('Scan initiation response:', result);

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          if (result.nextScanAllowed) {
            const waitTime = result.remainingTime;
            throw new Error(`Rate limit exceeded. Please wait ${waitTime} minute(s) before scanning this repository again.`);
          } else if (result.dailyLimit) {
            throw new Error(`Daily scan limit reached (${result.dailyLimit} scans per day). Scans used: ${result.scansUsed}`);
          }
        }
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      if (!result.success || !result.scanId) {
        throw new Error('Failed to initiate scan - no scan ID received');
      }

      const saveSessionData = (results, repoUrl, filter, search) => {
  sessionStorage.setItem('scanResults', JSON.stringify(results));
  sessionStorage.setItem('repoUrl', repoUrl);
  sessionStorage.setItem('severityFilter', filter);
  sessionStorage.setItem('searchTerm', search);
};

      const scanId = result.scanId;
      setCurrentScanFile('🤖 AI analysis in progress...');

      // Step 2: Poll for scan completion
      let pollAttempts = 0;
      const maxPollAttempts = 60; // 3 minutes with 3-second intervals
      const pollInterval = 3000; // 3 seconds

      const pollScanStatus = async () => {
        setCurrentScanFile(`⏳ AI analysis in progress... (${pollAttempts + 1}/${maxPollAttempts})`);

        try {
          const statusResponse = await fetch(`http://localhost:8000/api/scan/status/${scanId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include'
          });

          if (!statusResponse.ok) {
            throw new Error(`Server error: ${statusResponse.status} ${statusResponse.statusText}`);
          }

          const statusData = await statusResponse.json();
          console.log('Poll response:', statusData);

          if (statusData.status === 'completed') {
            if (statusData.results) {
              console.log('Scan completed with results:', statusData.results);

              // Transform backend results to frontend format
              const transformedResults = transformScanResults(statusData.results);
              setScanResults(transformedResults);
              setCurrentScanFile('✅ Scan completed successfully!');
              saveSessionData(transformedResults, repoUrl, severityFilter, searchTerm);
              return;
            } else {
              throw new Error('⚠️ Scan completed but no results found.');
            }
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || '❌ Scan failed on server.');
          } else if (statusData.status === 'scanning' || statusData.status === 'pending') {
            // Continue polling
            pollAttempts++;
            if (pollAttempts >= maxPollAttempts) {
              throw new Error('⌛ Scan timed out. The repository might be too large or the server is busy.');
            }
            setTimeout(pollScanStatus, pollInterval);
          } else {
            throw new Error(`Unknown scan status: ${statusData.status}`);
          }

        } catch (err) {
          console.error('Polling error:', err);
          if (err.message.includes('Failed to fetch')) {
            throw new Error('⚠️ Cannot connect to server. Please ensure the backend is running on http://localhost:8000');
          }
          throw err;
        }
      };

      await pollScanStatus();

    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || '❌ Unexpected error during scan');
    } finally {
      setIsScanning(false);
      setCurrentScanFile('');
    }
  };

  const filteredBugs = (scanResults?.detailedBugs || []).filter(bug => {
    const matchesSearch = bug.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || bug.severity.toLowerCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'major': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'minor': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-n-3 bg-n-6 border-n-5';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    window.location.href = '/';
  };

  const exportResults = () => {
    if (!scanResults) return;

    const exportData = {
      repository: repoUrl,
      scanDate: new Date().toISOString(),
      summary: {
        totalBugs: scanResults.totalBugs,
        filesScanned: scanResults.filesScanned,
        scanDuration: scanResults.scanDuration
      },
      issues: filteredBugs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                  Bug Detection
                </h1>
                <p className="text-n-3 text-lg lg:text-l font-light">
                  Analyze your GitHub repository for potential bugs and vulnerabilities
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Input Section */}
          <div className="relative mb-8">
            <div className="relative bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-color-1/5 via-purple-500/5 to-blue-500/5 rounded-3xl opacity-50"></div>
              <div className="absolute inset-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl"></div>

              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Repository Analysis</h2>
                  <p className="text-n-3">Enter your GitHub repository URL to begin comprehensive code analysis</p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-white mb-4 text-center">
                    GitHub Repository URL
                  </label>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-color-1/30 via-purple-500/30 to-blue-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden group-hover:border-white/40 transition-colors duration-300">
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

                        {repoUrl && (
                          <div className="absolute right-6">
                            <div className={`w-4 h-4 rounded-full ${validateGitHubUrl(repoUrl) ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'} shadow-lg animate-pulse`}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                  <button
                    onClick={startScan}
                    disabled={isScanning || !repoUrl || !validateGitHubUrl(repoUrl)}
                    className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-color-1 to-purple-600 text-white font-bold rounded-2xl hover:from-color-1/90 hover:to-purple-600/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
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

                  <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/15 transition-colors duration-300">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Info className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-white/80 font-medium">Repository must be public</span>
                  </div>
                </div>
              </div>
            </div>
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
                    {/* <span>{currentScanFile}</span> */}
                      <span>Scanning: <span className="font-mono text-color-1">{currentScanFile}</span></span>
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
                    Detailed Issues ({filteredBugs.length})
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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

                    <button
                      onClick={exportResults}
                      className="flex items-center gap-2 px-4 py-2 bg-n-6 border border-n-5 text-n-1 rounded-lg hover:bg-n-5 transition-colors"
                    >
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
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-n-4">
                        {searchTerm || severityFilter !== 'all' ?
                          'No issues match your current filters.' :
                          'No issues found in this repository.'
                        }
                      </td>
                    </tr>
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