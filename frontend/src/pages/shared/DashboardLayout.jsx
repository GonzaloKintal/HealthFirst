import Layout from '../../components/common/Layout';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  
  return (
    <Layout>
      {/* Este Outlet renderizará los dashboards específicos */}
      <Outlet />
    </Layout>
  );
};

export default DashboardLayout;