import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import Button from './Button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => { setIsLoginModalOpen(true); };
  // Fix: Corrected typo from `setIsLoginModal` to `setIsLoginModalOpen`
  const handleCloseLoginModal = () => { setIsLoginModalOpen(false); };
  const handleLogout = () => { logout(); alert('Logged out successfully!'); };

  return (
    <>
      {/* Fixed Top Nav Bar */}
      <nav className="bg-gray-800 text-white p-4 shadow-lg fixed top-0 w-full z-20">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
            TrophySeeker
          </Link>

          {/* Navigation Links - Hidden on small screens, shown on medium screens upwards. Now scrollable. */}
          {/* Removed 'justify-center', added 'overflow-x-auto' and 'py-2' for scrollbar on desktop/tablet */}
          <div className="hidden md:flex flex-1 space-x-6 mx-8 overflow-x-auto py-2">
            {NAVIGATION_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={item.path.startsWith('/') ? item.path : `/${item.path}`}
                className={({ isActive }) =>
                  `flex-shrink-0 px-3 py-2 rounded-md text-base font-medium transition-colors whitespace-nowrap ${ // Added whitespace-nowrap
                  isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="mr-2">{item.icon}</span> {item.name}
              </NavLink>
            ))}
          </div>

          {/* Login/Logout & Mobile Hamburger (re-introduce for mobile menu) */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium hidden md:block" aria-label={`Welcome, ${user.username}`}>
                  Welcome, <span className="font-semibold text-blue-300">{user.username}</span>!
                </span>
                <Button onClick={handleLogout} variant="secondary" size="sm" aria-label="Logout">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={handleOpenLoginModal} variant="primary" size="sm" aria-label="Login">
                Login
              </Button>
            )}

            {/* Simple Mobile Menu Placeholder (if desired to bring back a mobile menu, otherwise remove) */}
            <button
              className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
              // In a real app, this would toggle a mobile menu overlay/drawer
              onClick={() => alert('Mobile menu not implemented for top nav yet!')}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile navigation - hidden on larger screens, shown on smaller screens as a scrollable row */}
        {/* Removed 'justify-center' and added 'px-4' for better scroll experience */}
        <div className="sm:hidden flex space-x-2 overflow-x-auto py-2 -mb-2 px-4">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path.startsWith('/') ? item.path : `/${item.path}`}
              className={({ isActive }) =>
                `flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${ // Added whitespace-nowrap
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span className="mr-1">{item.icon}</span> {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </>
  );
};

export default Navbar;