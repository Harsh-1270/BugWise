import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'

// Custom themed toast notifications (same as in SignUpForm)
const showThemedToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        color: '#ffffff',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(16px)',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(168, 85, 247, 0.1)',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
      duration: 4000,
    });
  },
  error: (message) => {
    toast.error(message, {
      style: {
        background: 'rgba(17, 24, 39, 0.95)',
        color: '#ffffff',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(16px)',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(239, 68, 68, 0.1)',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
      duration: 4000,
    });
  }
};

export default function GoogleOAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error)
          showThemedToast.error('Google authentication was cancelled or failed')
          navigate('/signup')
          return
        }

        // Validate required parameters
        if (!code) {
          showThemedToast.error('Invalid OAuth response. Please try again.')
          navigate('/signup')
          return
        }

        // Parse state if provided
        let parsedState = {}
        if (state) {
          try {
            parsedState = JSON.parse(decodeURIComponent(state))
          } catch (e) {
            console.warn('Failed to parse state parameter:', e)
          }
        }

        // Exchange authorization code for user data
        const response = await axios.post('/api/auth/google/callback', {
          code,
          redirectUri: `${window.location.origin}/auth/google/callback`
        })

        const { data: responseData } = response

        if (responseData.error) {
          showThemedToast.error(responseData.error)
          navigate('/signup')
          return
        }

        // Prepare user data
        const userData = {
          name: responseData.name,
          email: responseData.email,
          token: responseData.token,
          id: responseData.id || responseData.user?.id,
          picture: responseData.picture
        }

        // Store user data in localStorage or context
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.token)

        // Show success message
        const isSignUp = parsedState.action === 'signup'
        const welcomeMessage = isSignUp 
          ? `Welcome ${userData.name}! Account created successfully.`
          : `Welcome back, ${userData.name}!`
        
        showThemedToast.success(welcomeMessage)

        // Navigate to appropriate page
        const redirectTo = parsedState.redirectTo || '/dashboard'
        setTimeout(() => {
          navigate(redirectTo)
        }, 1500)

      } catch (error) {
        console.error('OAuth callback error:', error)
        
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Authentication failed. Please try again.'
        
        showThemedToast.error(errorMessage)
        navigate('/signup')
      } finally {
        setIsProcessing(false)
      }
    }

    handleOAuthCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-red-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-red-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-20 w-44 h-44 bg-pink-600/18 rounded-full blur-3xl animate-pulse delay-1200"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl animate-pulse delay-800"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/15 to-red-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Processing Container */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
          </div>

          {isProcessing ? (
            <>
              {/* Loading Animation */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
                  <svg className="animate-spin w-8 h-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Completing authentication...</h2>
                <p className="text-gray-400 text-sm">Please wait while we verify your Google account</p>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
              <p className="text-gray-400 text-sm mb-6">There was an issue with your Google authentication. Redirecting...</p>
              
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}