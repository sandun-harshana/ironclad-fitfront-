import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Dumbbell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

function MemberHeader() {
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/profile')) return 'Member Profile';
    if (path.includes('/payments')) return 'Payment History';
    if (path.includes('/chatbot')) return 'Fitness Assistant';
    return 'Member Dashboard';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 flex-shrink-0">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Dumbbell className="text-blue-500" size={24} />
          <div className="text-white">
            <h2 className="text-xl font-bold">
              {getPageTitle()}
            </h2>
            <p className="text-gray-400 text-sm">
              Welcome to your fitness journey
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-white">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.photoURL} />
              <AvatarFallback className="bg-green-600 text-white">
                {userProfile?.displayName?.charAt(0) || 'M'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{userProfile?.displayName || 'Member User'}</p>
              <p className="text-xs text-gray-400 capitalize">{userProfile?.role}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="text-white hover:text-red-400 hover:bg-gray-800 flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default MemberHeader;