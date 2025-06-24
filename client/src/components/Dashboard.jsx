import LoggedInHeader from './LoggedInHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this for navigation

const TypingEffect = ({ text, speed = 100, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTyping = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTyping);
  }, [delay]);

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isTyping]);

  return (
    <span 
      className="font-bold relative inline-block"
      style={{
        background: 'linear-gradient(45deg, #8B5CF6, #06B6D4, #10B981, #F59E0B, #EF4444)',
        backgroundSize: '400% 400%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        animation: 'gradientShift 5s ease-in-out infinite',
        textShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.6), 0 0 90px rgba(139, 92, 246, 0.4)'
      }}
    >
      {displayText}
      <span className="animate-pulse text-white">|</span>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </span>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add navigation hook

  // Function to get user data from various sources
  const getUserData = () => {
    try {
      // Method 1: Check if user data is in localStorage
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      // Method 2: Check if user data is in sessionStorage
      const sessionUser = sessionStorage.getItem('userData');
      if (sessionUser) {
        return JSON.parse(sessionUser);
      }

      // Method 3: Check for auth token and fetch user data
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (authToken) {
        // You can make an API call here to fetch user data using the token
        // For now, we'll extract user info from token if it's a JWT
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          return {
            name: payload.name || payload.username || payload.email?.split('@')[0] || 'User',
            email: payload.email || 'user@example.com',
            id: payload.sub || payload.id
          };
        } catch (e) {
          console.warn('Could not parse token:', e);
        }
      }

      // Method 4: Check for user data in URL params (if passed during login redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const userName = urlParams.get('user') || urlParams.get('name');
      const userEmail = urlParams.get('email');
      
      if (userName) {
        return {
          name: userName,
          email: userEmail || 'user@example.com'
        };
      }

      // Default fallback
      return {
        name: 'User',
        email: 'user@example.com'
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return {
        name: 'User',
        email: 'user@example.com'
      };
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    setLoading(false);
  }, []);

  // Function to update user data (can be called from parent components or context)
  const updateUser = (newUserData) => {
    setUser(newUserData);
    // Optionally save to localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(newUserData));
  };

  const handleLogout = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setUser(null);
    
    // Redirect to login page
    window.location.href = '/';
  };

  // Navigation handlers for cards
  const handleCardClick = (cardType) => {
    switch(cardType) {
      case 'detect':
        navigate('/detect-bugs'); // Adjust path as needed
        break;
      case 'history':
        navigate('/bug-history'); // Adjust path as needed
        break;
      case 'insights':
        navigate('/visual-insights'); // Adjust path as needed
        break;
      case 'help':
        navigate('/help-docs'); // Adjust path as needed
        break;
      default:
        console.log('Unknown card type:', cardType);
    }
  };

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color-1 mx-auto mb-4"></div>
          <p className="text-n-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-n-8 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-40 h-40 bg-red-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-red-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-20 w-44 h-44 bg-pink-600/18 rounded-full blur-3xl animate-pulse delay-1200"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl animate-pulse delay-800"></div>
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/15 to-red-600/15 rounded-full blur-3xl animate-pulse delay-1400"></div>
     
        <div 
          className="absolute top-1/4 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-3/4 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
        />
      </div>

      <LoggedInHeader 
        onLogout={handleLogout} 
        user={user} 
      />
      
      {/* Main Dashboard Content */}
      <div className="pt-32 px-5 lg:px-7.5 xl:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-n-1 mb-4">
              Welcome back, <TypingEffect text={user?.name || "User"} speed={150} delay={500} />!
            </h1>
            <p className="text-n-3 text-lg">
              Ready to detect and fix bugs in your code?
            </p>
            {/* Optional: Display user email */}
            {user?.email && (
              <p className="text-n-4 text-sm mt-2">
                Logged in as: {user.email}
              </p>
            )}
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div 
              className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:from-white/10 hover:via-white/15 hover:to-white/10 hover:border-color-1/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-color-1/20"
              onClick={() => handleCardClick('detect')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-color-1/20 to-color-1/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-color-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-n-1 font-semibold mb-2">Detect Bugs</h3>
              <p className="text-n-3 text-sm">Upload your code or connect GitHub</p>
            </div>

            <div 
              className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:from-white/10 hover:via-white/15 hover:to-white/10 hover:border-color-2/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-color-2/20"
              onClick={() => handleCardClick('history')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-color-2/20 to-color-2/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-color-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-n-1 font-semibold mb-2">Bug History</h3>
              <p className="text-n-3 text-sm">View past scans and results</p>
            </div>

            <div 
              className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:from-white/10 hover:via-white/15 hover:to-white/10 hover:border-color-3/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-color-3/20"
              onClick={() => handleCardClick('insights')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-color-3/20 to-color-3/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-color-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-n-1 font-semibold mb-2">Visual Insights</h3>
              <p className="text-n-3 text-sm">Analytics and charts</p>
            </div>

            <div 
              className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 hover:from-white/10 hover:via-white/15 hover:to-white/10 hover:border-color-4/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl hover:shadow-color-4/20"
              onClick={() => handleCardClick('help')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-color-4/20 to-color-4/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-color-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-n-1 font-semibold mb-2">Help & Docs</h3>
              <p className="text-n-3 text-sm">Get help and documentation</p>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold text-n-1 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-n-1 font-medium">Code scan completed</p>
                  <p className="text-n-3 text-sm">React Project - 3 bugs found</p>
                </div>
                <span className="text-n-3 text-sm">2 hours ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-n-1 font-medium">GitHub repository connected</p>
                  <p className="text-n-3 text-sm">my-awesome-project</p>
                </div>
                <span className="text-n-3 text-sm">1 day ago</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-n-1 font-medium">Profile updated</p>
                  <p className="text-n-3 text-sm">Email preferences changed</p>
                </div>
                <span className="text-n-3 text-sm">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;