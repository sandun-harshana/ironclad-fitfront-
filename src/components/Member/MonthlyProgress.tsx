import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Target } from "lucide-react";
import { Progress } from "@radix-ui/react-progress";

const MonthlyProgress = () => {
  const [workoutStats] = useState({
    totalWorkouts: 142,
    currentStreak: 7,
    monthlyGoal: 20,
    completed: 15,
  });

  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-gym-gold" />
          Monthly Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Workouts this month</span>
            <span className="text-gym-gold font-semibold">
              {workoutStats.completed}/{workoutStats.monthlyGoal}
            </span>
          </div>
          <Progress
            value={(workoutStats.completed / workoutStats.monthlyGoal) * 100}
            className="h-2"
          />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gym-gold">
                {workoutStats.totalWorkouts}
              </div>
              <div className="text-sm text-gray-400">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gym-gold">
                {workoutStats.currentStreak}
              </div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gym-gold">
                {Math.round(
                  (workoutStats.completed / workoutStats.monthlyGoal) * 100
                )}
                %
              </div>
              <div className="text-sm text-gray-400">Goal Progress</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyProgress;
