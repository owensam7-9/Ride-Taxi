import React, { useState } from "react";
import NavMenu from "./NavMenu";

const MenuBar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const userName = localStorage.getItem('userName');
  const accountName = userName?.split(' ')[0];
  
  return(
     <nav className="bg-black text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            <div className="font-sans text-2xl font-normal">Ride Cosy</div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavMenu />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 focus:outline-none"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={showMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* User Account and Help */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="https://help.ridecosy.co.ke/riders" 
              className="text-white hover:text-gray-300 text-sm font-medium"
            >
              Help
            </a>
            <button
              className="text-white hover:text-gray-300 px-4 py-2 text-sm font-medium rounded-md"
            >
              {accountName || 'Sign In'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMenu && (
          <div className="md:hidden">
            <NavMenu isMobile={true} onClose={() => setShowMenu(false)} />
            <div className="pt-4 border-t border-gray-700">
              <a 
                href="https://help.ridecosy.co.ke/riders" 
                className="block py-2 text-base font-medium text-white hover:text-gray-300"
              >
                Help
              </a>
              <button
                className="block w-full text-left py-2 text-base font-medium text-white hover:text-gray-300"
              >
                {accountName || 'Sign In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


export default MenuBar;