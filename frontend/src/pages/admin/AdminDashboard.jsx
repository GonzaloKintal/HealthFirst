import { useLocation, Routes, Route } from 'react-router-dom';
import Users from './UsersPage'; // Asegúrate de crear este componente
// import SettingsPage from './SettingsPage'; // Crea este componente si no existe

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-800">Panel de Administrador</h1>
      <p className="mt-2 text-gray-600">Gestión completa del sistema</p>

      <div className="mt-6">
        <Routes>
          <Route index element={<div>Dashboard del Admin</div>} />
          <Route path="users" element={<Users />} />
          {/* <Route path="settings" element={<SettingsPage />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;