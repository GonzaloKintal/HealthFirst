import { 
  FiHome as Dashboard,
  FiSettings as Settings,
  FiFileText as FileText,
  FiBarChart2 as BarChart,
  FiUsers as Users,
  FiCpu as Cpu,
  FiUser,
  FiPlus
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
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5 text-primary-border" />, path: '/dashboard' },
      { text: 'Usuarios', icon: <Users className="h-5 w-5 text-primary-border" />, path: '/users' },
      { text: 'Licencias', icon: <FileText className="h-5 w-5 text-primary-border" />, path: '/licenses' },
      { text: 'Indicadores', icon: <BarChart className="h-5 w-5 text-primary-border" />, path: '/metrics' },
      { text: 'Modelo ML', icon: <Cpu className="h-5 w-5 text-primary-border" />, path: '/ml-model' },
      { text: 'Mis Datos', icon: <FiUser className="h-5 w-5 text-primary-border" />, path: '/my-data' },
      { text: 'Configuración', icon: <Settings className="h-5 w-5 text-primary-border" />, path: '/settings' },
    ],
    supervisor: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5 text-primary-border" />, path: '/dashboard' },
      { text: 'Licencias', icon: <FileText className="h-5 w-5 text-primary-border" />, path: '/licenses' },
      { text: 'Mis Datos', icon: <FiUser className="h-5 w-5 text-primary-border" />, path: '/my-data' },
    ],
    employee: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5 text-primary-border" />, path: '/dashboard' },
      { text: 'Mis Licencias', icon: <FileText className="h-5 w-5 text-primary-border" />, path: '/licenses' },
      { 
        text: 'Solicitar Licencia', 
        icon: <FiPlus className="h-5 w-5" />, 
        path: '/request-license',
        isHighlighted: true
      },
      { text: 'Mis Datos', icon: <FiUser className="h-5 w-5 text-primary-border" />, path: '/my-data' },
    ],
    analyst: [
      { text: 'Dashboard', icon: <Dashboard className="h-5 w-5 text-primary-border" />, path: '/dashboard' },
      { text: 'Indicadores', icon: <BarChart className="h-5 w-5 text-primary-border" />, path: '/metrics' },
      { text: 'Mis Licencias', icon: <FileText className="h-5 w-5 text-primary-border" />, path: '/licenses' },
      { text: 'Modelo ML', icon: <Cpu className="h-5 w-5 text-primary-border" />, path: '/ml-model' },
      { text: 'Mis Datos', icon: <FiUser className="h-5 w-5 text-primary-border" />, path: '/my-data' },
    ]
  };

  // Obtener opciones según el rol del usuario
  const options = menuOptions[user?.role] || menuOptions.employee;

  return (
    <div className={`z-40 fixed h-screen bg-background shadow-lg border-r border-border flex flex-col transition-all duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`} style={{ width: '16rem' }}>
      
      {/* Espacio para el AppBar */}
      <div className="h-16"></div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2 border-b border-border pb-5">
          {options.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 group ${
                    item.isHighlighted
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : isActive
                        ? 'bg-special-light text-primary-text hover:bg-blue-100 dark:bg-special-dark dark:hover:bg-blue-900'
                        : 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`${
                    item.isHighlighted 
                      ? 'text-white' 
                      : isActive
                        ? 'text-primary-text'
                        : 'text-foreground'
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
        <div className="p-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-foreground">
              Powered by <span className="font-medium">VOX DEI SOLUTIONS</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;