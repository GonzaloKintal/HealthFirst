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
import LicensesPage from '../pages/supervisor/LicensesPage';
import RequestLicense from '../components/employee/RequestLicense';
import EditLicense from '../components/employee/EditLicense';
import AddUser from '../components/admin/AddUser';
import EditUser from '../components/admin/EditUser';
import MyDataPage from '../pages/employee/MyDataPage';
import LicenseDetail from '../components/supervisor/LicenseDetail';
import SettingsPage from '../pages/admin/SettingsPage';
import PublicRoute from './PublicRoute';
import GuidePage from '../components/guide/GuidePage';
import NotFoundPage from '../pages/shared/NotFoundPage';
import PredictionsPage from '../pages/analyst/PredictionsPage';
import MessagingPage from '../pages/admin/MessagingPage';
import UserMessagesPage from '../pages/employee/UserMesaggesPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
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
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'analyst', 'employee']}>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/messaging" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'analyst']}>
              <MessagingPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-messages" 
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <UserMessagesPage />
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
            <ProtectedRoute allowedRoles={['supervisor', 'admin', 'analyst', 'employee']}>
              <LicensesPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/license-detail/:id" 
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin', 'analyst', 'employee']}>
              <LicenseDetail />
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
            <ProtectedRoute allowedRoles={['analyst', 'admin']}>
              <AnalystDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/predictions" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst']}>
              <PredictionsPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-data" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst', 'employee', 'supervisor']}>
              <MyDataPage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/guide" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'analyst', 'employee', 'supervisor']}>
              <GuidePage />
            </ProtectedRoute>
          }
        />

      </Route>

        
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;