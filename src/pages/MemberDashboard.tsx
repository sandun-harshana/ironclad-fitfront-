import React from "react";
import { Outlet } from "react-router-dom";
import MemberHeader from "@/components/Member/MemberHeader";
import MemberSidebar from "@/components/Member/MemberSidebar";

function MemberDashboard() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <MemberSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <MemberHeader />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MemberDashboard;