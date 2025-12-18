import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getClassesByInstructor,
  addClass,
  updateClass,
  GymClass
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

const TrainerClasses = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    capacity: 20,
    location: "",
    type: "fitness"
  });

  useEffect(() => {
    if (currentUser) {
      fetchClasses();
    }
  }, [currentUser]);

  const fetchClasses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const classData = await getClassesByInstructor(currentUser.uid);
      setClasses(classData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.startTime || !newClass.endTime || !currentUser || !userProfile) {
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
        instructor: userProfile.displayName || 'Trainer',
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
      await fetchClasses();

      // Reset form
      setNewClass({
        name: "",
        description: "",
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
        description: "Class created successfully!",
      });

    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!selectedClass) return;

    try {
      setUpdating(true);
      
      await updateClass(selectedClass.id!, {
        name: selectedClass.name,
        description: selectedClass.description,
        startTime: selectedClass.startTime,
        endTime: selectedClass.endTime,
        capacity: selectedClass.capacity,
        location: selectedClass.location,
        type: selectedClass.type,
        status: selectedClass.status
      });

      await fetchClasses();
      setIsEditDialogOpen(false);
      setSelectedClass(null);

      toast({
        title: "Success",
        description: "Class updated successfully!",
      });

    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return <Badge className="bg-blue-500 text-white">Scheduled</Badge>;
      case "ongoing": return <Badge className="bg-green-500 text-white">Ongoing</Badge>;
      case "completed": return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      case "cancelled": return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      default: return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const upcomingClasses = classes.filter(cls => {
    const classDate = new Date(cls.date.seconds * 1000);
    return classDate > new Date() && cls.status === 'scheduled';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading classes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Classes</h1>
          <p className="text-gray-400">Create and manage your fitness classes</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
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
                  <Label htmlFor="type">Class Type</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleAddClass} disabled={adding} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Class
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-white">{classes.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingClasses.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Enrolled</p>
                <p className="text-2xl font-bold text-white">
                  {classes.reduce((sum, cls) => sum + cls.enrolled, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg. Capacity</p>
                <p className="text-2xl font-bold text-white">
                  {classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + (cls.enrolled / cls.capacity * 100), 0) / classes.length) : 0}%
                </p>
              </div>
              <MapPin className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Classes ({filteredClasses.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Status</SelectItem>
                  <SelectItem value="scheduled" className="text-white hover:bg-gray-600">Scheduled</SelectItem>
                  <SelectItem value="ongoing" className="text-white hover:bg-gray-600">Ongoing</SelectItem>
                  <SelectItem value="completed" className="text-white hover:bg-gray-600">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-white hover:bg-gray-600">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchClasses} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Class</TableHead>
                  <TableHead className="text-gray-400">Date & Time</TableHead>
                  <TableHead className="text-gray-400">Location</TableHead>
                  <TableHead className="text-gray-400">Enrolled</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => (
                    <TableRow key={cls.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{cls.type}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p>{new Date(cls.date.seconds * 1000).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-400">{cls.startTime} - {cls.endTime}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{cls.location}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <span>{cls.enrolled}/{cls.capacity}</span>
                          <div className="w-16 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(cls.status)}
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      {searchTerm || statusFilter !== "all" ? 'No classes found matching your criteria.' : 'No classes created yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Class Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedClass.name}
                    onChange={(e) => setSelectedClass({...selectedClass, name: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Class Type</Label>
                  <Select value={selectedClass.type} onValueChange={(value) => setSelectedClass({...selectedClass, type: value})}>
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

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedClass.description}
                  onChange={(e) => setSelectedClass({...selectedClass, description: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={selectedClass.startTime}
                    onChange={(e) => setSelectedClass({...selectedClass, startTime: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={selectedClass.endTime}
                    onChange={(e) => setSelectedClass({...selectedClass, endTime: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={selectedClass.capacity}
                    onChange={(e) => setSelectedClass({...selectedClass, capacity: parseInt(e.target.value) || 20})}
                    className="bg-gray-700 border-gray-600"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={selectedClass.location}
                    onChange={(e) => setSelectedClass({...selectedClass, location: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={selectedClass.status} onValueChange={(value: any) => setSelectedClass({...selectedClass, status: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleUpdateClass} disabled={updating} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Class
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerClasses;