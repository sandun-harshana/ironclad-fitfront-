import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function Classes() {
  const [todayClasses, setTodayClasses] = useState([
    {
      id: 1,
      name: "Morning HIIT",
      time: "7:00 AM",
      duration: "45 min",
      enrolled: 12,
      maxCapacity: 15,
      status: "upcoming",
    },
    {
      id: 2,
      name: "Strength Training",
      time: "10:00 AM",
      duration: "60 min",
      enrolled: 8,
      maxCapacity: 10,
      status: "ongoing",
    },
    {
      id: 3,
      name: "Evening HIIT",
      time: "6:00 PM",
      duration: "45 min",
      enrolled: 15,
      maxCapacity: 15,
      status: "upcoming",
    },
  ]);

  const { toast } = useToast();
  const [editingClass, setEditingClass] = useState<any | null>(null);

  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return new Date(0, 0, 0, hours, minutes).getTime();
  };

  const sortedClasses = [...todayClasses].sort(
    (a, b) => parseTime(a.time) - parseTime(b.time)
  );

  const markClassComplete = (classId: number) => {
    setTodayClasses(
      todayClasses.map((class_) =>
        class_.id === classId ? { ...class_, status: "completed" } : class_
      )
    );
    toast({
      title: "Class Completed",
      description: "Class has been marked as completed",
    });
  };

  const saveEditedClass = () => {
    if (!editingClass) return;
    setTodayClasses(
      todayClasses.map((c) => (c.id === editingClass.id ? editingClass : c))
    );
    toast({
      title: "Class Updated",
      description: `${editingClass.name} has been updated successfully`,
    });
    setEditingClass(null);
  };

  return (
    <>
      <Card className="bg-card border-gym-gray">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gym-gold" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedClasses.map((class_) => (
              <div key={class_.id} className="p-4 bg-gym-gray rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-white">{class_.name}</h4>
                    <p className="text-sm text-gray-400">
                      {class_.time} • {class_.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        class_.status === "completed"
                          ? "bg-gym-success text-white"
                          : class_.status === "ongoing"
                          ? "bg-gym-gold text-gym-dark"
                          : "bg-gym-gray text-white"
                      }
                    >
                      {class_.status}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gym-gold hover:text-gym-gold-light"
                      onClick={() => setEditingClass({ ...class_ })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {class_.enrolled}/{class_.maxCapacity} enrolled
                  </span>
                  {class_.status !== "completed" && (
                    <Button
                      size="sm"
                      className="bg-gym-gold text-gym-dark hover:bg-gym-gold-light"
                      onClick={() => markClassComplete(class_.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
        <DialogContent className="bg-gym-dark text-white">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          {editingClass && (
            <div className="space-y-3">
              {/* Name */}
              <Input
                className="text-white placeholder-gray-400 bg-gym-gray border-gray-600"
                value={editingClass.name}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, name: e.target.value })
                }
                placeholder="Class name"
              />

              {/* Time Inputs */}
              <div className="flex gap-2 items-center">
                {/* Hours */}
                <Input
                  type="number"
                  min={1}
                  max={12}
                  className="w-20 text-black bg-white border-gray-600"
                  value={editingClass.time.split(":")[0]}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val < 1) val = 1;
                    if (val > 12) val = 12;
                    const [, minutesAndModifier] = editingClass.time.split(":");
                    setEditingClass({
                      ...editingClass,
                      time: `${val}:${minutesAndModifier}`,
                    });
                  }}
                />

                <span className="text-white">:</span>

                {/* Minutes */}
                <Input
                  type="number"
                  min={0}
                  max={59}
                  className="w-20 text-black bg-white border-gray-600"
                  value={editingClass.time.split(":")[1].split(" ")[0]}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val < 0) val = 0;
                    if (val > 59) val = 59;
                    const [hours, minutesAndModifier] = editingClass.time.split(":");
                    const [, modifier] = minutesAndModifier.split(" ");
                    setEditingClass({
                      ...editingClass,
                      time: `${hours}:${val} ${modifier}`,
                    });
                  }}
                />

                {/* AM/PM */}
                <Select
                  value={editingClass.time.split(" ")[1]}
                  onValueChange={(val) => {
                    const [hours, minutesAndModifier] = editingClass.time.split(":");
                    const [minutes] = minutesAndModifier.split(" ");
                    setEditingClass({ ...editingClass, time: `${hours}:${minutes} ${val}` });
                  }}
                >
                  <SelectTrigger className="w-20 bg-white text-black border-gray-600">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent className="bg-gym-dark text-white">
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Picker */}
              <Select
                value={editingClass.status}
                onValueChange={(val) =>
                  setEditingClass({ ...editingClass, status: val })
                }
              >
                <SelectTrigger className="w-40 bg-white text-black border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gym-dark text-white">
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Duration */}
              <Input
                className="text-white placeholder-gray-400 bg-gym-gray border-gray-600"
                value={editingClass.duration}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    duration: e.target.value,
                  })
                }
                placeholder="Duration (e.g. 45 min)"
              />

              {/* Max Capacity */}
              <Input
                className="text-white placeholder-gray-400 bg-gym-gray border-gray-600"
                type="number"
                value={editingClass.maxCapacity}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    maxCapacity: Number(e.target.value),
                  })
                }
                placeholder="Max capacity"
              />
            </div>
          )}
          <DialogFooter className="mt-4 flex justify-end gap-2 text-white">
            <Button
              variant="outline"
              onClick={() => setEditingClass(null)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button onClick={saveEditedClass} className="text-white">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Classes;
