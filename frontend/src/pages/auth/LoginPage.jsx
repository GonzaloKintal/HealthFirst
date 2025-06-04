import { FiLock, FiUser, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/authService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const response = await login(username, password);
      
      authLogin({
        access: response.access,
        refresh: response.refresh,
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminAccess = async () => {
    setIsLoading(true);
    setError('');
    try {
      
      const adminCredentials = {
        username: 'admin@admin.com',
        password: 'administrador'
      };
      
      const response = await login(adminCredentials.username, adminCredentials.password);
      
      authLogin({
        access: response.access,
        refresh: response.refresh,
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Error en acceso rápido. Verifica que el usuario admin exista.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-card">
      {/* Contenedor principal - Flex en desktop, bloque en mobile */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sección izquierda - Solo visible en desktop */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary dark:bg-primary-hover text-white p-12 relative overflow-hidden">
          <div className="z-10 relative w-full">
            <div className="absolute top-0 right-0">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-white rounded-full hover:bg-primary-hover dark:hover:bg-primary focus:outline-none"
                aria-label={darkMode ? 'Activar light mode' : 'Activar dark mode'}
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
            </div>
            
            <img
              src="/logo2.svg"
              alt="Logo ProHealth"
              className="h-28 w-auto mb-8 filter brightness-0 invert opacity-20" 
            />
            <div className="mt-20">
              <h1 className="text-5xl font-bold mb-4">Bienvenido a</h1>
              <h2 className="text-3xl font-semibold mb-6">HealthFirst</h2>
              <p className="max-w-xl opacity-90 text-lg">
                La plataforma integral que combina gestión de licencias médicas con inteligencia predictiva. 
                Optimiza procesos, reduce tiempos de aprobación y ofrece dashboards inteligentes 
                para una toma de decisiones estratégica en bienestar laboral.
              </p>
            </div>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-0 top-1/3 transform translate-x-1/4">
              <div className="relative w-64 h-64">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-20 -translate-y-1/2">
                  <div className="relative w-40 h-40">
                    <svg className="text-white/20 w-40 h-40 transform rotate-45" xmlns="http://www.w3.org/2000/svg" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      viewBox="0 0 24 24">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path
                        d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-4 flex space-x-4 p-6">
            <svg className="text-white/20 w-20 h-20" xmlns="http://www.w3.org/2000/svg" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
        </div>

        {/* Sección derecha - Formulario (siempre visible) */}
        <div className="flex-1 flex items-center justify-center m-10 p-4 pt-16 lg:pt-0">
          <div className="w-full max-w-lg bg-background dark:bg-card p-8 rounded-lg shadow-lg border-2 border-border dark:border-border">
            <div className="flex justify-end lg:hidden">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-foreground dark:text-foreground rounded-full hover:bg-card dark:hover:bg-background focus:outline-none"
                aria-label={darkMode ? 'Activar light mode' : 'Activar dark mode'}
              >
                {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="mb-8 text-center">
              <img
                src="/logo2.svg"
                alt="Logo ProHealth"
                className="h-20 w-auto mx-auto lg:hidden mb-4"
              />
              <h2 className="text-2xl font-bold text-foreground dark:text-foreground">Iniciar sesión</h2>
              <p className="text-foreground dark:text-foreground opacity-80 mt-2">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete='off'>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground dark:text-foreground mb-1">
                  Usuario
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background dark:bg-card text-foreground dark:text-foreground"
                    placeholder="Ingrese su usuario"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground dark:text-foreground mb-1">
                  Contraseña
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-border dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background dark:bg-card text-foreground dark:text-foreground"
                    placeholder="Ingrese su contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </>
                  ) : 'Ingresar'}
                </button>
              </div>
            </form>

            {import.meta.env.DEV && (
              <div className="mt-6 pt-6 border-t border-border dark:border-border">
                <button
                  onClick={handleQuickAdminAccess}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </>
                  ) : 'Acceso Rápido Admin'}
                </button>
                <p className="text-xs text-foreground dark:text-foreground opacity-70 mt-2 text-center">
                  Solo disponible en entorno de desarrollo
                </p>
              </div>
            )}

            <p className="text-foreground dark:text-foreground opacity-80 text-center mt-8">
              ¿No tienes una cuenta?<br />
              Contacta con el <strong className="text-primary dark:text-primary-text">administrador</strong> para obtener acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;