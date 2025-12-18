import React from "react";
import { Outlet } from "react-router-dom";
import TrainerHeader from "@/components/Trainer/TrainerHeader";
import TrainerSidebar from "@/components/Trainer/TrainerSidebar";

function TrainerDashboard() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <TrainerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TrainerHeader />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TrainerDashboard;