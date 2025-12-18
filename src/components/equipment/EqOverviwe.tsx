/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3, Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "react-day-picker";


const EquipmentOverview = ({
  equipment,
  isAddEquipmentOpen,
  setIsAddEquipmentOpen,
}: any) => {
  <EquipmentOverview
            equipment={equipment}
            isAddEquipmentOpen={isAddEquipmentOpen}
            setIsAddEquipmentOpen={setIsAddEquipmentOpen}
          />
  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gym-gold" />
          Items Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {equipment.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gym-gray rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-gray">{item.name}</h4>
                <p className="text-sm text-gray-400">{item.type}</p>
                <p className="text-sm text-gray-400">{item.status}</p>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isAddEquipmentOpen} onOpenChange={setIsAddEquipmentOpen}>
          <DialogTrigger asChild>
          </DialogTrigger>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EquipmentOverview;
