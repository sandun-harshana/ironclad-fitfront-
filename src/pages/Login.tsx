import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Chrome, Loader2 } from 'lucide-react';

const Login = () => {
  const { currentUser, userProfile, signInWithGoogle, updateUserRole, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member' | 'trainer'>('member');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (currentUser && userProfile) {
      // Redirect based on user role
      switch (userProfile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'member':
          navigate('/member');
          break;
        case 'trainer':
          navigate('/trainer');
          break;
        default:
          navigate('/');
      }
    }
  }, [currentUser, userProfile, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRoleChange = async () => {
    if (currentUser && userProfile && userProfile.role !== selectedRole) {
      try {
        await updateUserRole(currentUser.uid, selectedRole);
        // Navigate to appropriate dashboard after role change
        switch (selectedRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'member':
            navigate('/member');
            break;
          case 'trainer':
            navigate('/trainer');
            break;
        }
      } catch (error) {
        console.error('Role change error:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, show role selector
  if (currentUser && userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Dumbbell className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl text-white">Welcome Back!</CardTitle>
            <CardDescription className="text-gray-400">
              You're signed in as {userProfile.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Current Role:</p>
              <p className="text-lg font-semibold text-white capitalize">
                {userProfile.role}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Change Role (Demo Purpose)
                </label>
                <Select value={selectedRole} onValueChange={(value: 'admin' | 'member' | 'trainer') => setSelectedRole(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="admin" className="text-white hover:bg-gray-600">
                      Admin
                    </SelectItem>
                    <SelectItem value="member" className="text-white hover:bg-gray-600">
                      Member
                    </SelectItem>
                    <SelectItem value="trainer" className="text-white hover:bg-gray-600">
                      Trainer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleRoleChange}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={selectedRole === userProfile.role}
              >
                {selectedRole === userProfile.role ? 'Current Role' : `Switch to ${selectedRole}`}
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <Button 
                onClick={() => {
                  switch (userProfile.role) {
                    case 'admin':
                      navigate('/admin');
                      break;
                    case 'member':
                      navigate('/member');
                      break;
                    case 'trainer':
                      navigate('/trainer');
                      break;
                    default:
                      navigate('/');
                  }
                }}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl text-white">Welcome to Ironclad Fitness</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to access your gym management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2"
          >
            {isSigningIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="h-4 w-4" />
            )}
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <div className="text-center text-sm text-gray-400">
            <p>By signing in, you agree to our terms of service</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;