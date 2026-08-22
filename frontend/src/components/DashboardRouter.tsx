import { useAuth } from '../context/useAuth';
import EmployeeDashboard from './employee/EmployeeDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') return <AdminDashboard />;

  // EMPLOYEE and TECHNICIAN both use the employee tracking view for the MVP.
  return <EmployeeDashboard />;
}
