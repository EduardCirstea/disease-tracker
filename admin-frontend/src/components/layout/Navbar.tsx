import React from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useApp();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 focus:outline-none focus:text-gray-700"
          >
            <FiMenu size={24} />
          </button>
          
          <h1 className="ml-4 text-xl font-semibold">
            Administrare Boli Infecțioase
          </h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <button className="text-gray-500 focus:outline-none focus:text-gray-700 mr-4">
              <FiBell size={20} />
            </button>
          </div>
          
          <div className="relative inline-block text-left">
            <div className="flex items-center">
              <span className="mr-2 text-sm">{user?.firstName} {user?.lastName}</span>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                <FiUser size={16} />
              </div>
            </div>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={logout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FiLogOut className="mr-2" size={16} />
                  Deconectare
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;