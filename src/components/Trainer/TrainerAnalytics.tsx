import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Calendar, 

  Star,
  Activity,
  Clock,
  Target,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getClassesByInstructor } from "@/lib/firestore";
import { formatCurrency } from "@/lib/currency";

const TrainerAnalytics = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchAnalyticsData();
    }
  }, [currentUser]);

  const fetchAnalyticsData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const classData = await getClassesByInstructor(currentUser.uid);
      setClasses(classData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', classes: 12, members: 45, revenue: 2400 },
    { month: 'Feb', classes: 15, members: 52, revenue: 2800 },
    { month: 'Mar', classes: 18, members: 48, revenue: 3200 },
    { month: 'Apr', classes: 14, members: 55, revenue: 2900 },
    { month: 'May', classes: 20, members: 62, revenue: 3600 },
    { month: 'Jun', classes: 22, members: 58, revenue: 3800 }
  ];

  const classTypeData = [
    { name: 'Strength', value: 35, color: '#3B82F6' },
    { name: 'Cardio', value: 25, color: '#10B981' },
    { name: 'Yoga', value: 20, color: '#8B5CF6' },
    { name: 'HIIT', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 5, color: '#EF4444' }
  ];

  const performanceMetrics = [
    { metric: 'Class Completion Rate', value: 95, target: 90, color: 'text-green-500' },
    { metric: 'Member Satisfaction', value: 4.8, target: 4.5, color: 'text-blue-500' },
    { metric: 'Attendance Rate', value: 87, target: 85, color: 'text-purple-500' },
    { metric: 'Retention Rate', value: 92, target: 88, color: 'text-yellow-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your performance and growth metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-white">{classes.length}</p>
                <p className="text-xs text-green-500">+12% from last month</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-white">
                  {classes.reduce((sum, cls) => sum + cls.enrolled, 0)}
                </p>
                <p className="text-xs text-green-500">+8% from last month</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(3800 * 330)}</p>
                <p className="text-xs text-green-500">+15% from last month</p>
              </div>
              <span className="h-8 w-8 text-yellow-500 font-bold text-lg">₨</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">4.8</p>
                <p className="text-xs text-green-500">+0.2 from last month</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="classes" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="members" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Types Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Class Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {classTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="revenue" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${metric.color}`}>
                      {metric.metric.includes('Satisfaction') ? metric.value : `${metric.value}%`}
                    </span>
                    <Badge className="bg-green-500 text-white text-xs">
                      Target: {metric.metric.includes('Satisfaction') ? metric.target : `${metric.target}%`}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${metric.metric.includes('Satisfaction') ? 
                        (metric.value / 5) * 100 : 
                        Math.min(metric.value, 100)
                      }%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Star className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Top Rated Trainer</p>
                <p className="text-gray-300 text-sm">Achieved 4.8+ rating for 3 consecutive months</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-blue-400 font-medium">Member Growth</p>
                <p className="text-gray-300 text-sm">Increased member base by 25% this quarter</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <Clock className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-purple-400 font-medium">Perfect Attendance</p>
                <p className="text-gray-300 text-sm">100% class completion rate this month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerAnalytics;