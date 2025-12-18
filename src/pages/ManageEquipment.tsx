import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, Plus, Edit, Trash2, Loader2, Search, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAllEquipment, 
  addEquipment, 
  updateEquipment, 
  deleteEquipment,
  Equipment 
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

const ManageEquipment = () => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "",
    status: "available" as "available" | "maintenance" | "out-of-order",
    location: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const equipmentData = await getAllEquipment();
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load equipment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const equipmentData = {
        ...newEquipment,
        purchaseDate: Timestamp.fromDate(new Date(newEquipment.purchaseDate))
      };

      await addEquipment(equipmentData);
      await fetchEquipment();
      
      setNewEquipment({
        name: "",
        type: "",
        status: "available",
        location: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        notes: ""
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Equipment added successfully!",
      });
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment",
        variant: "destructive",
      });
    }
  };

  const handleEditEquipment = async () => {
    if (!selectedEquipment?.id) return;

    try {
      await updateEquipment(selectedEquipment.id, {
        name: selectedEquipment.name,
        type: selectedEquipment.type,
        status: selectedEquipment.status,
        location: selectedEquipment.location,
        notes: selectedEquipment.notes
      });
      
      await fetchEquipment();
      setIsEditDialogOpen(false);
      setSelectedEquipment(null);

      toast({
        title: "Success",
        description: "Equipment updated successfully!",
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await deleteEquipment(id);
      await fetchEquipment();
      
      toast({
        title: "Success",
        description: "Equipment deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 text-white';
      case 'maintenance':
        return 'bg-yellow-500 text-black';
      case 'out-of-order':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const equipmentStats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    outOfOrder: equipment.filter(e => e.status === 'out-of-order').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading equipment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Equipment Management</h1>
          <p className="text-gray-400">Manage your gym equipment efficiently</p>
        </div>
        
        {(userProfile?.role === 'admin' || userProfile?.role === 'trainer') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    id="name"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="e.g., Treadmill, Bench Press"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="e.g., Cardio, Strength, Free Weights"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="e.g., Main Floor, Second Floor"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newEquipment.status} onValueChange={(value: "available" | "maintenance" | "out-of-order") => setNewEquipment({...newEquipment, status: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out-of-order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={newEquipment.purchaseDate}
                    onChange={(e) => setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    className="bg-gray-700 border-gray-600"
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddEquipment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Add Equipment
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{equipmentStats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{equipmentStats.available}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{equipmentStats.maintenance}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Out of Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{equipmentStats.outOfOrder}</div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" />
              Equipment List ({filteredEquipment.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Location</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Purchase Date</TableHead>
                {(userProfile?.role === 'admin' || userProfile?.role === 'trainer') && (
                  <TableHead className="text-gray-400">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <TableRow key={item.id} className="border-gray-700">
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell className="text-gray-300">{item.type}</TableCell>
                    <TableCell className="text-gray-300">{item.location}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(item.status)}>
                        {item.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {item.purchaseDate ? new Date(item.purchaseDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    {(userProfile?.role === 'admin' || userProfile?.role === 'trainer') && (
                      <TableCell className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:bg-blue-500 hover:text-white"
                          onClick={() => {
                            setSelectedEquipment(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={() => item.id && handleDeleteEquipment(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    {searchTerm || statusFilter !== "all" ? 'No equipment found matching your criteria.' : 'No equipment found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Equipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Equipment Name</Label>
                <Input
                  id="edit-name"
                  value={selectedEquipment.name}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, name: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Input
                  id="edit-type"
                  value={selectedEquipment.type}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, type: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={selectedEquipment.location}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, location: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={selectedEquipment.status} onValueChange={(value: "available" | "maintenance" | "out-of-order") => setSelectedEquipment({...selectedEquipment, status: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-order">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={selectedEquipment.notes || ''}
                  onChange={(e) => setSelectedEquipment({...selectedEquipment, notes: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleEditEquipment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Update Equipment
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

export default ManageEquipment;