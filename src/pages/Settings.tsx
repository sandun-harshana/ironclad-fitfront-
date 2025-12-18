import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Palette,
  Save,
  Sun,
  Moon,
  Mail,
  MessageCircle,
} from "lucide-react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSaveProfile = () => {
    console.log({ fullName, email, password });
  };

  const handleSavePreferences = () => {
    console.log({ darkMode, emailNotif, smsNotif });
  };

  const inputClass = "bg-gym-dark text-white";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="h-7 w-7 text-gym-gold" /> Settings
      </h1>

      {/* Theme Settings */}
      <Card className="bg-card border-gym-gray">
        <CardHeader>
          <CardTitle className="text-gym-gold flex items-center gap-2">
            <Palette size={20} /> Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-white">Dark Mode</p>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-gym-gold"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            {darkMode ? "Enabled" : "Disabled"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-card border-gym-gray">
        <CardHeader>
          <CardTitle className="text-gym-gold flex items-center gap-2">
            <Bell size={20} /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Email Notifications</span>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:text-gym-gold"
              onClick={() => setEmailNotif(!emailNotif)}
            >
              <Mail size={16} />
              {emailNotif ? "On" : "Off"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">SMS Notifications</span>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:text-gym-gold"
              onClick={() => setSmsNotif(!smsNotif)}
            >
              <MessageCircle size={16} />
              {smsNotif ? "On" : "Off"}
            </Button>
          </div>
          <Button
            className="bg-gym-gold text-gym-dark hover:bg-gym-dark hover:text-gym-gold flex items-center gap-2"
            onClick={handleSavePreferences}
          >
            <Save size={16} /> Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
