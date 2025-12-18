import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Calendar, 
  Dumbbell, 
  ClipboardList, 
  BarChart3, 
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const TrainerSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Persist sidebar state in localStorage
    const saved = localStorage.getItem('trainerSidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const location = useLocation();
  const { userProfile } = useAuth();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trainerSidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Prevent sidebar from closing on route changes - only user can toggle it
  useEffect(() => {
    // Ensure sidebar stays in its saved state when navigating
    const saved = localStorage.getItem('trainerSidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/trainer" },
    { icon: Users, label: "My Members", path: "/trainer/members" },
    { icon: Calendar, label: "My Classes", path: "/trainer/classes" },
    { icon: ClipboardList, label: "Attendance", path: "/trainer/attendance" },
    { icon: Dumbbell, label: "Equipment", path: "/trainer/equipment" },
    { icon: BarChart3, label: "Analytics", path: "/trainer/analytics" },
    { icon: MessageCircle, label: "Messages", path: "/trainer/messages" },
    { icon: User, label: "Profile", path: "/trainer/profile" },
    { icon: Clock, label: "Schedule", path: "/trainer/schedule" },
    { icon: Settings, label: "Settings", path: "/trainer/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/trainer") {
      return location.pathname === "/trainer";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-white">Trainer Panel</h2>
              <p className="text-sm text-gray-400">
                {userProfile?.displayName || 'Trainer'}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TrainerSidebar;