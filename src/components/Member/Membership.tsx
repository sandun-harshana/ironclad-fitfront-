import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard, User } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

function Membership() {
  const [member] = useState({
    name: "Sarah Johnson",
    membershipType: "Premium",
    memberSince: "Jan 2022",
    status: "Active",
    expiryDate: "Dec 31, 2024",
  });
  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5 text-gym-gold" />
          Membership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Status</span>
          <Badge className="bg-gym-success text-white">{member.status}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Type</span>
          <Badge className="bg-gym-gold text-gym-dark">
            {member.membershipType}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Member Since</span>
          <span className="text-white">{member.memberSince}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Expires</span>
          <span className="text-white">{member.expiryDate}</span>
        </div>
        <Button className="w-full bg-gym-gold text-gym-dark hover:bg-gym-gold-light">
          <CreditCard className="h-4 w-4 mr-2" />
          Renew Membership
        </Button>
      </CardContent>
    </Card>
  );
}

export default Membership;
