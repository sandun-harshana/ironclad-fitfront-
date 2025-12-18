import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

function AddEquipmentDialog({ isOpen,
  setIsOpen,
  newEquipment,
  setNewEquipment,
  handleAddEquipment,}) {
  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button className="bg-gym-gold text-gym-dark hover:bg-gym-gold-light">
        <Plus className="h-4 w-4 mr-2" />
        Add Equipment
      </Button>
    </DialogTrigger>
    <DialogContent className="bg-gym-darker border-gym-gray">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white">Full Name</Label>
          <Input
            id="name"
            value={newEquipment.name}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, name: e.target.value })
            }
            className="bg-gym-gray border-gym-gray text-white"
            placeholder="Enter equipment name"
          />
        </div>
        <div>
          <Label htmlFor="type" className="text-white">Equipment Type</Label>
          <Input
            id="type"
            value={newEquipment.type}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, type: e.target.value })
            }
            className="bg-gym-gray border-gym-gray text-white"
            placeholder="Enter equipment type"
          />
        </div>
        <div>
          <Label htmlFor="status" className="text-white">Status</Label>
          <Input
            id="status"
            value={newEquipment.status}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, status: e.target.value })
            }
            className="bg-gym-gray border-gym-gray text-white"
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
    </>
  )
}

export default AddEquipmentDialog