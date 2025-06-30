import React, { useState, useEffect } from 'react';
import { Search, Github, FileText, Clock, AlertTriangle, AlertCircle, Info, Download, Filter, Eye, RefreshCw, Trash2, Calendar, ExternalLink, ChevronLeft, ChevronRight, Loader2, X, Check, BookOpen, HelpCircle, Shield, BarChart3, Zap, Users, Mail, MessageCircle, ChevronDown, ChevronUp, Bug, Target, Code, Database, Lock, Heart } from 'lucide-react';
import LoggedInHeader from './LoggedInHeader';

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [openFAQ, setOpenFAQ] = useState(null);
  
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

  const handleLogout = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');

    // Redirect to login page
    window.location.href = '/';
  };

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Zap },
    { id: 'how-it-works', title: 'How Bug Detection Works', icon: Bug },
    { id: 'severity-levels', title: 'Bug Severity Levels', icon: Target },
    { id: 'reading-results', title: 'Reading Scan Results', icon: FileText },
    { id: 'bug-history', title: 'Bug History Guide', icon: Clock },
    { id: 'visual-insights', title: 'Visual Insights Guide', icon: BarChart3 },
    { id: 'account-security', title: 'Account & Security', icon: Shield },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
    { id: 'contact', title: 'Contact & Support', icon: MessageCircle }
  ];

  const faqData = [
    {
      question: "Can I scan private repositories?",
      answer: "Currently, BugWise only supports scanning public GitHub repositories. We're working on adding private repository support with proper authentication in future updates."
    },
    {
      question: "What file types are supported?",
      answer: "BugWise supports most common programming languages including JavaScript (.js, .jsx), Python (.py), Java (.java), C++ (.cpp, .cc), C# (.cs), PHP (.php), Ruby (.rb), Go (.go), TypeScript (.ts, .tsx), and many more."
    },
    {
      question: "Why is my scan taking so long?",
      answer: "Scan time depends on repository size and complexity. Small repos (< 100 files) usually take 10-30 seconds, medium repos (100-500 files) take 1-3 minutes, and large repos (500+ files) can take 3-10 minutes."
    },
    {
      question: "How can I report a false positive bug?",
      answer: "If you believe a detected bug is a false positive, please contact our support team with the specific scan details, file path, and line number. We continuously improve our AI models based on user feedback."
    },
    {
      question: "Can I export my scan results?",
      answer: "Yes! You can export your scan history as CSV from the Bug History page. Individual scan results can also be downloaded as PDF reports from the scan results page."
    },
    {
      question: "Is there a limit to how many repositories I can scan?",
      answer: "Free accounts can scan up to 10 repositories per month. Pro accounts have unlimited scans. Check your dashboard for current usage statistics."
    },
    {
      question: "How accurate is the bug detection?",
      answer: "Our AI models achieve 85-95% accuracy depending on the programming language and code complexity. We're constantly improving our algorithms based on user feedback and new training data."
    }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
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

      <LoggedInHeader onLogout={handleLogout} user={user} />

      <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 text-left">
            <div className="flex items-left justify-left gap-4 mb-6">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-color-1/20 to-purple-500/20 rounded-2xl flex items-left justify-left"> */}
                {/* <BookOpen className="w-8 h-8 text-color-1" /> */}
              {/* </div> */}
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-color-1 to-purple-400 bg-clip-text text-transparent mb-2">
                  Documentation
                </h1>
                <p className="text-n-3 text-lg lg:text-xl font-light">
                  Everything you need to know about BugWise
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-32 bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-color-1" />
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-color-1/20 to-purple-500/20 text-color-1 border border-color-1/30'
                            : 'text-n-3 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="space-y-12">
                
                {/* Getting Started Section */}
                <section id="getting-started" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Getting Started</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-n-1 mb-3">What is BugWise?</h3>
                      <p className="text-n-3 leading-relaxed">
                        BugWise is an AI-powered code analysis tool that automatically scans GitHub repositories to detect bugs, security vulnerabilities, and code quality issues. Our advanced machine learning algorithms analyze your code and provide detailed insights to help you maintain high-quality, secure applications.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-n-1 mb-3">How to Get Started</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-8 h-8 bg-color-1/20 rounded-full flex items-center justify-center text-color-1 font-bold text-sm">1</div>
                          <div>
                            <h4 className="font-semibold text-n-1 mb-1">Sign Up / Log In</h4>
                            <p className="text-n-3 text-sm">Create your BugWise account or log in with your existing credentials.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-8 h-8 bg-color-1/20 rounded-full flex items-center justify-center text-color-1 font-bold text-sm">2</div>
                          <div>
                            <h4 className="font-semibold text-n-1 mb-1">Navigate to "Detect Bugs"</h4>
                            <p className="text-n-3 text-sm">Go to the main scanning page from your dashboard.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-8 h-8 bg-color-1/20 rounded-full flex items-center justify-center text-color-1 font-bold text-sm">3</div>
                          <div>
                            <h4 className="font-semibold text-n-1 mb-1">Enter GitHub Repository URL</h4>
                            <p className="text-n-3 text-sm">Paste a valid public GitHub repository URL (e.g., https://github.com/username/repo-name).</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-8 h-8 bg-color-1/20 rounded-full flex items-center justify-center text-color-1 font-bold text-sm">4</div>
                          <div>
                            <h4 className="font-semibold text-n-1 mb-1">Start the Scan</h4>
                            <p className="text-n-3 text-sm">Click "Start Scanning" and wait for the AI to analyze your code.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="w-8 h-8 bg-color-1/20 rounded-full flex items-center justify-center text-color-1 font-bold text-sm">5</div>
                          <div>
                            <h4 className="font-semibold text-n-1 mb-1">View Results</h4>
                            <p className="text-n-3 text-sm">Review detected bugs, their severity levels, and recommended fixes.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-1">Supported Input</h4>
                          <p className="text-blue-200 text-sm">BugWise currently supports public GitHub repository URLs only. Private repository support is coming soon!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                      <Bug className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">How Bug Detection Works</h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-n-3 leading-relaxed">
                      BugWise uses advanced AI and machine learning algorithms to analyze your code comprehensively. Here's how our detection process works:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="w-10 h-10 bg-color-1/20 rounded-lg flex items-center justify-center mb-4">
                          <Code className="w-5 h-5 text-color-1" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-3">Code Traversal</h3>
                        <p className="text-n-3 text-sm">Our AI systematically traverses your entire codebase, analyzing file structure, dependencies, and code patterns.</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                          <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-3">Pattern Analysis</h3>
                        <p className="text-n-3 text-sm">Advanced pattern recognition identifies common bug patterns, anti-patterns, and potential security vulnerabilities.</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                          <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-3">Deep Learning</h3>
                        <p className="text-n-3 text-sm">Neural networks trained on millions of code samples identify subtle bugs that traditional tools might miss.</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                          <AlertTriangle className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-3">Severity Classification</h3>
                        <p className="text-n-3 text-sm">Each detected issue is automatically categorized by severity level and potential impact on your application.</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-n-1 mb-3">Supported File Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'].map((ext) => (
                          <span key={ext} className="px-3 py-1 bg-color-1/20 text-color-1 rounded-full text-sm font-mono">{ext}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-300 mb-1">Scan Time</h4>
                          <p className="text-green-200 text-sm">Scan duration depends on repository size - typically a few seconds to a few minutes. You'll see real-time progress updates during the scan.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Severity Levels Section */}
                <section id="severity-levels" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Bug Severity Levels</h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-n-3 leading-relaxed">
                      BugWise categorizes all detected issues into three severity levels to help you prioritize fixes based on potential impact:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-red-300">🔴 Critical</h3>
                            <p className="text-red-200 text-sm">High-risk bugs that may break your application</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-red-200">Examples:</h4>
                          <ul className="text-red-200 text-sm space-y-1 ml-4">
                            <li>• Uncaught exceptions and runtime errors</li>
                            <li>• SQL injection vulnerabilities</li>
                            <li>• Buffer overflow conditions</li>
                            <li>• Authentication bypass issues</li>
                            <li>• Memory leaks in critical paths</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-orange-300">🟠 Major</h3>
                            <p className="text-orange-200 text-sm">Significant issues that don't break the app but impact functionality</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-orange-200">Examples:</h4>
                          <ul className="text-orange-200 text-sm space-y-1 ml-4">
                            <li>• Deprecated API usage</li>
                            <li>• Performance bottlenecks</li>
                            <li>• Resource leaks</li>
                            <li>• Logic errors in non-critical paths</li>
                            <li>• Improper error handling</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Info className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-yellow-300">🟡 Minor</h3>
                            <p className="text-yellow-200 text-sm">Low-priority issues and code smell problems</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-yellow-200">Examples:</h4>
                          <ul className="text-yellow-200 text-sm space-y-1 ml-4">
                            <li>• Unused variables and imports</li>
                            <li>• Missing documentation</li>
                            <li>• Code style inconsistencies</li>
                            <li>• Dead code segments</li>
                            <li>• Minor optimization opportunities</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Reading Results Section */}
                <section id="reading-results" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Reading Scan Results</h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-n-3 leading-relaxed">
                      Understanding your scan results is crucial for effective bug fixing. Here's how to interpret the different components of your scan results:
                    </p>

                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-n-1 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-color-1" />
                          Bug Results Table
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">File Path</p>
                              <p className="text-n-4 text-sm">Shows the exact location of the detected issue within your repository</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Line Number</p>
                              <p className="text-n-4 text-sm">Pinpoints the specific line where the bug was detected</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Bug Description</p>
                              <p className="text-n-4 text-sm">Detailed explanation of the issue and potential impact</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Severity Level</p>
                              <p className="text-n-4 text-sm">Color-coded badges indicating the urgency of the fix</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-n-1 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-400" />
                          Visual Charts
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Severity Distribution (Pie Chart)</p>
                              <p className="text-n-4 text-sm">Shows the percentage breakdown of bugs by severity level</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Bugs by File (Bar Chart)</p>
                              <p className="text-n-4 text-sm">Displays which files have the most issues, helping you prioritize refactoring</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-n-1 mb-4 flex items-center gap-2">
                          <Filter className="w-5 h-5 text-green-400" />
                          Filtering & Actions
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Severity Filters</p>
                              <p className="text-n-4 text-sm">Filter results by Critical, Major, or Minor severity levels</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Search Functionality</p>
                              <p className="text-n-4 text-sm">Search for specific files, bug types, or keywords in descriptions</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Rescan vs View History</p>
                              <p className="text-n-4 text-sm">Rescan runs a new analysis; View History shows previous scan results</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Bug History Section */}
                <section id="bug-history" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Bug History Guide</h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-n-3 leading-relaxed">
                      BugWise automatically saves all your scan results, making it easy to track progress and compare scans over time. Here's how to make the most of your bug history:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <Database className="w-5 h-5 text-color-1" />
                          Automatic Saving
                        </h3>
                        <p className="text-n-3 text-sm">Every scan is automatically saved to your account with timestamp, repository details, and complete results.</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-purple-400" />
                          View Past Results
                        </h3>
                        <p className="text-n-3 text-sm">Access any previous scan results without needing to rescan the repository.</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-green-400" />
                          Re-scan Updates
                        </h3>
                        <p className="text-n-3 text-sm">Re-scan repositories to see if recent code changes have fixed existing bugs or introduced new ones.</p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <Download className="w-5 h-5 text-blue-400" />
                          Export Options
                        </h3>
                        <p className="text-n-3 text-sm">Export your scan history as CSV or individual results as PDF reports for documentation.</p>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-1">History Management</h4>
                          <p className="text-blue-200 text-sm">Use filters to search by repository name, scan date, or severity levels. Organize your scans to track improvement over time.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Visual Insights Section */}
                <section id="visual-insights" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Visual Insights Guide</h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-n-3 leading-relaxed">
                      BugWise provides powerful analytics to help you understand your code quality trends and identify patterns across your projects:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-color-1" />
                          Bug Trends Over Time
                        </h3>
                        <p className="text-n-3 text-sm mb-3">Track how your bug count changes over multiple scans of the same repository.</p>
                        <ul className="text-n-4 text-sm space-y-1 ml-4">
                          <li>• See if your bug fixing efforts are effective</li>
                          <li>• Identify patterns in bug introduction</li>
                          <li>• Monitor code quality improvements</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          Most Problematic Areas
                        </h3>
                        <p className="text-n-3 text-sm mb-3">Identify which repositories, files, or code sections need the most attention.</p>
                        <ul className="text-n-4 text-sm space-y-1 ml-4">
                          <li>• Files with highest bug density</li>
                          <li>• Repositories with most critical issues</li>
                          <li>• Common bug patterns across projects</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-400" />
                          Severity Distribution Analytics
                        </h3>
                        <p className="text-n-3 text-sm mb-3">Understand the breakdown of bug severities across your codebase.</p>
                        <ul className="text-n-4 text-sm space-y-1 ml-4">
                          <li>• Critical vs. minor issue ratios</li>
                          <li>• Security vulnerability trends</li>
                          <li>• Code quality score evolution</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Filter className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-purple-300 mb-1">Advanced Filtering</h4>
                          <p className="text-purple-200 text-sm">Filter insights by repository, date range, severity level, or bug type to focus on specific areas of improvement.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account & Security Section */}
                <section id="account-security" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Account & Security</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <Lock className="w-5 h-5 text-green-400" />
                          Data Privacy
                        </h3>
                        <ul className="text-n-3 text-sm space-y-2">
                          <li>• Only public repositories are scanned</li>
                          <li>• No code is stored permanently</li>
                          <li>• Analysis results are encrypted</li>
                          <li>• GDPR compliant data handling</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-400" />
                          Secure Authentication
                        </h3>
                        <ul className="text-n-3 text-sm space-y-2">
                          <li>• JWT token-based authentication</li>
                          <li>• Secure password hashing</li>
                          <li>• Session timeout protection</li>
                          <li>• Two-factor authentication (coming soon)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-n-1 mb-3">Account Management</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Change Password</p>
                              <p className="text-n-4 text-sm">Update your password from the account settings page</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Update Profile</p>
                              <p className="text-n-4 text-sm">Modify your name, email, and notification preferences</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-color-1 rounded-full mt-2"></div>
                            <div>
                              <p className="text-n-2 font-medium">Delete Account</p>
                              <p className="text-n-4 text-sm">Permanently delete your account and all associated data</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
                  </div>

                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <div key={index} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-n-1">{faq.question}</h3>
                          {openFAQ === index ? (
                            <ChevronUp className="w-5 h-5 text-color-1" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-n-3" />
                          )}
                        </button>
                        {openFAQ === index && (
                          <div className="px-6 pb-4">
                            <p className="text-n-3 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact & Support Section */}
                <section id="contact" className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Contact & Support</h2>
                  </div>

                  <div className="space-y-6">
                    <p className="text-n-3 leading-relaxed">
                      Need help or have questions? We're here to support you! Choose the best way to reach out:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-color-1/30 transition-colors">
                        <div className="w-12 h-12 bg-color-1/20 rounded-xl flex items-center justify-center mb-4">
                          <Mail className="w-6 h-6 text-color-1" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-2">Email Support</h3>
                        <p className="text-n-3 text-sm mb-3">Get personalized help with your account or technical issues.</p>
                        <a href="mailto:harshp1270@gmail.com" className="text-color-1 text-sm font-medium hover:underline">
                          harshp1270@gmail.com
                        </a>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                          <Github className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-2">GitHub Issues</h3>
                        <p className="text-n-3 text-sm mb-3">Report bugs, request features, or contribute to our development.</p>
                        <a href="https://github.com/bugwise/issues" className="text-purple-400 text-sm font-medium hover:underline flex items-center gap-1">
                          Open an Issue <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                          <MessageCircle className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-2">Community Discord</h3>
                        <p className="text-n-3 text-sm mb-3">Join our developer community for discussions and quick help.</p>
                        <a href="https://discord.gg/bugwise" className="text-blue-400 text-sm font-medium hover:underline flex items-center gap-1">
                          Join Discord <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-green-500/30 transition-colors">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                          <Heart className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-n-1 mb-2">Feedback Form</h3>
                        <p className="text-n-3 text-sm mb-3">Share your thoughts and help us improve BugWise.</p>
                        <a href="/feedback" className="text-green-400 text-sm font-medium hover:underline">
                          Send Feedback
                        </a>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-color-1/10 to-purple-500/10 border border-color-1/20 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-n-1 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-color-1" />
                        Response Times
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-color-1 font-semibold">Email Support</p>
                          <p className="text-n-3">Within 24 hours</p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-400 font-semibold">GitHub Issues</p>
                          <p className="text-n-3">1-3 business days</p>
                        </div>
                        <div className="text-center">
                          <p className="text-blue-400 font-semibold">Discord Chat</p>
                          <p className="text-n-3">Usually immediate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsPage;