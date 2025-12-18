import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Admin Components
import AdminCards from "./components/Admin/AdminCards";
import MembersManagement from "./components/Admin/MembersManagement";
import TrainerOverview from "./components/Admin/TrainerOverviwe";
import AdminChatbotControl from "./components/Admin/AdminChatbotControl";
import AdminPayments from "./components/Admin/AdminPayments";
import ManageEquipment from "./pages/ManageEquipment";
import ClassSchedule from "./pages/ClassSchedule";

// Member Components
import MemberHome from "./components/Member/MemberHome";
import MemberProfile from "./components/Member/MemberProfile";
import MemberChatbot from "./components/Member/MemberChatbot";
import MemberPayments from "./components/Member/MemberPayments";

// Trainer Components
import TrainerHome from "./components/Trainer/TrainerHome";
import TrainerMembers from "./components/Trainer/TrainerMembers";
import TrainerClasses from "./components/Trainer/TrainerClasses";
import TrainerProfile from "./components/Trainer/TrainerProfile";
import TrainerAnalytics from "./components/Trainer/TrainerAnalytics";
import TrainerMessages from "./components/Trainer/TrainerMessages";
import Attendance from "./components/Trainer/Attendance";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Admin Routes - Protected */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<AdminCards />} />
                <Route path="home" element={<AdminCards />} />
                <Route path="members" element={<MembersManagement />} />
                <Route path="trainers" element={<TrainerOverview />} />
                <Route path="equipment" element={<ManageEquipment />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="chatbot" element={<AdminChatbotControl />} />
                <Route path="schedule" element={<ClassSchedule />} />
              </Route>
              
              {/* Member Routes - Protected */}
              <Route path="/member" element={
                <ProtectedRoute requiredRole="member">
                  <MemberDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<MemberHome />} />
                <Route path="profile" element={<MemberProfile />} />
                <Route path="payments" element={<MemberPayments />} />
                <Route path="chatbot" element={<MemberChatbot />} />
                <Route path="schedule" element={<ClassSchedule />} />
              </Route>
              
              {/* Trainer Routes - Protected */}
              <Route path="/trainer" element={
                <ProtectedRoute requiredRole="trainer">
                  <TrainerDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<TrainerHome />} />
                <Route path="members" element={<TrainerMembers />} />
                <Route path="classes" element={<TrainerClasses />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="equipment" element={<ManageEquipment />} />
                <Route path="profile" element={<TrainerProfile />} />
                <Route path="schedule" element={<ClassSchedule />} />
                <Route path="analytics" element={<TrainerAnalytics />} />
                <Route path="messages" element={<TrainerMessages />} />
                <Route path="settings" element={<TrainerProfile />} />
              </Route>
              
              {/* Shared Routes - Protected (Any authenticated user) */}
              <Route path="/schedule" element={
                <ProtectedRoute allowedRoles={['admin', 'member', 'trainer']}>
                  <ClassSchedule />
                </ProtectedRoute>
              } />
              <Route path="/equipment" element={
                <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                  <ManageEquipment />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;