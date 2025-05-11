
import { FiMenu, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUser } from '../../services/userService';

const Header = ({ toggleDrawer }) => {
  const { user: authUser, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (authUser?.id) {
          const response = await getUser(authUser.id);
          setUserData(response);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    logout();
    setIsDropdownOpen(false);
    setIsLoggingOut(false);
  };

  const translateRole = (role) => {
    const rolesMap = {
      'admin': 'Administrador',
      'supervisor': 'Supervisor',
      'employee': 'Empleado',
      'analyst': 'Analista'
    };
    return rolesMap[role] || role;
  };

  // Datos combinados: los básicos del authContext + los completos de la API
  const user = userData || authUser;

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
        {!loading && (
          <div className="relative mr-10">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-4 focus:outline-none cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-[#2b60e5] flex items-center justify-center text-white font-medium">
                {user?.first_name?.charAt(0)?.toUpperCase() || 
                 user?.username?.charAt(0)?.toUpperCase() || 
                 'U'}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-800">
                  {user?.first_name || 'Usuario'}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {translateRole(user?.role)}
                </span>
              </div>
              <FiChevronDown className={`h-5 w-5 text-gray-500 hidden md:block transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Menú desplegable */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-medium">
                    {user?.first_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {translateRole(user?.role)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut} // Deshabilitar el botón durante el logout
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-75"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cerrando sesión...
                    </>
                  ) : (
                    <>
                      <FiLogOut className="mr-2" />
                      Cerrar sesión
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
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