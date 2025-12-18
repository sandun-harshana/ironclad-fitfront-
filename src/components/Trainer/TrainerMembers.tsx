import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Eye, 
  MessageCircle, 
  Calendar,
  Loader2,
  User,
  Phone,
  Mail,
  Target,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getUsersByRole, 
  getClassesByInstructor,
  UserProfile
} from "@/lib/firestore";

const TrainerMembers = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [trainerClasses, setTrainerClasses] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const [allMembers, classes] = await Promise.all([
        getUsersByRole('member'),
        getClassesByInstructor(currentUser.uid)
      ]);

      setMembers(allMembers as UserProfile[]);
      setTrainerClasses(classes);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load members data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMembershipBadge = (type?: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-purple-500 text-white">Premium</Badge>;
      case 'standard':
        return <Badge className="bg-blue-500 text-white">Standard</Badge>;
      case 'basic':
        return <Badge className="bg-green-500 text-white">Basic</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Basic</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-500 text-white">Active</Badge> : 
      <Badge className="bg-red-500 text-white">Inactive</Badge>;
  };

  const handleViewMember = (member: UserProfile) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Members</h1>
          <p className="text-gray-400">Manage and track your training members</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-white">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Members</p>
                <p className="text-2xl font-bold text-white">
                  {members.filter(m => m.isActive).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">My Classes</p>
                <p className="text-2xl font-bold text-white">{trainerClasses.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Premium Members</p>
                <p className="text-2xl font-bold text-white">
                  {members.filter(m => m.membershipType === 'premium').length}
                </p>
              </div>
              <User className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Members List ({filteredMembers.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white w-64"
                />
              </div>
              <Button onClick={fetchData} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
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
                  <TableHead className="text-gray-400">Member</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Membership</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Joined</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <TableRow key={member.uid} className="border-gray-700 hover:bg-gray-700/50">
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
                            <p className="text-xs text-gray-400">
                              {member.fitnessLevel || 'Beginner'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{member.email}</TableCell>
                      <TableCell>
                        {getMembershipBadge(member.membershipType)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member.isActive)}
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
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={() => handleViewMember(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        >
                          <MessageCircle className="h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                {selectedMember.photoURL && (
                  <img 
                    src={selectedMember.photoURL} 
                    alt={selectedMember.displayName} 
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedMember.displayName}</h3>
                  <p className="text-gray-400">{selectedMember.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getMembershipBadge(selectedMember.membershipType)}
                    {getStatusBadge(selectedMember.isActive)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{selectedMember.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Fitness Level</label>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-white capitalize">{selectedMember.fitnessLevel || 'Beginner'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Emergency Contact</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{selectedMember.emergencyContact || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Member Since</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-white">
                        {selectedMember.createdAt ? 
                          new Date(selectedMember.createdAt.seconds * 1000).toLocaleDateString() : 
                          'Unknown'
                        }
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Sessions Used</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="text-white">
                        {selectedMember.sessionsUsed || 0} / {selectedMember.totalSessions || 20}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{selectedMember.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals */}
              {selectedMember.goals && (
                <div>
                  <label className="text-sm text-gray-400">Fitness Goals</label>
                  <div className="mt-1 p-3 bg-gray-700 rounded-lg">
                    <p className="text-white">{selectedMember.goals}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerMembers;