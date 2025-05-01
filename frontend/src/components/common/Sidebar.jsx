
import { 
  FiHome as Dashboard,
  FiSettings as Settings,
  FiFileText as FileText,
  FiBarChart2 as BarChart,
  FiUsers as Users,
  FiCpu as Cpu,
} from 'react-icons/fi';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Definición de opciones por rol
  const menuOptions = {
    admin: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5" />, path: '/dashboard' },
      { text: 'Usuarios', icon: <Users className="h-5 w-5" />, path: '/users' },
      { text: 'Licencias', icon: <FileText className="h-5 w-5" />, path: '/licenses' },
      { text: 'Indicadores', icon: <BarChart className="h-5 w-5" />, path: '/metrics' },
      { text: 'Modelo ML', icon: <Cpu className="h-5 w-5" />, path: '/ml-model' },
      { text: 'Configuración', icon: <Settings className="h-5 w-5" />, path: '/settings' },
    ],
    supervisor: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5" />, path: '/dashboard' },
      { text: 'Licencias', icon: <FileText className="h-5 w-5" />, path: '/licenses' }
    ],
    employee: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5" />, path: '/dashboard' },
      { text: 'Mis Licencias', icon: <FileText className="h-5 w-5" />, path: '/licenses' },
      { 
        text: 'Solicitar Licencia', 
        icon: <FileText className="h-5 w-5" />, 
        path: '/request-license',
        isHighlighted: true
      }
    ],
    analyst: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5" />, path: '/dashboard' },
      { text: 'Indicadores', icon: <BarChart className="h-5 w-5" />, path: '/metrics' },
      { text: 'Mis Licencias', icon: <FileText className="h-5 w-5" />, path: '/licenses' },
      { text: 'Modelo ML', icon: <Cpu className="h-5 w-5" />, path: '/ml-model' }
    ]
  };

  // Obtener opciones según el rol del usuario
  const options = menuOptions[user?.role] || menuOptions.employee;

  return (
    <div className={`z-1000 fixed h-screen bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`} style={{ width: '16rem' }}>
      
      {/* Espacio para el AppBar */}
      <div className="h-16"></div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2 border-b border-gray-200 pb-5">
          {options.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                    item.isHighlighted 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : isActive
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`${
                    item.isHighlighted 
                      ? 'text-white' 
                      : isActive
                        ? 'text-blue-600'
                        : 'text-gray-500'
                  }`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="ml-3 font-medium">{item.text}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-medium">VOX DEI SOLUTIONS</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;