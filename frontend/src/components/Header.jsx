import { FiMenu } from 'react-icons/fi';
import { FiChevronDown } from 'react-icons/fi';

const Header = ({ toggleDrawer }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDrawer}
            className="p-1 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
        
        {/* Right section */}
        <div className="flex items-center space-x-4">
          
          <div className="flex items-center space-x-4 mr-4">
            <div className="h-11 w-11 rounded-full bg-[#2b60e5] flex items-center justify-center text-white font-medium">
              U
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-800">Usuario</span>
              <span className="text-xs text-gray-500">Administrador</span>
            </div>
            <FiChevronDown className="h-5 w-5 text-gray-500 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;