

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import SessionTimeout from './SessionTimeout';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-card">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onItemClick={closeSidebarOnMobile}
      />
      
      {/* Contenido principal */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header toggleDrawer={toggleSidebar} />
        
        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6 mt-16">
          {children}
        </main>
        
        {/* Componente de timeout de sesión */}
        <SessionTimeout />
      </div>
    </div>
  );
};

export default Layout;