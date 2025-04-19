// import { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/Header';
// import Sidebar from './components/Sidebar';
// import DashboardPage from './pages/DashboardPage';
// import LoginPage from './pages/LoginPage';

// function App() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleDrawerToggle = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50">
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/" element={
//             <>
//               <Header toggleDrawer={handleDrawerToggle} />
//               <div className="flex pt-16">
//               <div className={`fixed transform transition-transform duration-300 ease-in-out inset-y-0 z-30 ${sidebarOpen ? 'block' : 'hidden'} md:relative`}>
//                 <Sidebar />
//               </div>
//                 {/* Añade un overlay para mobile cuando el sidebar está abierto */}
//                 {sidebarOpen && (
//                   <div 
//                     className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
//                     onClick={handleDrawerToggle}
//                   />
//                 )}
//                 <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
//                   <DashboardPage />
//                 </div>
//               </div>
//             </>
//           } />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                
                {/* Overlay cuando el sidebar está abierto */}
                {sidebarOpen && (
                  <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50"
                    onClick={handleDrawerToggle}
                  />
                )}
                
                {/* Contenido principal */}
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
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