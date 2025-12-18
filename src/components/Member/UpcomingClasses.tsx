import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

function UpcomingClasses() {
  const [upcomingClasses] = useState([
    {
      id: 1,
      name: "Morning Yoga",
      time: "08:00 AM",
      trainer: "Emma Davis",
      date: "Today",
    },
    {
      id: 2,
      name: "HIIT Training",
      time: "06:00 PM",
      trainer: "Mike Chen",
      date: "Today",
    },
    {
      id: 3,
      name: "Strength Training",
      time: "07:00 AM",
      trainer: "John Smith",
      date: "Tomorrow",
    },
  ]);
  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gym-gold" />
          Upcoming Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingClasses.map((class_) => (
            <div
              key={class_.id}
              className="flex items-center justify-between p-4 bg-gym-gray rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-white">{class_.name}</h4>
                <p className="text-sm text-gray-400">with {class_.trainer}</p>
              </div>
              <div className="text-right">
                <div className="text-gym-gold font-semibold">{class_.time}</div>
                <div className="text-sm text-gray-400">{class_.date}</div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/member/schedule" className="mt-4 block">
          <Button className="w-full bg-gym-gold text-gym-dark hover:bg-gym-gold-light">
            Book More Classes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default UpcomingClasses;
