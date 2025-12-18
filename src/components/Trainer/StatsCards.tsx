import {
  Star,
  Calendar,
  Users,
  Clock,
  Pencil,
  Trash,
  Plus,
  Check,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type CardType = {
  id: number;
  label: string;
  value: string;
  icon: React.ReactNode;
  badge: { text: string; color: string };
};

function StatsCards() {
  const [cards, setCards] = useState<CardType[]>([
    {
      id: 1,
      label: "Rating",
      value: "4.9",
      icon: <Star className="h-8 w-8 text-gym-gold" />,
      badge: { text: "Excellent", color: "bg-gym-gold text-gym-dark" },
    },
    {
      id: 2,
      label: "Total Classes",
      value: "247",
      icon: <Calendar className="h-8 w-8 text-gym-gold" />,
      badge: { text: "+5 this week", color: "bg-gym-success text-white" },
    },
    {
      id: 3,
      label: "Active Members",
      value: "42",
      icon: <Users className="h-8 w-8 text-gym-gold" />,
      badge: { text: "+3 this month", color: "bg-gym-success text-white" },
    },
    {
      id: 4,
      label: "Today's Classes",
      value: "3",
      icon: <Clock className="h-8 w-8 text-gym-gold" />,
      badge: { text: "All scheduled", color: "bg-gym-gold text-gym-dark" },
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ label: string; value: string; badge: string }>({
    label: "",
    value: "",
    badge: "",
  });

  // Start editing
  const handleEdit = (card: CardType) => {
    setEditingId(card.id);
    setEditData({ label: card.label, value: card.value, badge: card.badge.text });
  };

  // Save edits
  const handleSave = (id: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, label: editData.label, value: editData.value, badge: { ...c.badge, text: editData.badge } } : c
      )
    );
    setEditingId(null);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({ label: "", value: "", badge: "" });
  };

  // Delete card
  const handleDelete = (id: number) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Add new card
  const handleAdd = () => {
    const id = Date.now();
    setCards((prev) => [
      ...prev,
      {
        id,
        label: "New Stat",
        value: "0",
        icon: <Star className="h-8 w-8 text-gym-gold" />,
        badge: { text: "New", color: "bg-gym-gold text-gym-dark" },
      },
    ]);
    setEditingId(id);
    setEditData({ label: "New Stat", value: "0", badge: "New" });
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.id} className="bg-card border-gym-gray relative">
          <CardContent className="p-6">
            {editingId === card.id ? (
              <div>
                <Input
                  placeholder="Label"
                  value={editData.label}
                  onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="Value"
                  value={editData.value}
                  onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                  className="mb-2"
                />
                <Input
                  placeholder="Badge text"
                  value={editData.badge}
                  onChange={(e) => setEditData({ ...editData, badge: e.target.value })}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gym-success text-white"
                    onClick={() => handleSave(card.id)}
                  >
                    <Check size={14} className="mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleCancel}>
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                  </div>
                  {card.icon}
                </div>
                <div className="mt-2">
                  <Badge className={`${card.badge.color} text-xs`}>{card.badge.text}</Badge>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="bg-gym-gold text-gym-dark" onClick={() => handleEdit(card)}>
                    <Pencil size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(card.id)}>
                    <Trash size={14} className="mr-1" /> Delete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add New Card */}
      <Card
        className="bg-gym-dark border-dashed border-2 border-gym-gold flex items-center justify-center cursor-pointer hover:bg-gym-gray"
        onClick={handleAdd}
      >
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Plus className="h-10 w-10 text-gym-gold mb-2" />
          <p className="text-white font-semibold">Add Card</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsCards;
