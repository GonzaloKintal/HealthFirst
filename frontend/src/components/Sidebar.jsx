import { 
  FiHome as Dashboard,
  FiSettings as Settings,
  FiFileText as FileText,
  FiBarChart2 as BarChart,
} from 'react-icons/fi';

const Sidebar = () => {
  return (
    <div className="fixed h-screen w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Espacio para el AppBar */}
      <div className="h-16"></div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {[
            { text: 'Dashboard', icon: <Dashboard className="h-5 w-5" /> },
            { text: 'Licencias', icon: <FileText className="h-5 w-5" /> },
            { text: 'Reportes', icon: <BarChart className="h-5 w-5" /> },
            { text: 'Configuración', icon: <Settings className="h-5 w-5" /> },
          ].map((item) => (
            <li key={item.text}>
              <a
                href="#"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
              >
                <span className="text-gray-500 group-hover:text-[#2b60e5]">
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
        
        {/* Sección adicional (opcional) */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            Más opciones
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="h-5 w-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  +
                </span>
                <span className="ml-3 font-medium">Nueva función</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Footer del sidebar (opcional) */}
      <div className="flex justify-center p-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="h-11 w-11 rounded-full bg-indigo-100 flex items-center justify-center text-[#2b60e5]">
            <span className="font-medium">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Usuario</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;