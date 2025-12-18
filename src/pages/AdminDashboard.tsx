import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Admin/Sidebar";
import AdminHeader from "@/components/Admin/AdminHeader";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar - Always visible */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Header - Always visible */}
        <AdminHeader />

        {/* Page Content - Dynamic based on route */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;