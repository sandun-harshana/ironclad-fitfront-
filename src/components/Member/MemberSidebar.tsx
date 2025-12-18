import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, User, CreditCard, MessageCircle, Calendar, Trophy } from "lucide-react";

const MemberSidebar = () => {
  const [open, setOpen] = useState<boolean>(() => {
    // Persist sidebar state in localStorage
    const saved = localStorage.getItem('memberSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const location = useLocation();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('memberSidebarOpen', JSON.stringify(open));
  }, [open]);

  // Prevent sidebar from closing on route changes - only user can toggle it
  useEffect(() => {
    // Ensure sidebar stays in its saved state when navigating
    const saved = localStorage.getItem('memberSidebarOpen');
    if (saved !== null) {
      setOpen(JSON.parse(saved));
    }
  }, [location.pathname]);

  const links = [
    { name: "Dashboard", to: "/member", icon: <Home /> },
    { name: "Profile", to: "/member/profile", icon: <User /> },
    { name: "Payments", to: "/member/payments", icon: <CreditCard /> },
    { name: "Chatbot", to: "/member/chatbot", icon: <MessageCircle /> },
    { name: "Schedule", to: "/member/schedule", icon: <Calendar /> },
  ];

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 flex-shrink-0 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {open && <h1 className="font-bold text-lg">Member Portal</h1>}
        <button 
          onClick={() => setOpen(!open)}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === link.to 
                ? "bg-blue-600 text-white" 
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <span className="flex-shrink-0">{link.icon}</span>
            {open && <span className="truncate">{link.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-400 text-center">
            Ironclad Fitness GMS
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSidebar;