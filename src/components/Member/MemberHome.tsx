import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  CreditCard,
  Target,
  TrendingUp,
  Clock,
  Users,
  Dumbbell,
  Star,
  Activity,
  MessageCircle,
  User,
  Loader2,
  Plus,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserBookings,
  getPaymentsByUser,
  getAllClasses,
  ClassBooking,
  Payment,
  GymClass
} from "@/lib/firestore";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";

interface MemberStats {
  totalBookings: number;
  upcomingClasses: number;
  completedSessions: number;
  totalPayments: number;
  monthlySpent: number;
  membershipDays: number;
}

const MemberHome = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MemberStats>({
    totalBookings: 0,
    upcomingClasses: 0,
    completedSessions: 0,
    totalPayments: 0,
    monthlySpent: 0,
    membershipDays: 0
  });
  const [recentBookings, setRecentBookings] = useState<ClassBooking[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<GymClass[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchMemberData();
    }
  }, [currentUser]);

  const fetchMemberData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const [bookings, payments, allClasses] = await Promise.all([
        getUserBookings(currentUser.uid),
        getPaymentsByUser(currentUser.uid),
        getAllClasses()
      ]);

      // Calculate stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const upcomingBookings = bookings.filter(booking => {
        const bookingClass = allClasses.find(cls => cls.id === booking.classId);
        if (!bookingClass) return false;
        const classDate = new Date(bookingClass.date.seconds * 1000);
        return classDate > now && booking.status === 'booked';
      });

      const completedBookings = bookings.filter(booking => booking.status === 'attended');

      const monthlyPayments = payments.filter(payment => {
        const paymentDate = payment.paidDate ? 
          new Date(payment.paidDate.seconds * 1000) : 
          new Date(payment.createdAt.seconds * 1000);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               payment.status === 'completed';
      });

      const membershipStartDate = userProfile?.createdAt ? 
        new Date(userProfile.createdAt.seconds * 1000) : new Date();
      const membershipDays = Math.floor((now.getTime() - membershipStartDate.getTime()) / (1000 * 60 * 60 * 24));

      setStats({
        totalBookings: bookings.length,
        upcomingClasses: upcomingBookings.length,
        completedSessions: completedBookings.length,
        totalPayments: payments.filter(p => p.status === 'completed').length,
        monthlySpent: monthlyPayments.reduce((sum, p) => sum + p.amount, 0),
        membershipDays: membershipDays
      });

      // Set recent data
      setRecentBookings(bookings.slice(0, 5));
      setRecentPayments(payments.slice(0, 3));

      // Get upcoming classes with details
      const upcomingClassDetails = upcomingBookings
        .map(booking => allClasses.find(cls => cls.id === booking.classId))
        .filter(Boolean)
        .slice(0, 3) as GymClass[];
      setUpcomingClasses(upcomingClassDetails);

    } catch (error) {
      console.error("Error fetching member data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMembershipProgress = () => {
    const sessionsUsed = userProfile?.sessionsUsed || 0;
    const totalSessions = userProfile?.totalSessions || 20;
    return (sessionsUsed / totalSessions) * 100;
  };

  const getMembershipTypeColor = (type?: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-500 text-white';
      case 'standard': return 'bg-blue-500 text-white';
      case 'basic': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Member'}! 💪
        </h1>
        <p className="text-gray-400">
          Ready to crush your fitness goals today? Let's see your progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-500 text-white text-xs">
                {stats.upcomingClasses} upcoming
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed Sessions</p>
                <p className="text-2xl font-bold text-white">{stats.completedSessions}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-500 text-white text-xs">This month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Monthly Spent</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthlySpent)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-500 text-white text-xs">
                {stats.totalPayments} payments
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Member Days</p>
                <p className="text-2xl font-bold text-white">{stats.membershipDays}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-yellow-500 text-black text-xs">Active member</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Membership Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/member/payments">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            </Link>
            <Link to="/member/schedule">
              <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700 justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Book Class
              </Button>
            </Link>
            <Link to="/member/chatbot">
              <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700 justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              Membership Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Plan:</span>
              <Badge className={getMembershipTypeColor(userProfile?.membershipType)}>
                {userProfile?.membershipType?.toUpperCase() || 'BASIC'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Status:</span>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Renewal:</span>
              <span className="text-white text-sm">
                {userProfile?.renewalDate || 'N/A'}
              </span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Sessions Used:</span>
                <span className="text-white text-sm">
                  {userProfile?.sessionsUsed || 0} / {userProfile?.totalSessions || 20}
                </span>
              </div>
              <Progress value={getMembershipProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Fitness Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Level:</span>
              <Badge className="bg-blue-500 text-white capitalize">
                {userProfile?.fitnessLevel || 'Beginner'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Weekly Goal:</span>
              <span className="text-white">3 sessions</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">This Week:</span>
              <span className="text-green-400">2 completed</span>
            </div>
            {userProfile?.goals && (
              <div className="mt-3 p-2 bg-gray-700 rounded text-sm text-gray-300">
                {userProfile.goals}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Upcoming Classes
              </span>
              <Link to="/member/schedule">
                <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length > 0 ? (
              <div className="space-y-3">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white text-sm">{cls.name}</h4>
                      <Badge className="bg-blue-500 text-white text-xs">
                        {cls.enrolled}/{cls.capacity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(cls.date.seconds * 1000).toLocaleDateString()} at {cls.startTime}
                    </p>
                    <p className="text-xs text-gray-400">with {cls.instructor}</p>
                    <p className="text-xs text-gray-400">{cls.location}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No upcoming classes</p>
                <Link to="/member/schedule">
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                    Book a Class
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Recent Payments
              </span>
              <Link to="/member/payments">
                <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length > 0 ? (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white text-sm">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-400 capitalize">{payment.type.replace('-', ' ')}</p>
                      <p className="text-xs text-gray-400">
                        {payment.paidDate ? 
                          new Date(payment.paidDate.seconds * 1000).toLocaleDateString() : 
                          new Date(payment.createdAt.seconds * 1000).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <Badge className={
                      payment.status === 'completed' ? 'bg-green-500 text-white' :
                      payment.status === 'pending' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No recent payments</p>
                <Link to="/member/payments">
                  <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                    Make Payment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Motivational Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Keep up the great work! 🎯
              </h3>
              <p className="text-blue-100">
                You've completed {stats.completedSessions} sessions this month. 
                {stats.completedSessions >= 8 ? " You're crushing your goals!" : " Just a few more to reach your monthly target!"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{stats.completedSessions}</div>
              <div className="text-blue-100 text-sm">Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberHome;