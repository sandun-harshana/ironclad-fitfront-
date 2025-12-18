import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Dumbbell, 
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getClassesByInstructor, 
  getUserBookings, 
  getAllUsers,
  GymClass,
  ClassBooking
} from "@/lib/firestore";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";

interface TrainerStats {
  totalClasses: number;
  upcomingClasses: number;
  totalMembers: number;
  completedSessions: number;
  averageRating: number;
  monthlyEarnings: number;
}

const TrainerHome = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TrainerStats>({
    totalClasses: 0,
    upcomingClasses: 0,
    totalMembers: 0,
    completedSessions: 0,
    averageRating: 4.8,
    monthlyEarnings: 0
  });
  const [recentClasses, setRecentClasses] = useState<GymClass[]>([]);
  const [recentBookings, setRecentBookings] = useState<ClassBooking[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchTrainerData();
    }
  }, [currentUser]);

  const fetchTrainerData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const [classes, users] = await Promise.all([
        getClassesByInstructor(currentUser.uid),
        getAllUsers()
      ]);

      // Calculate stats
      const now = new Date();
      const upcomingClasses = classes.filter(cls => {
        const classDate = new Date(cls.date.seconds * 1000);
        return classDate > now && cls.status === 'scheduled';
      });

      const completedClasses = classes.filter(cls => cls.status === 'completed');
      const totalEnrolled = classes.reduce((sum, cls) => sum + cls.enrolled, 0);

      setStats({
        totalClasses: classes.length,
        upcomingClasses: upcomingClasses.length,
        totalMembers: totalEnrolled,
        completedSessions: completedClasses.length,
        averageRating: 4.8, // This would come from a ratings system
        monthlyEarnings: completedClasses.length * 16500 // Estimated earnings in LKR
      });

      // Set recent classes (next 5 upcoming)
      const sortedUpcoming = upcomingClasses
        .sort((a, b) => a.date.seconds - b.date.seconds)
        .slice(0, 5);
      setRecentClasses(sortedUpcoming);

      // Get recent bookings for trainer's classes
      const allBookings: ClassBooking[] = [];
      for (const cls of classes) {
        // In a real app, you'd have a getBookingsByClass function
        // For now, we'll simulate some bookings
        if (cls.enrolled > 0) {
          allBookings.push({
            id: `booking-${cls.id}`,
            classId: cls.id!,
            className: cls.name,
            userId: 'sample-user',
            userName: 'Sample Member',
            userEmail: 'member@example.com',
            bookingDate: cls.date,
            status: 'booked',
            createdAt: cls.createdAt
          });
        }
      }
      setRecentBookings(allBookings.slice(0, 5));

    } catch (error) {
      console.error("Error fetching trainer data:", error);
      toast({
        title: "Error",
        description: "Failed to load trainer dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          Trainer Dashboard
        </h1>
        <p className="text-gray-400">
          Manage your classes, track your members, and grow your fitness community.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-white">{stats.totalClasses}</p>
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
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-500 text-white text-xs">Active</Badge>
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
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-500 text-white text-xs">This month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-yellow-500 text-black text-xs">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/trainer/classes">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Create New Class
              </Button>
            </Link>
            <Link to="/trainer/attendance">
              <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700 justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
            </Link>
            <Link to="/trainer/members">
              <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700 justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Members
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentClasses.length > 0 ? (
              <div className="space-y-3">
                {recentClasses.map((cls) => (
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
                    <p className="text-xs text-gray-400">{cls.location}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No upcoming classes</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Class Completion Rate</span>
              <Badge className="bg-green-500 text-white">95%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Member Satisfaction</span>
              <Badge className="bg-blue-500 text-white">{stats.averageRating}/5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Monthly Earnings</span>
              <Badge className="bg-yellow-500 text-black">{formatCurrency(stats.monthlyEarnings)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Active Members</span>
              <Badge className="bg-purple-500 text-white">{stats.totalMembers}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Recent Bookings
              </span>
              <Link to="/trainer/members">
                <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white text-sm">{booking.userName}</p>
                      <p className="text-xs text-gray-400">{booking.className}</p>
                    </div>
                    <Badge className="bg-green-500 text-white text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No recent bookings</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 font-medium">New Class Booking</p>
                <p className="text-xs text-gray-300">Sarah Johnson booked your Morning Yoga class</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-400 font-medium">Class Completed</p>
                <p className="text-xs text-gray-300">HIIT Training session completed successfully</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400 font-medium">Upcoming Class</p>
                <p className="text-xs text-gray-300">Strength Training starts in 30 minutes</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerHome;