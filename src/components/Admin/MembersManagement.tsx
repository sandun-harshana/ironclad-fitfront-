import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Edit, Plus, Trash2, Users, Check, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, getUsersByRole, deleteUser } from "@/lib/firestore";
import { UserProfile } from "@/contexts/AuthContext";

function MembersManagement() {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { updateUserRole } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setMembers(allUsers as UserProfile[]);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'member' | 'trainer') => {
    try {
      await updateUserRole(userId, newRole);
      await fetchMembers(); // Refresh the list
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleStatusToggle = async (member: UserProfile) => {
    // In a real app, you'd update the user's active status in Firestore
    // For now, we'll just show a toast
    toast({
      title: "Info",
      description: "Status toggle functionality would be implemented here",
    });
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      setDeleting(true);
      await deleteUser(memberToDelete.uid);
      await fetchMembers();
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
      toast({
        title: "Success",
        description: `Member ${memberToDelete.displayName} has been deleted successfully!`,
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteConfirm = (member: UserProfile) => {
    setMemberToDelete(member);
    setDeleteConfirmOpen(true);
  };

  // Filter members by search term
  const filteredMembers = members.filter(member =>
    member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'trainer':
        return 'bg-green-600 text-white';
      case 'member':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Member Management List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Members Management ({filteredMembers.length} users)
          </CardTitle>

          {/* Search */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              onClick={fetchMembers}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.uid} className="border-gray-700">
                    <TableCell className="text-white">
                      <div className="flex items-center gap-3">
                        {member.photoURL && (
                          <img 
                            src={member.photoURL} 
                            alt={member.displayName} 
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{member.displayName || 'No Name'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{member.email}</TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value: 'admin' | 'member' | 'trainer') => 
                          handleRoleUpdate(member.uid, value)
                        }
                      >
                        <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="admin" className="text-white hover:bg-gray-600">
                            Admin
                          </SelectItem>
                          <SelectItem value="member" className="text-white hover:bg-gray-600">
                            Member
                          </SelectItem>
                          <SelectItem value="trainer" className="text-white hover:bg-gray-600">
                            Trainer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(member.isActive)}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {member.createdAt ? 
                        new Date(member.createdAt.seconds * 1000).toLocaleDateString() : 
                        'Unknown'
                      }
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-500 hover:text-white"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowForm(true);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-yellow-400 hover:bg-yellow-500 hover:text-white"
                        onClick={() => handleStatusToggle(member)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500 hover:text-white"
                        onClick={() => openDeleteConfirm(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    {searchTerm ? 'No members found matching your search.' : 'No members found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Member Details Modal/Form */}
      {showForm && selectedMember && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Member Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input
                  value={selectedMember.displayName || ''}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Email</Label>
                <Input
                  value={selectedMember.email || ''}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Role</Label>
                <Input
                  value={selectedMember.role}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white capitalize"
                />
              </div>
              <div>
                <Label className="text-white">Status</Label>
                <Input
                  value={selectedMember.isActive ? 'Active' : 'Inactive'}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              {selectedMember.membershipType && (
                <div>
                  <Label className="text-white">Membership Type</Label>
                  <Input
                    value={selectedMember.membershipType}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white capitalize"
                  />
                </div>
              )}
              {selectedMember.specialization && (
                <div>
                  <Label className="text-white">Specialization</Label>
                  <Input
                    value={selectedMember.specialization}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setShowForm(false);
                  setSelectedMember(null);
                  setIsEditing(false);
                }}
                className="w-full bg-gray-600 text-white hover:bg-gray-700"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              Are you sure you want to delete <span className="font-bold text-white">{memberToDelete?.displayName}</span>? This action cannot be undone.
            </p>
            <div className="bg-red-500/20 border border-red-500 rounded p-3">
              <p className="text-red-300 text-sm">
                <strong>Warning:</strong> This will permanently delete this member and all associated data.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleDeleteMember}
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
                    Delete Member
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setMemberToDelete(null);
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
}

export default MembersManagement;