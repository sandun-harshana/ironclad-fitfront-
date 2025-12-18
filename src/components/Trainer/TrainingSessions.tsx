import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { TrendingUp, Plus } from "lucide-react";

interface Session {
  id: number;
  member: string;
  time: string;
  type: string;
  status: "confirmed" | "pending";
}

function TrainingSessions() {
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, member: "David Brown", time: "02:00 PM", type: "Weight Loss", status: "confirmed" },
    { id: 2, member: "Anna Wilson", time: "04:00 PM", type: "Muscle Building", status: "pending" },
    { id: 3, member: "Tom Garcia", time: "05:00 PM", type: "Rehabilitation", status: "confirmed" },
  ]);

  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    member: "",
    time: "",
    type: "",
    status: "pending" as "pending" | "confirmed",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new session
  const handleAdd = () => {
    const newSession: Session = {
      id: sessions.length ? sessions[sessions.length - 1].id + 1 : 1,
      ...formData,
    };
    setSessions([...sessions, newSession]);
    setFormData({ member: "", time: "", type: "", status: "pending" });
  };

  // Start editing a session
  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setFormData({ ...session });
  };

  // Save edits
  const handleSave = () => {
    if (!editingSession) return;
    setSessions(
      sessions.map((s) => (s.id === editingSession.id ? { ...editingSession, ...formData } : s))
    );
    setEditingSession(null);
    setFormData({ member: "", time: "", type: "", status: "pending" });
  };

  return (
    <Card className="bg-card border-gym-gray lg:col-span-2">
      <CardHeader className="flex justify-between items-left">
        <CardTitle className="text-white flex items-left gap-2">
          <TrendingUp className="h-5 w-5 text-gym-gold" />
          Personal Training Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form for editing or adding */}
        <div className="mb-4 flex flex-col md:flex-row gap-2">
          <input
            type="text"
            name="member"
            placeholder="Member Name"
            className="p-2 rounded-md border border-gray-600 text-black"
            value={formData.member}
            onChange={handleChange}
          />
          <input
            type="text"
            name="time"
            placeholder="Time (e.g., 02:00 PM)"
            className="p-2 rounded-md border border-gray-600 text-black"
            value={formData.time}
            onChange={handleChange}
          />
          <input
            type="text"
            name="type"
            placeholder="Focus Type"
            className="p-2 rounded-md border border-gray-600 text-black"
            value={formData.type}
            onChange={handleChange}
          />
          <select
            name="status"
            className="p-2 rounded-md border border-gray-600 text-black"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
          {editingSession ? (
            <Button size="sm" className="bg-gym-success text-white" onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button size="sm" className="bg-gym-gold text-gym-dark" onClick={handleAdd}>
              Add
            </Button>
          )}
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="border-gym-gray">
              <TableHead className="text-gray-400">Member</TableHead>
              <TableHead className="text-gray-400">Time</TableHead>
              <TableHead className="text-gray-400">Focus</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="border-gym-gray">
                <TableCell className="text-white">{session.member}</TableCell>
                <TableCell className="text-white">{session.time}</TableCell>
                <TableCell className="text-white">{session.type}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      session.status === "confirmed"
                        ? "bg-gym-success text-white"
                        : "bg-yellow-500 text-black"
                    }
                  >
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-gym-gold text-gym-dark hover:bg-gym-gold-light"
                      onClick={() => handleEdit(session)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gym-gray text-white hover:bg-gym-gray"
                      onClick={() =>
                        setSessions(sessions.filter((s) => s.id !== session.id))
                      }
                    >
                      Delete
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
}

export default TrainingSessions;
