
import { FiMenu, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ toggleDrawer }) => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="z-10000 fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDrawer}
            className="p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <img
            src="/logo.svg"
            alt="Logo ProHealth"
            className="h-10 w-auto" 
          />
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">HealthFirst</h1>
        </div>
        
        {/* Right section - Área de usuario con dropdown */}
        <div className="relative mr-10">
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-4 focus:outline-none cursor-pointer"
          >
            <div className="h-11 w-11 rounded-full bg-[#2b60e5] flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800">{'Usuario'}</span>
              <span className="text-xs text-gray-500 capitalize">{user?.role || 'Administrador'}</span>
            </div>
            <FiChevronDown className={`h-5 w-5 text-gray-500 hidden md:block transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>

          {/* Menú desplegable */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <p className="font-medium">{'Usuario'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrador'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <FiLogOut className="mr-2" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;