import { useState } from "react"
import axios from 'axios'
import { toast } from "react-hot-toast"
import { useNavigate, Link } from "react-router-dom"
import { useGoogleLogin } from '@react-oauth/google'
import brainwaveSymbol from "../../assets/brainwave-symbol.svg";

// Custom themed toast notifications
const showThemedToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        background: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        color: '#ffffff',
        border: '1px solid rgba(168, 85, 247, 0.3)', // purple-500 border
        borderRadius: '12px',
        backdropFilter: 'blur(16px)',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(168, 85, 247, 0.1)',
      },
      iconTheme: {
        primary: '#10b981', // emerald-500
        secondary: '#ffffff',
      },
      duration: 4000,
    });
  },
  error: (message) => {
    toast.error(message, {
      style: {
        background: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        color: '#ffffff',
        border: '1px solid rgba(239, 68, 68, 0.3)', // red-500 border
        borderRadius: '12px',
        backdropFilter: 'blur(16px)',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(239, 68, 68, 0.1)',
      },
      iconTheme: {
        primary: '#ef4444', // red-500
        secondary: '#ffffff',
      },
      duration: 4000,
    });
  },
  loading: (message) => {
    return toast.loading(message, {
      style: {
        background: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        color: '#ffffff',
        border: '1px solid rgba(168, 85, 247, 0.3)', // purple-500 border
        borderRadius: '12px',
        backdropFilter: 'blur(16px)',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(168, 85, 247, 0.1)',
      },
      iconTheme: {
        primary: '#8b5cf6', // violet-500
        secondary: '#ffffff',
      },
    });
  }
};

export default function SignUpForm({ onSignUpSuccess, onSwitchToSignIn, onClose }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState({
    name: '',
    email: '',
    password: ''
  })

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isLengthValid: false
  })

  // Check password validation
  const checkPasswordValidation = (password) => {
    const validation = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isLengthValid: password.length >= 6
    }
    setPasswordValidation(validation)
    return validation
  }

  // Check if password meets all requirements
  const isPasswordValid = (validation) => {
    return validation.hasUppercase && 
           validation.hasLowercase && 
           validation.hasNumber && 
           validation.hasSpecialChar && 
           validation.isLengthValid
  }

  const registerUser = async (e) => {
    e.preventDefault()
    const { name, email, password } = data

    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      showThemedToast.error('Please fill in all fields')
      return
    }

    // Check password validation
    const validation = checkPasswordValidation(password)
    if (!isPasswordValid(validation)) {
      showThemedToast.error('Password does not meet all requirements')
      return
    }

    setIsLoading(true)
    const loadingToast = showThemedToast.loading('Creating your account...')

    try {
      const { data: responseData } = await axios.post('/signupform', {
        name,
        email,
        password
      })

      toast.dismiss(loadingToast)

      if (responseData.error) {
        showThemedToast.error(responseData.error)
      } else {
        // Success - clear form data
        setData({ name: '', email: '', password: '' })
        setPasswordValidation({
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecialChar: false,
          isLengthValid: false
        })

        // Prepare user data for the parent component
        const userData = {
          name: responseData.name || name,
          email: responseData.email || email,
          token: responseData.token || 'logged-in',
          id: responseData.id || responseData.user?.id
        }

        showThemedToast.success('Account created successfully! Welcome to BugWise!')

        // Call the success handler if provided
        if (onSignUpSuccess) {
          onSignUpSuccess(userData)
        } else {
          // Redirect to signin page after a short delay
          setTimeout(() => {
            navigate('/signin')
          }, 1500)
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Registration error:', error)

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      showThemedToast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

// REPLACE your existing googleLogin implementation with this:
const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    const loadingToast = showThemedToast.loading('Connecting to Google...')
    
    try {
      console.log('Google token response:', tokenResponse)
      
      // Check if we have an access token
      if (!tokenResponse.access_token) {
        throw new Error('No access token received from Google')
      }

      // Get user info using the access token
      const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google')
      }

      const userInfo = await userInfoResponse.json()
      console.log('User info from Google:', userInfo)

      // Validate that we have the required data
      if (!userInfo.id || !userInfo.name || !userInfo.email) {
        throw new Error('Incomplete user data received from Google')
      }

      // Send user info to your backend with the correct field mapping
      const requestData = {
        googleId: userInfo.id,           // Map userInfo.id to googleId
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture || '',  // Provide fallback for optional field
        access_token: tokenResponse.access_token
      }

      console.log('Sending to backend:', requestData) // Debug log

      const { data: responseData } = await axios.post('/google', requestData)

      toast.dismiss(loadingToast)

      if (responseData.error) {
        showThemedToast.error(responseData.error)
      } else {
        const userData = {
          name: responseData.user?.name || userInfo.name,
          email: responseData.user?.email || userInfo.email,
          token: responseData.token,
          id: responseData.user?.id,
          picture: responseData.user?.picture || userInfo.picture
        }

        showThemedToast.success(`Welcome ${userData.name}! Account created successfully.`)

        if (onSignUpSuccess) {
          onSignUpSuccess(userData)
        } else {
          setTimeout(() => {
            navigate('/dashboard')
          }, 1500)
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Google signup error:', error)
      
      // More detailed error handling
      let errorMessage = 'Google signup failed. Please try again.'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showThemedToast.error(errorMessage)
    }
  },
  onError: (error) => {
    console.error('Google OAuth Error:', error)
    showThemedToast.error('Google authentication failed. Please try again.')
  },
  scope: 'email profile', // Explicitly request email and profile scopes
  // Remove the flow: 'auth-code' line for implicit flow
})

  const handleSignInClick = () => {
    if (onSwitchToSignIn) {
      onSwitchToSignIn()
    } else {
      navigate('/signin')
    }
  }

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

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/10">
          <div className="text-center mb-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-2">
              <a
                className="block transition-all duration-300 hover:scale-110"
              >
                <img
                  src={brainwaveSymbol}
                  width={50}
                  height={10}
                  alt="BugWise"
                  className="drop-shadow-2xl filter brightness-110 hover:brightness-125 transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.6)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.3))',
                  }}
                />
              </a>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-gray-400 text-xs">Join BugWise and start your journey</p>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={() => googleLogin()}
            disabled={isLoading}
            className="w-full bg-gray-800/80 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-red-600/20 text-white font-medium py-2.5 px-4 rounded-xl mb-4 flex items-center justify-center gap-3 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/25 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/80"
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
          <form onSubmit={registerUser} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder='Full name'
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <input
                type="email"
                placeholder='Email address'
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-gray-800/70 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                value={data.password}
                onChange={(e) => {
                  setData({ ...data, password: e.target.value })
                  checkPasswordValidation(e.target.value)
                }}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-gray-800/70 transition-all duration-300 pr-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Password Validation Indicators */}
            {data.password && (
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-3 space-y-2">
                <p className="text-xs text-gray-300 font-medium mb-2">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.isLengthValid ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.isLengthValid ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>6+ characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUppercase ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.hasUppercase ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasLowercase ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.hasLowercase ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.hasNumber ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-gray-400'} col-span-2`}>
                    {passwordValidation.hasSpecialChar ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>Special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type='submit'
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex flex-col items-center mt-6 space-y-3">
            <p className="text-gray-400 text-xs">
              Already have an account?{' '}
              <button
                onClick={handleSignInClick}
                disabled={isLoading}
                className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign in →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}