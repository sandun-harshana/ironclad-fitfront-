import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, X } from "lucide-react";

const MemberProfile = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    birthday: "",
    emergencyContact: "",
    goals: "",
    membershipType: "basic",
    address: "",
    fitnessLevel: "beginner"
  });

  const [membershipInfo, setMembershipInfo] = useState({
    status: "Active",
    renewalDate: "2025-10-01",
    joinDate: "",
    sessionsUsed: 0,
    totalSessions: 20,
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        birthday: userProfile.birthday || "",
        emergencyContact: userProfile.emergencyContact || "",
        goals: userProfile.goals || "",
        membershipType: userProfile.membershipType || "basic",
        address: userProfile.address || "",
        fitnessLevel: userProfile.fitnessLevel || "beginner"
      });

      setMembershipInfo({
        status: userProfile.membershipStatus || "active",
        renewalDate: userProfile.renewalDate || "2025-10-01",
        joinDate: userProfile.joinDate ? new Date(userProfile.joinDate.seconds * 1000).toLocaleDateString() : "",
        sessionsUsed: userProfile.sessionsUsed || 0,
        totalSessions: userProfile.totalSessions || 20,
      });
    }
  }, [userProfile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Update user document in Firestore
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        birthday: formData.birthday,
        emergencyContact: formData.emergencyContact,
        goals: formData.goals,
        membershipType: formData.membershipType,
        address: formData.address,
        fitnessLevel: formData.fitnessLevel,
        updatedAt: new Date()
      });

      // Refresh user profile in context
      await refreshUserProfile();

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        birthday: userProfile.birthday || "",
        emergencyContact: userProfile.emergencyContact || "",
        goals: userProfile.goals || "",
        membershipType: userProfile.membershipType || "basic",
        address: userProfile.address || "",
        fitnessLevel: userProfile.fitnessLevel || "beginner"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Update Your Profile</h1>
        <p className="text-gray-400">Keep your information up-to-date for the best experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="displayName" className="text-white">Full Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="John Doe"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="bg-gray-600 border-gray-500 text-gray-300"
                title="Email cannot be changed"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="birthday" className="text-white">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address" className="text-white">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main St, City, State 12345"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="emergencyContact" className="text-white">Contact Name & Phone</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              placeholder="Jane Doe - +1 (555) 234-5678"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </CardContent>
        </Card>

        {/* Fitness Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500">Fitness Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fitnessLevel" className="text-white">Fitness Level</Label>
              <Select
                value={formData.fitnessLevel}
                onValueChange={(val) => handleChange("fitnessLevel", val)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="beginner" className="text-white hover:bg-gray-600">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-white hover:bg-gray-600">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-white hover:bg-gray-600">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goals" className="text-white">Fitness Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleChange("goals", e.target.value)}
                placeholder="E.g., Build muscle, lose weight, improve endurance..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Membership Plan */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500">Membership Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="membershipType" className="text-white">Plan Type</Label>
            <Select
              value={formData.membershipType}
              onValueChange={(val) => handleChange("membershipType", val)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="basic" className="text-white hover:bg-gray-600">Basic – Access to gym equipment</SelectItem>
                <SelectItem value="standard" className="text-white hover:bg-gray-600">Standard – Includes classes</SelectItem>
                <SelectItem value="premium" className="text-white hover:bg-gray-600">Premium – Classes + Personal Trainer</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Current Membership Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500">Current Membership Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-white">Status: <span className="text-green-500 font-semibold">{membershipInfo.status}</span></p>
            <p className="text-white">Member Since: <span className="text-gray-300">{membershipInfo.joinDate || 'N/A'}</span></p>
            <p className="text-white">Renewal Date: <span className="text-gray-300">{membershipInfo.renewalDate}</span></p>
            <p className="text-white">
              Sessions Used: <span className="text-gray-300">{membershipInfo.sessionsUsed} / {membershipInfo.totalSessions}</span>
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MemberProfile;