import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Edit, Trash2, Users } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import AddEquipmentDialog from './AddEquipmentDialog'

function EquipmentTable({equipment,
  isAddEquipmentOpen,
  setIsAddEquipmentOpen,
  newEquipment,
  setNewEquipment,
  handleAddEquipment,
  handleDeleteEquipment,}) {
  return (
    <>
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
          {equipment.slice(0, 5).map((item) => (
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
                    className="text-red-400 hover:bg-red-500 hover:text-black"
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
    </>

  )
}

export default EquipmentTable