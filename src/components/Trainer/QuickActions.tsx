import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

// Modal component
const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-card p-6 rounded-lg w-96">
      <h2 className="text-white text-lg font-bold mb-4">{title}</h2>
      <div className="mb-4">{children}</div>
      <Button onClick={onClose} className="mt-2">
        Close
      </Button>
    </div>
  </div>
);

const QuickActions = () => {
  const navigate = useNavigate();
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isBreakModalOpen, setBreakModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState("");
  const [breakTime, setBreakTime] = useState("");

  // Dummy member list – replace with real data from API
  const members = ["John Doe", "Jane Smith", "Mike Johnson"];

  const handleSendMessage = () => {
    console.log("Sending message to:", selectedMembers, "Message:", messageText);
    // TODO: Call API to send messages
    setMessageModalOpen(false);
    setMessageText("");
    setSelectedMembers([]);
  };

  const handleScheduleBreak = () => {
    console.log("Scheduled break at:", breakTime);
    // TODO: Call API to schedule break
    setBreakModalOpen(false);
    setBreakTime("");
  };

  return (
    <Card className="bg-card border-gym-gray">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          <Button
            className="bg-gym-gold text-gym-dark hover:bg-gym-gold-light"
            onClick={() => navigate("/trainer/create-workout")}
          >
            Create Workout Plan
          </Button>

          <Button
            variant="outline"
            className="border-gym-gray text-white hover:bg-gym-gray"
            onClick={() => setMessageModalOpen(true)}
          >
            Message Members
          </Button>

          <Button
            variant="outline"
            className="border-gym-gray text-white hover:bg-gym-gray"
            onClick={() => navigate("/trainer/member-progress")}
          >
            View Member Progress
          </Button>

          <Button
            variant="outline"
            className="border-gym-gray text-white hover:bg-gym-gray"
            onClick={() => setBreakModalOpen(true)}
          >
            Schedule Break
          </Button>
        </div>

        {/* Message Members Modal */}
        {isMessageModalOpen && (
          <Modal title="Message Members" onClose={() => setMessageModalOpen(false)}>
            <div className="mb-2">
              <label className="text-white mb-1 block">Select Members:</label>
              <select
                multiple
                value={selectedMembers}
                onChange={(e) =>
                  setSelectedMembers(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              >
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <Button
              className="mt-2 bg-gym-gold text-gym-dark hover:bg-gym-gold-light"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Modal>
        )}

        {/* Schedule Break Modal */}
        {isBreakModalOpen && (
          <Modal title="Schedule Break" onClose={() => setBreakModalOpen(false)}>
            <input
              type="datetime-local"
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={breakTime}
              onChange={(e) => setBreakTime(e.target.value)}
            />
            <Button
              className="mt-2 bg-gym-gold text-gym-dark hover:bg-gym-gold-light"
              onClick={handleScheduleBreak}
            >
              Schedule
            </Button>
          </Modal>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
