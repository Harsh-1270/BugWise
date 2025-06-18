import { useState } from "react"
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function SignInForm({ onLoginSuccess, onSwitchToSignUp, onClose }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  const loginUser = async (e) => {
    e.preventDefault()
    const { email, password } = data
    try {
      const { data: responseData } = await axios.post('/signinform', {
        email,
        password
      })

      if (responseData.error) {
        toast.error(responseData.error)
      } else {
        // Success - clear form data
        setData({
          email: '',
          password: ''
        })

        // Prepare user data for the parent component
        const userData = {
          name: responseData.name || responseData.user?.name || email.split('@')[0], // Fallback to email username if name not provided
          email: responseData.email || email,
          token: responseData.token || 'logged-in',
          id: responseData.id || responseData.user?.id
        }

        // Call the success handler passed from App.jsx
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        } else {
          // Fallback if onLoginSuccess is not provided
          navigate('/')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    }
  }

  const handleGoogleSignIn = () => {
    // Add your Google OAuth logic here
    console.log('Google Sign In clicked')
  }

  const handleSignUpClick = (e) => {
    e.preventDefault(); // Prevent default form submission or link behavior
    
    if (onSwitchToSignUp) {
      onSwitchToSignUp();
    } else {
      navigate('/signup');
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-600/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-red-600/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-red-500/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-500/15 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-20 w-44 h-44 bg-pink-600/18 rounded-full blur-3xl animate-pulse delay-1200"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl animate-pulse delay-800"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/15 to-red-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">
          <div className="text-center mb-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Log in to BugWise</h1>
            <p className="text-gray-400 text-xs">Welcome back! Please sign in to continue</p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-gray-800/80 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-red-600/20 text-white font-medium py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-3 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-900 text-gray-400 text-xs font-medium">OR CONTINUE WITH EMAIL</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={loginUser} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder='Email address'
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-gray-800/70 transition-all duration-300 pr-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-300"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L5.636 5.636m14.142 14.142l-4.243-4.242m0 0L12 12m3.535 3.535L8.464 8.464" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type='submit'
              className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 text-sm"
            >
              Sign in
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex flex-col items-center mt-6 space-y-3">
            <p className="text-gray-400 text-xs">
              Don't have an account?{' '}
              <button
                onClick={handleSignUpClick}
                className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium"
              >
                Sign up →
              </button>
            </p>
            <a href="#" className="text-gray-400 hover:text-purple-400 text-xs transition-colors duration-300">
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}