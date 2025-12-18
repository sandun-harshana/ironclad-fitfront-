import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Save, X, User, Award, Calendar, Phone, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const TrainerProfile = () => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    specialization: "",
    experience: 0,
    certifications: [] as string[],
    bio: "",
    hourlyRate: 0,
    availability: "full-time" as "full-time" | "part-time" | "weekends"
  });

  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        specialization: userProfile.specialization || "",
        experience: userProfile.experience || 0,
        certifications: userProfile.certifications || [],
        bio: (userProfile as any).bio || "",
        hourlyRate: (userProfile as any).hourlyRate || 0,
        availability: (userProfile as any).availability || "full-time"
      });
    }
  }, [userProfile]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
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
      
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: formData.experience,
        certifications: formData.certifications,
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
        availability: formData.availability,
        updatedAt: new Date()
      });

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
        specialization: userProfile.specialization || "",
        experience: userProfile.experience || 0,
        certifications: userProfile.certifications || [],
        bio: (userProfile as any).bio || "",
        hourlyRate: (userProfile as any).hourlyRate || 0,
        availability: (userProfile as any).availability || "full-time"
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Trainer Profile</h1>
        <p className="text-gray-400">Manage your professional information and credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500 flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="displayName" className="text-white">Full Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
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
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="availability" className="text-white">Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(val) => handleChange("availability", val)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="full-time" className="text-white hover:bg-gray-600">Full-time</SelectItem>
                  <SelectItem value="part-time" className="text-white hover:bg-gray-600">Part-time</SelectItem>
                  <SelectItem value="weekends" className="text-white hover:bg-gray-600">Weekends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="specialization" className="text-white">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleChange("specialization", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., Strength Training, Yoga, HIIT"
                />
              </div>
              <div>
                <Label htmlFor="experience" className="text-white">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", parseInt(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hourlyRate" className="text-white">Hourly Rate (Rs.)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => handleChange("hourlyRate", parseFloat(e.target.value) || 0)}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
                step="1"
                placeholder="16500"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-white">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
                placeholder="Tell members about your training philosophy, experience, and what makes you unique..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Add a certification (e.g., NASM-CPT, ACE, ACSM)"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCertification())}
              />
              <Button
                type="button"
                onClick={handleAddCertification}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, index) => (
                <Badge
                  key={index}
                  className="bg-blue-600 text-white flex items-center gap-1 px-3 py-1"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(cert)}
                    className="ml-1 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {formData.certifications.length === 0 && (
              <p className="text-gray-400 text-sm">No certifications added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-500 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white">Account Status:</span>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Member Since:</span>
              <span className="text-gray-300">
                {userProfile?.createdAt ? 
                  new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : 
                  'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Role:</span>
              <Badge className="bg-purple-500 text-white">Trainer</Badge>
            </div>
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

export default TrainerProfile;