/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Badge, Edit, Table, Trash2, Users } from "lucide-react";
import { Plus } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const EqManage = () => {
const AddEquipmentDialog = ({
  isOpen,
  setIsOpen,
  newEquipment,
  setNewEquipment,
  handleAddEquipment,
}: any) => (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button className="bg-gym-gold text-gym-dark hover:bg-gym-gold-light">
        <Plus className="h-4 w-4 mr-2" />
        Add Equipment
      </Button>
    </DialogTrigger>
    <DialogContent className="bg-gym-darker border-gym-gray">
      <DialogHeader>
        <DialogTitle className="text-white">Add New Equipment</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white">
            Equipment
          </Label>
          <Input
            id="name"
            value={newEquipment.name}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, name: e.target.value })
            }
            className="bg-gym-gray border-gym-gray text-black"
            placeholder="Enter equipment name"
          />
        </div>
        <div>
          <Label htmlFor="type" className="text-white">
            Equipment Type
          </Label>
          <Input
            id="type"
            value={newEquipment.type}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, type: e.target.value })
            }
            className="bg-gym-gray border-gym-gray text-black"
            placeholder="Enter equipment type"
          />
        </div>
        <div>
          <Label htmlFor="status" className="text-white">
            Status
          </Label>
          <Input
            id="status"
            value={newEquipment.status}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, status: e.target.value })
            }
            className="bg-gym-gray border-gym-gray text-black"
            placeholder="Enter equipment status"
          />
        </div>
        <Button
          onClick={handleAddEquipment}
          className="w-full bg-gym-gold text-gym-dark hover:bg-gym-gold-light"
        >
          Add Equipment
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

const EquipmentTable = ({
  equipment,
  isAddEquipmentOpen,
  setIsAddEquipmentOpen,
  newEquipment,
  setNewEquipment,
  handleAddEquipment,
  handleDeleteEquipment,
}: any) => {
  return (
    <Card className="bg-black border-gym-gray">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-gym-gold" />
          Equipment Management
        </CardTitle>

        <AddEquipmentDialog
          isOpen={isAddEquipmentOpen}
          setIsOpen={setIsAddEquipmentOpen}
          newEquipment={newEquipment}
          setNewEquipment={setNewEquipment}
          handleAddEquipment={handleAddEquipment}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gym-gray">
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.slice(0, 5).map((item: any) => (
              <TableRow key={item.id} className="border-gym-gray">
                <TableCell className="text-white">{item.name}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      item.type === "Premium"
                        ? "bg-gym-gold text-gym-dark"
                        : "bg-gym-gray text-white"
                    }
                  >
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      item.status === "Active"
                        ? "bg-gym-success text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gym-gold hover:bg-gym-gold hover:text-gym-dark"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeleteEquipment(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
}
export default EqManage;
