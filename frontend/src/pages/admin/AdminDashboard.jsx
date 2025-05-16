import { useLocation, Routes, Route } from 'react-router-dom';
import Users from './UsersPage';

const AdminDashboard = () => {

  return (
    <div className="bg-background rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-foreground">Panel de Administrador</h1>
      <p className="mt-2 text-foreground">Gestión completa del sistema</p>

      <div className="mt-6">
        <Routes>
          <Route index element={<div className='text-foreground'>Dashboard del Admin</div>} />
          <Route path="users" element={<Users />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;