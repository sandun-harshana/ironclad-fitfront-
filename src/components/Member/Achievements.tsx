import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Award } from "lucide-react";

const Achievements = () => {
  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-gym-gold" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gym-gold rounded-full flex items-center justify-center">
              🔥
            </div>
            <div>
              <div className="text-white font-semibold">7-Day Streak</div>
              <div className="text-sm text-gray-400">Keep it up!</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gym-gold rounded-full flex items-center justify-center">
              💪
            </div>
            <div>
              <div className="text-white font-semibold">100 Workouts</div>
              <div className="text-sm text-gray-400">Milestone reached!</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;
