
import { FiLock, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#2b60e5] md:bg-gray-50">
      {/* Contenedor principal - Flex en desktop, bloque en mobile */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sección izquierda - Solo visible en desktop */}
        <div className="hidden md:flex md:w-1/2 bg-[#2b60e5] text-white p-12 relative overflow-hidden">
          <div className="z-10 relative w-full">
            <img
              src="/logo2.svg"
              alt="Logo ProHealth"
              className="h-30 w-auto mb-8 filter brightness-0 invert opacity-20" 
            />
            <div className="mt-20">
              <h1 className="text-5xl font-bold mb-4">Bienvenido a</h1>
              <h2 className="text-3xl font-semibold mb-6">HealthFirst</h2>
              <p className="max-w-md opacity-90 text-lg">
                La plataforma integral para la gestión de salud y bienestar de tu organización. 
                Accede a herramientas avanzadas para el seguimiento médico y administrativo.
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
        <div className="flex-1 flex items-center justify-center p-4 pt-16 md:pt-0">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200 md:mx-12">
            <div className="mb-8 text-center">
              {/* Mostrar logo solo en mobile */}
              <img
                src="/logo2.svg"
                alt="Logo ProHealth"
                className="h-20 w-auto mx-auto md:hidden mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">Iniciar sesión</h2>
              <p className="text-gray-600 mt-2">Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="relative rounded-md shadow-sm">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b60e5] focus:border-[#2b60e5]"
                    placeholder="Ingrese su usuario"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative rounded-md shadow-sm">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b60e5] focus:border-[#2b60e5]"
                    placeholder="Ingrese su contraseña"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2b60e5] hover:bg-[#2b60e5c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b60e5] transition-colors duration-200"
                >
                  Ingresar
                </button>
              </div>
            </form>

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