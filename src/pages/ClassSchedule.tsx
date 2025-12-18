import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  Dumbbell,
  MapPin,
  Star,
  Zap,
  TrendingUp,
  Activity,
  Plus,
  Loader2,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAllClasses, 
  addClass, 
  GymClass, 
  bookClass, 
  cancelBooking, 
  getUserBookings, 
  ClassBooking 
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

const ClassSchedule = () => {
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const [selectedDay, setSelectedDay] = useState("today");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [userBookings, setUserBookings] = useState<ClassBooking[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    instructor: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    capacity: 20,
    location: "",
    type: "fitness"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classData, bookingData] = await Promise.all([
        getAllClasses(),
        currentUser ? getUserBookings(currentUser.uid) : Promise.resolve([])
      ]);
      setClasses(classData);
      setUserBookings(bookingData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load class schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.instructor || !newClass.startTime || !newClass.endTime || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setAdding(true);
      
      const classData: Omit<GymClass, 'id' | 'createdAt' | 'updatedAt'> = {
        name: newClass.name,
        description: newClass.description,
        instructor: newClass.instructor,
        instructorId: currentUser.uid,
        date: Timestamp.fromDate(new Date(newClass.date)),
        startTime: newClass.startTime,
        endTime: newClass.endTime,
        capacity: newClass.capacity,
        enrolled: 0,
        status: 'scheduled',
        location: newClass.location,
        type: newClass.type
      };

      await addClass(classData);
      await fetchData();

      // Reset form
      setNewClass({
        name: "",
        description: "",
        instructor: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        capacity: 20,
        location: "",
        type: "fitness"
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Class added successfully!",
      });

    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Error",
        description: "Failed to add class. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleBookClass = async (classItem: GymClass) => {
    if (!currentUser || !userProfile) {
      toast({
        title: "Error",
        description: "Please log in to book classes",
        variant: "destructive"
      });
      return;
    }

    const existingBooking = userBookings.find(
      booking => booking.classId === classItem.id && booking.status === 'booked'
    );

    try {
      setBookingLoading(classItem.id!);

      if (existingBooking) {
        // Cancel booking
        await cancelBooking(existingBooking.id!, classItem.id!);
        toast({
          title: "Booking Cancelled",
          description: "You have successfully cancelled your booking.",
        });
      } else {
        // Book class
        if (classItem.enrolled >= classItem.capacity) {
          toast({
            title: "Class Full",
            description: "This class is already at full capacity.",
            variant: "destructive"
          });
          return;
        }

        const bookingData: Omit<ClassBooking, 'id' | 'createdAt'> = {
          classId: classItem.id!,
          className: classItem.name,
          userId: currentUser.uid,
          userName: userProfile.displayName || userProfile.email || 'Unknown User',
          userEmail: userProfile.email || '',
          bookingDate: Timestamp.now(),
          status: 'booked'
        };

        await bookClass(bookingData);
        toast({
          title: "Class Booked!",
          description: "You have successfully booked this class.",
        });
      }

      await fetchData(); // Refresh data

    } catch (error) {
      console.error("Error handling booking:", error);
      toast({
        title: "Error",
        description: "Failed to process booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBookingLoading(null);
    }
  };

  const isClassBooked = (classId: string) => {
    return userBookings.some(
      booking => booking.classId === classId && booking.status === 'booked'
    );
  };

  const filteredClasses = classes.filter(class_ => {
    const classDate = new Date(class_.date.seconds * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let matchesDay = true;
    if (selectedDay === "today") {
      matchesDay = classDate.toDateString() === today.toDateString();
    } else if (selectedDay === "tomorrow") {
      matchesDay = classDate.toDateString() === tomorrow.toDateString();
    }

    const matchesFilter = selectedFilter === "all" || class_.type === selectedFilter;
    const matchesSearch = class_.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         class_.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDay && matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500 text-white";
      case "ongoing": return "bg-green-500 text-white";
      case "completed": return "bg-gray-500 text-white";
      case "cancelled": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "yoga": return <Activity className="h-4 w-4" />;
      case "cardio": return <Zap className="h-4 w-4" />;
      case "strength": return <Dumbbell className="h-4 w-4" />;
      case "pilates": return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const bookedClasses = userBookings.filter(booking => booking.status === 'booked');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading class schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Class Schedule</h1>
          <p className="text-gray-400">Book your fitness classes and manage your schedule</p>
        </div>
        
        {(userProfile?.role === 'admin' || userProfile?.role === 'trainer') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., Morning Yoga"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={newClass.instructor}
                      onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                      placeholder="Instructor name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newClass.description}
                    onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="Class description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newClass.date}
                      onChange={(e) => setNewClass({...newClass, date: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newClass.startTime}
                      onChange={(e) => setNewClass({...newClass, startTime: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newClass.endTime}
                      onChange={(e) => setNewClass({...newClass, endTime: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newClass.capacity}
                      onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value) || 20})}
                      className="bg-gray-700 border-gray-600"
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newClass.location}
                      onChange={(e) => setNewClass({...newClass, location: e.target.value})}
                      className="bg-gray-700 border-gray-600"
                      placeholder="Studio A, Main Floor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newClass.type} onValueChange={(value) => setNewClass({...newClass, type: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="pilates">Pilates</SelectItem>
                        <SelectItem value="dance">Dance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleAddClass} disabled={adding} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {adding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Class
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1 border-gray-600">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-blue-400 font-medium">Search Classes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-blue-400 font-medium">Time Period</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="today" className="text-white hover:bg-gray-600">Today</SelectItem>
                  <SelectItem value="tomorrow" className="text-white hover:bg-gray-600">Tomorrow</SelectItem>
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-blue-400 font-medium">Class Type</label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Classes</SelectItem>
                  <SelectItem value="yoga" className="text-white hover:bg-gray-600">Yoga</SelectItem>
                  <SelectItem value="cardio" className="text-white hover:bg-gray-600">Cardio</SelectItem>
                  <SelectItem value="strength" className="text-white hover:bg-gray-600">Strength</SelectItem>
                  <SelectItem value="pilates" className="text-white hover:bg-gray-600">Pilates</SelectItem>
                  <SelectItem value="fitness" className="text-white hover:bg-gray-600">Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-blue-400 font-medium">Quick Actions</label>
              <Button 
                onClick={fetchData}
                variant="outline" 
                className="w-full border-gray-600 text-white hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Bookings */}
      {bookedClasses.length > 0 && (
        <Card className="bg-gray-800 border-blue-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              My Bookings
              <Badge className="bg-blue-500 text-white ml-2">
                {bookedClasses.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookedClasses.map((booking) => {
                const classItem = classes.find(c => c.id === booking.classId);
                if (!classItem) return null;
                
                return (
                  <div key={booking.id} className="p-4 bg-gray-700 border border-blue-500 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-blue-400">{booking.className}</h4>
                      <Badge className="bg-green-500 text-white">Booked</Badge>
                    </div>
                    <p className="text-sm text-gray-300">with {classItem.instructor}</p>
                    <p className="text-sm text-gray-300">{classItem.startTime} - {classItem.endTime}</p>
                    <p className="text-sm text-gray-300">{classItem.location}</p>
                    <p className="text-sm text-gray-300">
                      {new Date(classItem.date.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => {
          const isBooked = isClassBooked(classItem.id!);
          const isAvailable = classItem.enrolled < classItem.capacity;
          const availableSpots = classItem.capacity - classItem.enrolled;
          const isBookingThisClass = bookingLoading === classItem.id;
          
          return (
            <Card 
              key={classItem.id} 
              className={`bg-gray-800 border-gray-700 hover:border-blue-500 transition-all ${isBooked ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(classItem.type)}
                      <CardTitle className="text-white text-lg">
                        {classItem.name}
                      </CardTitle>
                    </div>
                    <p className="text-gray-400 text-sm">Instructor: {classItem.instructor}</p>
                  </div>
                  <Badge className={getStatusColor(classItem.status)}>
                    {classItem.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-white">{classItem.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-400" />
                    <span className="text-white">
                      {new Date(classItem.date.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg col-span-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="text-white text-xs">{classItem.location}</span>
                  </div>
                </div>

                {classItem.description && (
                  <p className="text-gray-300 text-sm">{classItem.description}</p>
                )}

                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-400">Available</p>
                    <p className={`text-sm font-bold ${
                      availableSpots === 0 ? "text-red-400" : 
                      availableSpots <= 2 ? "text-yellow-400" : 
                      "text-green-400"
                    }`}>
                      {availableSpots === 0 ? "FULL" : 
                       availableSpots <= 2 ? `${availableSpots} left` : 
                       `${availableSpots} spots`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Enrolled</p>
                    <p className="text-sm text-white">{classItem.enrolled}/{classItem.capacity}</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleBookClass(classItem)}
                  disabled={(!isAvailable && !isBooked) || isBookingThisClass}
                  className={`w-full ${
                    isBooked 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : isAvailable
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isBookingThisClass ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : isBooked ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </>
                  ) : isAvailable ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Book Class
                    </>
                  ) : (
                    "Class Full"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Calendar className="h-24 w-24 text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No Classes Found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              No classes match your current filters. Try adjusting your search criteria.
            </p>
            <Button 
              onClick={() => {setSelectedFilter("all"); setSearchTerm("");}}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassSchedule;