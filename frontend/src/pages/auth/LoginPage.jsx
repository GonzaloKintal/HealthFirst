
import { FiLock, FiUser } from 'react-icons/fi';
import { useState, useContext } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    
    try {
      // Simulamos un retardo de 3 segundos antes de hacer la petición
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
      // Simulamos un retardo de 3 segundos antes de hacer la petición
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
    <div className="min-h-screen bg-[#2b60e5] lg:bg-gray-50">
      {/* Contenedor principal - Flex en desktop, bloque en mobile */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sección izquierda - Solo visible en desktop */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#2b60e5] text-white p-12 relative overflow-hidden">
          <div className="z-10 relative w-full">
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
        <div className="flex-1 flex items-center justify-center p-4 pt-16 lg:pt-0">
          <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg border border-gray-200 lg:mx-12">
            <div className="mb-8 text-center">
              <img
                src="/logo2.svg"
                alt="Logo ProHealth"
                className="h-20 w-auto mx-auto lg:hidden mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">Iniciar sesión</h2>
              <p className="text-gray-600 mt-2">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b60e5] focus:border-[#2b60e5]"
                    placeholder="Ingrese su usuario"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2b60e5] focus:border-[#2b60e5]"
                    placeholder="Ingrese su contraseña"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2b60e5] hover:bg-[#2b60e5c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b60e5] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="mt-6 pt-6 border-t border-gray-200">
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
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Solo disponible en entorno de desarrollo
                </p>
              </div>
            )}

            <p className="text-gray-600 text-center mt-8">
              ¿No tienes una cuenta?<br />
              Contacta con el <strong className="text-[#2b60e5]">administrador</strong> para obtener acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;