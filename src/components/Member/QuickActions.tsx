import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Clock, User } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-gym-gold" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full border-gym-gray text-white hover:bg-gym-gray"
        >
          Book Personal Training
        </Button>
        <Button
          variant="outline"
          className="w-full border-gym-gray text-white hover:bg-gym-gray"
        >
          View Payment History
        </Button>
        <Button
          onClick={() => navigate("/member/profile")}
          variant="outline"
          className="w-full border-gym-gray text-white hover:bg-gym-gray flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Update Profile
        </Button>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
