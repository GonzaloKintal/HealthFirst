import { FiMenu, FiChevronDown, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getUser } from '../../services/userService';

const Header = ({ toggleDrawer }) => {
  const { user: authUser, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  const user = userData || authUser;

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="z-40 fixed top-0 left-0 right-0 bg-background shadow-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDrawer}
            className="p-1 text-foreground rounded-md hover:bg-card focus:outline-none cursor-pointer transition-colors duration-200"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <img
            src="/logo.svg"
            alt="Logo ProHealth"
            className="h-10 w-auto" 
          />
          <h1 className="text-xl font-bold text-foreground hidden md:block">HealthFirst</h1>
        </div>
        
        {/* Right section */}
        {!loading && (
          <div className="relative mr-1 flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-foreground rounded-full hover:bg-card focus:outline-none"
              aria-label={darkMode ? 'Activar light mode' : 'Activar dark mode'}
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex items-center space-x-4 focus:outline-none cursor-pointer"
              >
                <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {user?.first_name || 'Usuario'}
                  </span>
                  <span className="text-xs text-foreground capitalize">
                    {translateRole(user?.role)}
                  </span>
                </div>
                <FiChevronDown className={`h-5 w-5 text-foreground hidden md:block transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu - versión corregida */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background rounded-md shadow-lg py-1 z-[51] border border-border">
                  <div className="px-4 py-2 text-sm text-foreground border-b border-border">
                    <p className="font-medium">
                      {user?.first_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-foreground capitalize">
                      {translateRole(user?.role)}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-card cursor-pointer disabled:opacity-75 transition-colors duration-200"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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