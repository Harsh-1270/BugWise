import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { useState } from "react";
import { brainwave } from "../assets";
import Button from "./Button";
import MenuSvg from "../assets/svg/MenuSvg";
import { HamburgerMenu } from "./design/Header";
import { useNavigate } from 'react-router-dom';

const LoggedInHeader = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [openNavigation, setOpenNavigation] = useState(false);
  const [openProfileDropdown, setOpenProfileDropdown] = useState(false);

  // Navigation items for logged-in users
  const loggedInNavigation = [
    { id: "1", title: "Dashboard", url: "/dashboard" },
    { id: "2", title: "Detect Bugs", url: "/detect-bugs" },
    { id: "3", title: "Bug History", url: "/bug-history" },
    { id: "4", title: "Visual Insights", url: "/visual-insights" },
    { id: "5", title: "Docs/Help", url: "/docs", onlyMobile: true },
  ];

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

const handleClick = (url) => {
  // if (!openNavigation) return;
  enablePageScroll();
  setOpenNavigation(false);
  navigate(url);
};

  const toggleProfileDropdown = () => {
    setOpenProfileDropdown(!openProfileDropdown);
  };

  const handleLogout = () => {
    setOpenProfileDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleProfileSettings = () => {
    setOpenProfileDropdown(false);
    navigate('/profile'); // or whatever your profile route is
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 border-b border-n-6 lg:bg-n-8/90 lg:backdrop-blur-sm ${
        openNavigation ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center px-5 lg:px-7.5 xl:px-10 max-lg:py-4">
        {/* Logo */}
        <a className="block w-[12rem] xl:mr-8" href="/dashboard">
          <img src={brainwave} width={190} height={40} alt="BugWise" />
        </a>

        {/* Navigation Menu */}
        <nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed top-[5rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
            {loggedInNavigation.map((item) => (
              <button
  key={item.id}
  onClick={() => handleClick(item.url)}
  className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 ${
    item.onlyMobile ? "lg:hidden" : ""
  } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold lg:text-n-1/50 lg:leading-5 lg:hover:text-n-1 xl:px-12`}
>
  {item.title}
</button>

            ))}
            
            {/* Mobile Profile Section */}
            <div className="flex flex-col items-center gap-4 mt-8 lg:hidden">
              <button
                onClick={handleProfileSettings}
                className="font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 px-6 py-4"
              >
                Profile Settings
              </button>
              
              <Button 
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700"
              >
                Logout
              </Button>
            </div>
          </div>

          <HamburgerMenu />
        </nav>

        {/* Desktop Docs/Help Link */}
        <a
          href="/docs"
          className="hidden lg:block mr-8 text-n-1/50 transition-colors hover:text-n-1 font-code text-xs font-semibold uppercase"
        >
          Docs/Help
        </a>

        {/* Desktop Profile Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-2 text-n-1/50 transition-colors hover:text-n-1 font-code text-xs font-semibold uppercase"
          >
            <div className="w-8 h-8 bg-color-1 rounded-full flex items-center justify-center">
              <span className="text-n-8 font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <span>{user?.name || 'User'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                openProfileDropdown ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {openProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-n-8 border border-n-6 rounded-lg shadow-lg py-1">
              <button
                onClick={handleProfileSettings}
                className="block w-full text-left px-4 py-2 text-n-1/75 hover:text-n-1 hover:bg-n-7 transition-colors font-code text-xs"
              >
                Profile Settings
              </button>
              <hr className="border-n-6 my-1" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-n-7 transition-colors font-code text-xs"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          className="ml-auto lg:hidden"
          px="px-3"
          onClick={toggleNavigation}
        >
          <MenuSvg openNavigation={openNavigation} />
        </Button>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {openProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenProfileDropdown(false)}
        />
      )}
    </div>
  );
};

export default LoggedInHeader;