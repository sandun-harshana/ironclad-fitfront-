import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Hammer, Settings, TrendingUp, Users } from "lucide-react";
import { Badge } from "../ui/badge";

function EqHeader() {
  const [stats] = useState({
    totalEquipment: 440,
    activeEquipment: 240,
    equipmentRepair: 120,
    equipmentReplacement: 80,
  });
  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Equipment */}
        <Card className="bg-card border-gym-gray">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Equipment</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalEquipment}
              </p>
              <Badge className="bg-gym-success text-white text-xs">
                +12 this month
              </Badge>
            </div>
            <Users className="h-8 w-8 text-gym-gold" />
          </CardContent>
        </Card>

        {/* Active Equipment */}
        <Card className="bg-card border-gym-gray">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Equipment</p>
              <p className="text-2xl font-bold text-white">
                {stats.activeEquipment}
              </p>
              <Badge className="bg-gym-success text-white text-xs">
                +5 this month
              </Badge>
            </div>
            <TrendingUp className="h-8 w-8 text-gym-gold" />
          </CardContent>
        </Card>

        {/* Equipment Repair */}
        <Card className="bg-card border-gym-gray">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Equipment Repair</p>
              <p className="text-2xl font-bold text-white">
                {stats.equipmentRepair.toLocaleString()}
              </p>
              <Badge className="bg-gym-gold text-gym-dark text-xs">
                Equipment Repair
              </Badge>
            </div>
            <Settings className="h-8 w-8 text-gym-gold" />
          </CardContent>
        </Card>

        {/* Equipment Replacement */}
        <Card className="bg-card border-gym-gray">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Equipment Replacement</p>
              <p className="text-2xl font-bold text-white">
                {stats.equipmentReplacement.toLocaleString()}
              </p>
              <Badge className="bg-gym-gold text-gym-dark text-xs">
                Equipment Replacement
              </Badge>
            </div>
            <Hammer className="h-8 w-8 text-gym-gold" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default EqHeader;
