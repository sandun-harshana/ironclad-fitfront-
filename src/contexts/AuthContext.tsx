import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { initializeSampleData } from '@/lib/initializeData';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'trainer';
  createdAt: any;
  lastLogin: any;
  isActive: boolean;
  // Member specific fields
  membershipType?: string;
  membershipStatus?: 'active' | 'inactive' | 'suspended';
  joinDate?: any;
  phone?: string;
  birthday?: string;
  emergencyContact?: string;
  goals?: string;
  address?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  renewalDate?: string;
  sessionsUsed?: number;
  totalSessions?: number;
  // Trainer specific fields
  specialization?: string;
  certifications?: string[];
  experience?: number;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, role: 'admin' | 'member' | 'trainer') => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createUserProfile = async (user: User, role: 'admin' | 'member' | 'trainer' = 'member') => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        ...(role === 'member' && {
          membershipType: 'basic',
          membershipStatus: 'active',
          joinDate: serverTimestamp(),
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
          sessionsUsed: 0,
          totalSessions: 20,
          fitnessLevel: 'beginner'
        }),
        ...(role === 'trainer' && {
          specialization: '',
          certifications: [],
          experience: 0
        })
      };

      await setDoc(userRef, newUserProfile);
      
      // Initialize sample data for new users to avoid index issues
      try {
        await initializeSampleData(user.uid, user.displayName || user.email || 'New User');
      } catch (error) {
        console.log('Sample data initialization skipped:', error);
      }
      
      return newUserProfile;
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
      return userSnap.data() as UserProfile;
    }
  };

  const fetchUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const profile = userSnap.data() as UserProfile;
        setUserProfile(profile);
        return profile;
      } else {
        // Create new user profile with default member role
        const newProfile = await createUserProfile(user, 'member');
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await fetchUserProfile(user);
      
      toast({
        title: "Success",
        description: "Successfully signed in with Google",
      });
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast({
        title: "Success",
        description: "Successfully signed out",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (uid: string, role: 'admin' | 'member' | 'trainer') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
      
      // If updating current user's role, refresh profile
      if (currentUser && currentUser.uid === uid) {
        await refreshUserProfile();
      }
      
      toast({
        title: "Success",
        description: `User role updated to ${role}`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const refreshUserProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    logout,
    updateUserRole,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};