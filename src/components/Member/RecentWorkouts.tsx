import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";

function RecentWorkouts() {
  const [recentWorkouts] = useState([
    { date: "2024-01-25", type: "Cardio", duration: "45 min", calories: 320 },
    { date: "2024-01-24", type: "Strength", duration: "60 min", calories: 280 },
    { date: "2024-01-23", type: "Yoga", duration: "30 min", calories: 150 },
  ]);
  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gym-gold" />
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentWorkouts.map((workout, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gym-gray rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gym-success" />
                <div>
                  <div className="font-semibold text-white">{workout.type}</div>
                  <div className="text-sm text-gray-400">{workout.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gym-gold font-semibold">
                  {workout.duration}
                </div>
                <div className="text-sm text-gray-400">
                  {workout.calories} cal
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentWorkouts;
