import { useState } from 'react';
import { 
  FiHome, 
  FiSettings, 
  FiUsers, 
  FiBarChart2, 
  FiShoppingCart
} from 'react-icons/fi';

const DashboardPage = () => {
  return (
    <main className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenido a tu Dashboard</h1>
        <p className="mt-2 text-gray-600">Este es un panel de control moderno construido con Tailwind CSS y React.</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards de estadísticas */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="font-medium text-indigo-800">Ventas totales</h3>
            <p className="text-2xl font-bold mt-2 text-[#2b60e5]">$24,780</p>
            <p className="text-sm text-[#2b60e5] mt-1">+12% vs mes anterior</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-medium text-green-800">Clientes nuevos</h3>
            <p className="text-2xl font-bold mt-2 text-green-600">1,254</p>
            <p className="text-sm text-green-500 mt-1">+8% vs mes anterior</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="font-medium text-amber-800">Órdenes pendientes</h3>
            <p className="text-2xl font-bold mt-2 text-amber-600">42</p>
            <p className="text-sm text-amber-500 mt-1">-5% vs mes anterior</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;