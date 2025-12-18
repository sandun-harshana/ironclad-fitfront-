import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const QuickAction = () => {
  return (
    <div className="mt-8">
      <Card className="bg-card border-gym-gray">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button className="bg-gym-gold text-gym-dark hover:bg-gym-gold-light">
              Generate Reports
            </Button>
            <Button
              variant="outline"
              className="border-gym-gray text-white hover:bg-gym-gray"
            >
              Manage Equipment
            </Button>
            <Button
              variant="outline"
              className="border-gym-gray text-white hover:bg-gym-gray"
            >
              View Payments
            </Button>
            <Button
              variant="outline"
              className="border-gym-gray text-white hover:bg-gym-gray"
            >
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAction;
