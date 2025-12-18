import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, Users, Calendar as CalendarIcon, Dumbbell, Activity, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllUsers, 
  getAllPayments, 
  getAllClasses, 
  getAllEquipment,
  getCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { formatCurrency } from "@/lib/currency";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalTrainers: number;
  monthlyRevenue: number;
  totalClasses: number;
  totalEquipment: number;
  availableEquipment: number;
}

// Weekday names
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Custom calendar component with database integration
const ClassesCalendar = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "note" as "class" | "maintenance" | "event" | "note"
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsData = await getCalendarEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !selectedDay || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const currentDate = new Date();
      const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
      
      const eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
        title: newEvent.title,
        description: newEvent.description,
        date: Timestamp.fromDate(eventDate),
        type: newEvent.type,
        createdBy: currentUser.uid
      };

      await addCalendarEvent(eventData);
      await fetchEvents();

      setNewEvent({ title: "", description: "", type: "note" });
      setSelectedDay(null);
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Calendar event added successfully!",
      });

    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add calendar event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      
      await updateCalendarEvent(selectedEvent.id!, {
        title: selectedEvent.title,
        description: selectedEvent.description,
        type: selectedEvent.type
      });

      await fetchEvents();
      setIsEditDialogOpen(false);
      setSelectedEvent(null);

      toast({
        title: "Success",
        description: "Calendar event updated successfully!",
      });

    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update calendar event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteCalendarEvent(eventId);
      await fetchEvents();
      
      toast({
        title: "Success",
        description: "Calendar event deleted successfully!",
      });

    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete calendar event",
        variant: "destructive"
      });
    }
  };

  const getEventsForDay = (day: number) => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return events.filter(event => {
      const eventDate = new Date(event.date.seconds * 1000);
      return eventDate.toDateString() === targetDate.toDateString();
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-500 text-white';
      case 'maintenance': return 'bg-yellow-500 text-black';
      case 'event': return 'bg-green-500 text-white';
      case 'note': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Gym Calendar</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="day">Select Day</Label>
                  <select
                    id="day"
                    value={selectedDay || ""}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="">Select a day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <select
                    id="type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="note">Note</option>
                    <option value="class">Class</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleAddEvent} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
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
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {/* Weekdays */}
          {DAYS.map((day) => (
            <div key={day} className="font-semibold text-gray-300 p-2">{day}</div>
          ))}

          {/* Days in month */}
          {Array.from({ length: 31 }, (_, i) => {
            const dayNumber = i + 1;
            const dayEvents = getEventsForDay(dayNumber);

            return (
              <div
                key={dayNumber}
                className="p-2 border border-gray-600 rounded text-white cursor-pointer hover:bg-gray-700 transition min-h-[80px] relative"
                onClick={() => setSelectedDay(dayNumber)}
              >
                <div className="font-bold text-sm mb-1">{dayNumber}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate"
                      style={{ backgroundColor: getEventTypeColor(event.type).split(' ')[0].replace('bg-', '') }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-blue-400">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Edit Calendar Event</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Event Title</Label>
                  <Input
                    id="edit-title"
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-type">Event Type</Label>
                  <select
                    id="edit-type"
                    value={selectedEvent.type}
                    onChange={(e) => setSelectedEvent({...selectedEvent, type: e.target.value as any})}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="note">Note</option>
                    <option value="class">Class</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleUpdateEvent} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Event
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleDeleteEvent(selectedEvent.id!)} 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="border-gray-600">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

function AdminCards() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalTrainers: 0,
    monthlyRevenue: 0,
    totalClasses: 0,
    totalEquipment: 0,
    availableEquipment: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [users, payments, classes, equipment] = await Promise.all([
        getAllUsers(),
        getAllPayments(),
        getAllClasses(),
        getAllEquipment()
      ]);

      // Calculate stats
      const members = users.filter(user => user.role === 'member');
      const trainers = users.filter(user => user.role === 'trainer');
      const activeMembers = members.filter(user => user.isActive);
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = payments
        .filter(payment => {
          const paymentDate = payment.paidDate ? 
            new Date(payment.paidDate.seconds * 1000) : 
            new Date(payment.createdAt.seconds * 1000);
          return paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear &&
                 payment.status === 'completed';
        })
        .reduce((sum, payment) => sum + payment.amount, 0);

      const availableEquipment = equipment.filter(eq => eq.status === 'available');

      setStats({
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        totalTrainers: trainers.length,
        monthlyRevenue,
        totalClasses: classes.length,
        totalEquipment: equipment.length,
        availableEquipment: availableEquipment.length
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
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
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {userProfile?.displayName || 'Admin'}! 👋
        </h1>
        <p className="text-gray-400">Here's what's happening at your gym today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-500 text-white text-xs">
                {stats.activeMembers} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Trainers */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trainers</p>
                <p className="text-2xl font-bold text-white">{stats.totalTrainers}</p>
              </div>
              <Dumbbell className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-500 text-white text-xs">Professional staff</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <span className="h-8 w-8 text-yellow-500 font-bold text-lg">₨</span>
            </div>
            <div className="mt-2">
              <Badge className="bg-green-500 text-white text-xs">This month</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Classes */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Classes</p>
                <p className="text-2xl font-bold text-white">{stats.totalClasses}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-500 text-white text-xs">Scheduled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-orange-500" />
              Equipment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Equipment</span>
                <Badge className="bg-blue-500 text-white">{stats.totalEquipment}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Available</span>
                <Badge className="bg-green-500 text-white">{stats.availableEquipment}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">In Maintenance</span>
                <Badge className="bg-yellow-500 text-black">
                  {stats.totalEquipment - stats.availableEquipment}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Member Retention</span>
                <Badge className="bg-green-500 text-white">
                  {stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Equipment Availability</span>
                <Badge className="bg-blue-500 text-white">
                  {stats.totalEquipment > 0 ? Math.round((stats.availableEquipment / stats.totalEquipment) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Classes per Trainer</span>
                <Badge className="bg-purple-500 text-white">
                  {stats.totalTrainers > 0 ? Math.round(stats.totalClasses / stats.totalTrainers) : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar toggle button */}
      <div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon className="h-4 w-4" />
          {showCalendar ? 'Hide' : 'Show'} Gym Calendar
        </Button>

        {/* Custom calendar */}
        {showCalendar && <ClassesCalendar />}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={fetchDashboardStats}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          Refresh Data
        </Button>
      </div>
    </div>
  );
}

export default AdminCards;