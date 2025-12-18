import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUsersByRole, deleteUser } from "@/lib/firestore";
import { UserProfile } from "@/contexts/AuthContext";
import { Plus, Trash2, Edit, Check, Search, Users, Star, Dumbbell, Loader2, AlertCircle } from "lucide-react";

const TrainerOverview = () => {
  const { toast } = useToast();
  const { updateUserRole } = useAuth();
  const [trainers, setTrainers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const trainerData = await getUsersByRole('trainer');
      setTrainers(trainerData as UserProfile[]);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast({
        title: "Error",
        description: "Failed to load trainers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member' | 'trainer') => {
    try {
      await updateUserRole(userId, newRole);
      await fetchTrainers(); // Refresh the list
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTrainer = async () => {
    if (!trainerToDelete) return;

    try {
      setDeleting(true);
      await deleteUser(trainerToDelete.uid);
      await fetchTrainers();
      setDeleteConfirmOpen(false);
      setTrainerToDelete(null);
      toast({
        title: "Success",
        description: `Trainer ${trainerToDelete.displayName} has been deleted successfully!`,
      });
    } catch (error) {
      console.error('Error deleting trainer:', error);
      toast({
        title: "Error",
        description: "Failed to delete trainer",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteConfirm = (trainer: UserProfile) => {
    setTrainerToDelete(trainer);
    setDeleteConfirmOpen(true);
  };

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExperienceBadge = (experience?: number) => {
    if (!experience) return <Badge className="bg-gray-500 text-white">New</Badge>;
    if (experience < 2) return <Badge className="bg-green-500 text-white">Junior</Badge>;
    if (experience < 5) return <Badge className="bg-blue-500 text-white">Senior</Badge>;
    return <Badge className="bg-purple-500 text-white">Expert</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-500 text-white">Active</Badge> : 
      <Badge className="bg-red-500 text-white">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading trainers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trainer Management</h1>
          <p className="text-gray-400">Manage gym trainers and their information</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Trainers</p>
                <p className="text-2xl font-bold text-white">{trainers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Trainers</p>
                <p className="text-2xl font-bold text-white">
                  {trainers.filter(t => t.isActive).length}
                </p>
              </div>
              <Dumbbell className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Specializations</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(trainers.map(t => t.specialization).filter(Boolean)).size}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Experience</p>
                <p className="text-2xl font-bold text-white">
                  {trainers.length > 0 ? 
                    Math.round(trainers.reduce((sum, t) => sum + (t.experience || 0), 0) / trainers.length) : 0
                  } yrs
                </p>
              </div>
              <Edit className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainers Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Trainers List ({filteredTrainers.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trainers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white w-64"
                />
              </div>
              <Button onClick={fetchTrainers} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
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
                  <TableHead className="text-gray-400">Trainer</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Specialization</TableHead>
                  <TableHead className="text-gray-400">Experience</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Joined</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.length > 0 ? (
                  filteredTrainers.map((trainer) => (
                    <TableRow key={trainer.uid} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-3">
                          {trainer.photoURL && (
                            <img 
                              src={trainer.photoURL} 
                              alt={trainer.displayName} 
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium">{trainer.displayName || 'No Name'}</p>
                            {trainer.certifications && trainer.certifications.length > 0 && (
                              <p className="text-xs text-gray-400">
                                {trainer.certifications.slice(0, 2).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{trainer.email}</TableCell>
                      <TableCell className="text-gray-300">
                        {trainer.specialization || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        {getExperienceBadge(trainer.experience)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(trainer.isActive)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {trainer.createdAt ? 
                          new Date(trainer.createdAt.seconds * 1000).toLocaleDateString() : 
                          'Unknown'
                        }
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:bg-blue-500 hover:text-white"
                          onClick={() => {
                            setSelectedTrainer(trainer);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={() => openDeleteConfirm(trainer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Select
                          value={trainer.role}
                          onValueChange={(value: 'admin' | 'member' | 'trainer') => 
                            handleRoleChange(trainer.uid, value)
                          }
                        >
                          <SelectTrigger className="w-24 h-8 bg-gray-700 border-gray-600 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="admin" className="text-white hover:bg-gray-600 text-xs">Admin</SelectItem>
                            <SelectItem value="member" className="text-white hover:bg-gray-600 text-xs">Member</SelectItem>
                            <SelectItem value="trainer" className="text-white hover:bg-gray-600 text-xs">Trainer</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                      {searchTerm ? 'No trainers found matching your search.' : 'No trainers found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trainer Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trainer Details</DialogTitle>
          </DialogHeader>
          {selectedTrainer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Name</Label>
                  <Input
                    value={selectedTrainer.displayName || ''}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    value={selectedTrainer.email || ''}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Role</Label>
                  <Input
                    value={selectedTrainer.role}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white capitalize"
                  />
                </div>
                <div>
                  <Label className="text-white">Status</Label>
                  <Input
                    value={selectedTrainer.isActive ? 'Active' : 'Inactive'}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Specialization</Label>
                  <Input
                    value={selectedTrainer.specialization || 'Not specified'}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Experience</Label>
                  <Input
                    value={selectedTrainer.experience ? `${selectedTrainer.experience} years` : 'Not specified'}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              {selectedTrainer.certifications && selectedTrainer.certifications.length > 0 && (
                <div>
                  <Label className="text-white">Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTrainer.certifications.map((cert, index) => (
                      <Badge key={index} className="bg-blue-600 text-white">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedTrainer(null);
                  }}
                  className="w-full bg-gray-600 text-white hover:bg-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{trainerToDelete?.displayName}</span>? This action cannot be undone.
            </p>
            <div className="bg-red-500/20 border border-red-500 rounded p-3">
              <p className="text-red-300 text-sm">
                <strong>Warning:</strong> This will permanently delete this trainer and all associated data.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleDeleteTrainer}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Trainer
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setTrainerToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerOverview;