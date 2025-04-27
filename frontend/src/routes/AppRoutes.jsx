import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../pages/shared/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRedirect from '../components/common/RoleBasedRedirect';

import AdminDashboard from '../pages/admin/AdminDashboard';
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import AnalystDashboard from '../pages/analyst/AnalystDashboard';
import UsersPage from '../pages/admin/UsersPage';
import MetricsPage from '../pages/analyst/MetricsPage';
import LicensesPage from '../pages/supervisor/LicensesPage';
import MyLicensesPage from '../pages/employee/MyLicensesPage';
import RequestLicense from '../components/employee/RequestLicense';
import EditLicense from '../components/employee/EditLicense';
import AddUser from '../components/admin/AddUser';
import EditUser from '../components/admin/EditUser';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<DashboardLayout />}>
        {/* Redirección basada en rol */}
        <Route 
          index 
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin', 'supervisor', 'analyst']}>
              <RoleBasedRedirect />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta de Dashboard - Ahora compartida */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin', 'supervisor', 'analyst']}>
              <RoleBasedRedirect toDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas específicas de cada rol */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/add-user" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddUser />
            </ProtectedRoute>
          } 
        />

      <Route 
          path="/edit-user/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditUser />
            </ProtectedRoute>
          } 
      />
        

        <Route 
          path="/supervisor/*" 
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/licenses" 
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <LicensesPage />
            </ProtectedRoute>
          } 
        />
        

        <Route 
          path="/employee/*" 
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-licenses" 
          element={
            <ProtectedRoute allowedRoles={['employee', 'analyst']}>
              <MyLicensesPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/request-license" 
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin', 'supervisor', 'analyst']}>
              <RequestLicense />
            </ProtectedRoute>
          } 
        />

      <Route 
          path="/edit-license/:id" 
          element={
            <ProtectedRoute allowedRoles={['employee', 'admin', 'supervisor', 'analyst']}>
              <EditLicense />
            </ProtectedRoute>
          } 
      />
        

        <Route 
          path="/analyst/*" 
          element={
            <ProtectedRoute allowedRoles={['analyst', 'admin']}> {/* Permitimos admin aquí */}
              <AnalystDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas compartidas */}
        <Route 
          path="/metrics" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <MetricsPage />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      <Route path="*" element={<div>Página no encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;