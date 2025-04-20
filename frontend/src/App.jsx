
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <>
              <Header toggleDrawer={handleDrawerToggle} />
              <div className="flex pt-16">
                
                {/* Sidebar con transición simple */}
                <div className={`
                  fixed inset-y-0 z-30 w-64
                  transform transition-all duration-300 ease-in-out
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                  <Sidebar />
                </div>
                
                {/* Contenido principal */}
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64 ml-0' : 'ml-0'}`}>
                  <DashboardPage />
                </div>

              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;