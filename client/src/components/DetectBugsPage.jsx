import React, { useState } from 'react';
import { Search, Github, Bug, FileText, Clock, AlertTriangle, AlertCircle, Info, Download, Filter, Play, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DetectBugsPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [currentScanFile, setCurrentScanFile] = useState('');
  const [bugsFoundSoFar, setBugsFoundSoFar] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

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
        severity: 'Critical',
        severityIcon: '🔴'
      },
      {
        id: 2,
        file: '/utils/api.js',
        line: 88,
        description: 'Deprecated method .substr() used instead of .substring()',
        severity: 'Major',
        severityIcon: '🟠'
      },
      {
        id: 3,
        file: '/src/App.js',
        line: 17,
        description: 'Missing PropTypes validation for component props',
        severity: 'Minor',
        severityIcon: '🟡'
      },
      {
        id: 4,
        file: '/src/components/Dashboard.jsx',
        line: 156,
        description: 'Potential memory leak - event listener not cleaned up',
        severity: 'Critical',
        severityIcon: '🔴'
      },
      {
        id: 5,
        file: '/utils/validation.js',
        line: 42,
        description: 'Weak password validation regex pattern',
        severity: 'Major',
        severityIcon: '🟠'
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

    // Simulate scanning files
    const files = [
      '/src/components/Login.jsx',
      '/utils/validateUser.js',
      '/src/components/Dashboard.jsx',
      '/utils/api.js',
      '/src/App.js',
      '/components/UserProfile.jsx'
    ];

    for (let i = 0; i < files.length; i++) {
      setCurrentScanFile(files[i]);
      setBugsFoundSoFar(Math.floor(Math.random() * (i + 3)));
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Complete scan
    await new Promise(resolve => setTimeout(resolve, 1000));
    setScanResults(mockScanResults);
    setIsScanning(false);
    setCurrentScanFile('');
  };

  const filteredBugs = scanResults?.detailedBugs.filter(bug => {
    const matchesSearch = bug.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || bug.severity.toLowerCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  }) || [];

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-50';
      case 'major': return 'text-orange-500 bg-orange-50';
      case 'minor': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔍 Detect Bugs with AI
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a GitHub repository URL. Our AI will scan all files and visualize the detected bugs.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔗 GitHub Repository URL
              </label>
              <div className="relative">
                <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  disabled={isScanning}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={simulateScan}
                disabled={isScanning || !repoUrl}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                {isScanning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {isScanning ? 'Analyzing Repository...' : 'Analyze Repository'}
              </button>
              
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Info className="w-4 h-4" />
                💡 Tip: The repo must be public
              </div>
            </div>
          </div>
        </div>

        {/* Scanning Status */}
        {isScanning && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">🧠 AI is analyzing files...</h3>
              </div>
              
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>📂 Scanning: <span className="font-mono text-blue-600">{currentScanFile}</span></span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Bug className="w-4 h-4" />
                  <span>🐛 Potential Bugs Found So Far: <span className="font-bold text-orange-600">{bugsFoundSoFar}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Results */}
        {scanResults && (
          <div className="space-y-8">
            {/* Bug Summary Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500 rounded-xl">
                    <Bug className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Total Bugs Found</p>
                    <p className="text-3xl font-bold text-red-700">{scanResults.totalBugs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Files Scanned</p>
                    <p className="text-3xl font-bold text-blue-700">{scanResults.filesScanned}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Scan Duration</p>
                    <p className="text-3xl font-bold text-green-700">{scanResults.scanDuration}s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart - Bugs per File */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📊 Bugs per File
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scanResults.bugsByFile}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="file" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Bugs']}
                      labelFormatter={(label) => `File: ${label}`}
                    />
                    <Bar dataKey="bugs" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Bugs by Severity */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🥧 Bugs by Severity
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bug Details Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  📋 Bug Details
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search bugs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Severity Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="major">Major</option>
                      <option value="minor">Minor</option>
                    </select>
                  </div>
                  
                  {/* Export Button */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">File Path</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Line No.</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Bug Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBugs.map((bug, index) => (
                      <tr key={bug.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-4 px-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded text-blue-600">
                            {bug.file}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-mono">{bug.line}</td>
                        <td className="py-4 px-4 text-gray-700 max-w-md">
                          {bug.description}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(bug.severity)}`}>
                            {bug.severityIcon} {bug.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredBugs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No bugs found matching your search criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectBugsPage;