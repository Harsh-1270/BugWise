import { useState, useEffect } from 'react';
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Collaboration from "./components/Collaboration";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import Roadmap from "./components/Roadmap";
import Services from "./components/Services";
import {Routes, Route, Navigate} from 'react-router-dom'
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import Dashboard from "./components/Dashboard";
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import ProfilePage from "./components/ProfilePage";
import DetectBugsPage from "./components/DetectBugsPage";
import BugHistory from './components/BugHistory';
import VisualInsights from './components/VisualInsights';
import DocsPage from "./components/DocsPage";

axios.defaults.baseURL = 'http://localhost:8000'
axios.defaults.withCredentials = true

const App = () => {
  const [authForm, setAuthForm] = useState(null); // null, 'signin', or 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleShowSignIn = () => {
    setAuthForm('signin');
  };

  const handleShowSignUp = () => {
    setAuthForm('signup');
  };

  const handleCloseAuth = () => {
    setAuthForm(null);
  };

  const handleSwitchToSignUp = () => {
    setAuthForm('signup');
  };

  const handleSwitchToSignIn = () => {
    setAuthForm('signin');
  };

  // Handle successful login/registration
  const handleLoginSuccess = (userData, context = 'login') => {
    setIsLoggedIn(true);
    setUser(userData);
    setAuthForm(null); // Close auth form
    localStorage.setItem('authToken', userData.token || 'logged-in');
    localStorage.setItem('userData', JSON.stringify(userData));
    
    if (context === "register") {
      toast.success("Registered successfully!");
    } else {
      toast.success("Login successful!");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  if (isLoggedIn) {
    return (
      <>
        <Toaster position='bottom-right' toastOptions={{duration:2000}} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
          <Route path="/detect-bugs" element={<DetectBugsPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path='/bug-history' element={<BugHistory user={user}/>}/>
          <Route path='/visual-insights' element={<VisualInsights user={user}/>}/>
          <Route path="/docspage" element={<DocsPage user={user}/> }/>
          <Route path="*" element={<Navigate to="/dashboard" />}/>
        </Routes>
      </>
    );
  }

  // Render auth forms based on state
  if (authForm === 'signin') {
    return (
      <>
        <Toaster position='bottom-right' toastOptions={{duration:2000}} />
        <SignInForm 
          onClose={handleCloseAuth}
          onSwitchToSignUp={handleSwitchToSignUp}
          onLoginSuccess={(userData) => handleLoginSuccess(userData, 'login')}
        />
      </>
    );
  }

  if (authForm === 'signup') {
    return (
      <>
        <Toaster position='bottom-right' toastOptions={{duration:2000}} />
        <SignUpForm 
          onClose={handleCloseAuth}
          onSwitchToSignIn={handleSwitchToSignIn}
          onSignUpSuccess={(userData) => handleLoginSuccess(userData, 'register')}
        />
      </>
    );
  }

  // Main landing page
  return (
    <>
      <div className="pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden">
        <Header 
          onSignInClick={handleShowSignIn}
          onSignUpClick={handleShowSignUp}
        />
        <Hero 
          onSignInClick={handleShowSignIn}
          onSignUpClick={handleShowSignUp}
        />
        <Toaster position='bottom-right' toastOptions={{duration:2000}} />
        <Routes>
          <Route path='/signup' element={
            <SignUpForm 
              onSignUpSuccess={(userData) => handleLoginSuccess(userData, 'register')}
              onSwitchToSignIn={handleShowSignIn}
              onClose={() => {}} 
            />
          } />
          <Route path='/signin' element={
            <SignInForm 
              onLoginSuccess={(userData) => handleLoginSuccess(userData, 'login')}
              onSwitchToSignUp={handleShowSignUp}
              onClose={() => {}} 
            />
          } />
          
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Benefits />
        <Collaboration />
        <Services />
        <Pricing />
        <Roadmap />
        <Footer />
      </div>
      <ButtonGradient />
    </>
  );
};

export default App;