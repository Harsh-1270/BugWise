import { useState } from 'react';
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Collaboration from "./components/Collaboration";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import Roadmap from "./components/Roadmap";
import Services from "./components/Services";
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";

const App = () => {
  const [authForm, setAuthForm] = useState(null); // null, 'signin', or 'signup'

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

  // Render auth forms based on state
  if (authForm === 'signin') {
    return (
      <SignInForm 
        onClose={handleCloseAuth}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
    );
  }

  if (authForm === 'signup') {
    return (
      <SignUpForm 
        onClose={handleCloseAuth}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
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