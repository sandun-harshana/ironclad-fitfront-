import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle, X, Users, Calendar, Save, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAllClasses, getUsersByRole, GymClass } from "@/lib/firestore";
import { UserProfile } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id?: string;
  classId: string;
  className: string;
  memberId: string;
  memberName: string;
  trainerId: string;
  present: boolean;
  date: Timestamp;
  createdAt: Timestamp;
}

interface AttendanceMember {
  id: string;
  name: string;
  checked: boolean;
}

function Attendance() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [attendanceList, setAttendanceList] = useState<AttendanceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadMembersForClass();
    }
  }, [selectedClassId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classData, memberData] = await Promise.all([
        getAllClasses(),
        getUsersByRole('member')
      ]);
      
      setClasses(classData);
      setMembers(memberData as UserProfile[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMembersForClass = () => {
    // For now, we'll show all members. In a real app, you'd filter by class enrollment
    const memberList: AttendanceMember[] = members.map(member => ({
      id: member.uid,
      name: member.displayName || member.email || 'Unknown Member',
      checked: false
    }));
    setAttendanceList(memberList);
  };

  const handleAttendance = (memberId: string) => {
    setAttendanceList((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...member, checked: !member.checked }
          : member
      )
    );
  };

  const saveAttendance = async () => {
    if (!selectedClassId || !currentUser) {
      toast({
        title: "Error",
        description: "Please select a class and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Selected class not found",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const attendanceCollection = collection(db, 'attendance');
      const today = Timestamp.now();

      // Save attendance for each member
      const attendancePromises = attendanceList.map(member => {
        const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
          classId: selectedClassId,
          className: selectedClass.name,
          memberId: member.id,
          memberName: member.name,
          trainerId: currentUser.uid,
          present: member.checked,
          date: today,
          createdAt: today
        };

        return addDoc(attendanceCollection, attendanceRecord);
      });

      await Promise.all(attendancePromises);

      toast({
        title: "Attendance Saved",
        description: `Attendance recorded for ${attendanceList.length} members`,
      });

      // Reset the form
      setAttendanceList(prev => prev.map(member => ({ ...member, checked: false })));

    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = attendanceList.filter(member => member.checked).length;
  const totalCount = attendanceList.length;

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
          <span className="text-white">Loading attendance data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Class Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class Selection */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Select Class</label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Choose a class..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {classes.map((classItem) => (
                <SelectItem 
                  key={classItem.id} 
                  value={classItem.id!}
                  className="text-white hover:bg-gray-600"
                >
                  {classItem.name} - {classItem.startTime}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClassId && (
          <>
            {/* Attendance Summary */}
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-white">Present: {presentCount} / {totalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attendanceList.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <span className="text-white">{member.name}</span>
                  <button
                    onClick={() => handleAttendance(member.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      member.checked
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gray-600 border-2 border-gray-500 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    {member.checked ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {attendanceList.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No members found for this class</p>
              </div>
            )}

            {/* Save Button */}
            {attendanceList.length > 0 && (
              <Button
                onClick={saveAttendance}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Attendance
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {!selectedClassId && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Select a class to take attendance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Attendance;