import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAllChatbotReplies, 
  addChatbotReply, 
  updateChatbotReply, 
  deleteChatbotReply, 
  ChatbotReply,
  getAllChatMessages
} from "@/lib/firestore";
import { Trash, Plus, Edit, MessageCircle, Bot, Loader2, Eye } from "lucide-react";

const AdminChatbotControl = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<ChatbotReply[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReply, setSelectedReply] = useState<ChatbotReply | null>(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [newReply, setNewReply] = useState({
    keywords: "",
    answer: "",
    category: "general",
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repliesData, messagesData] = await Promise.all([
        getAllChatbotReplies(),
        getAllChatMessages()
      ]);
      setReplies(repliesData);
      setChatMessages(messagesData);
    } catch (error) {
      console.error("Error fetching chatbot data:", error);
      toast({
        title: "Error",
        description: "Failed to load chatbot data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!newReply.keywords.trim() || !newReply.answer.trim() || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setAdding(true);
      
      const keywordsArray = newReply.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      
      const replyData: Omit<ChatbotReply, 'id' | 'createdAt' | 'updatedAt'> = {
        keywords: keywordsArray,
        answer: newReply.answer,
        category: newReply.category,
        isActive: newReply.isActive
      };

      await addChatbotReply(replyData);
      await fetchData();

      // Reset form
      setNewReply({
        keywords: "",
        answer: "",
        category: "general",
        isActive: true
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Chatbot reply added successfully!",
      });

    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to add chatbot reply",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateReply = async () => {
    if (!selectedReply) return;

    try {
      setUpdating(true);
      
      const keywordsArray = typeof selectedReply.keywords === 'string' 
        ? selectedReply.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k)
        : selectedReply.keywords;

      await updateChatbotReply(selectedReply.id!, {
        keywords: keywordsArray,
        answer: selectedReply.answer,
        category: selectedReply.category,
        isActive: selectedReply.isActive
      });

      await fetchData();
      setIsEditDialogOpen(false);
      setSelectedReply(null);

      toast({
        title: "Success",
        description: "Chatbot reply updated successfully!",
      });

    } catch (error) {
      console.error("Error updating reply:", error);
      toast({
        title: "Error",
        description: "Failed to update chatbot reply",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReply = async (id: string) => {
    try {
      await deleteChatbotReply(id);
      await fetchData();
      
      toast({
        title: "Success",
        description: "Chatbot reply deleted successfully!",
      });

    } catch (error) {
      console.error("Error deleting reply:", error);
      toast({
        title: "Error",
        description: "Failed to delete chatbot reply",
        variant: "destructive"
      });
    }
  };

  const toggleReplyStatus = async (reply: ChatbotReply) => {
    try {
      await updateChatbotReply(reply.id!, {
        isActive: !reply.isActive
      });
      await fetchData();
      
      toast({
        title: "Success",
        description: `Reply ${reply.isActive ? 'disabled' : 'enabled'} successfully!`,
      });

    } catch (error) {
      console.error("Error toggling reply status:", error);
      toast({
        title: "Error",
        description: "Failed to update reply status",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'bg-green-500 text-white';
      case 'membership': return 'bg-blue-500 text-white';
      case 'classes': return 'bg-purple-500 text-white';
      case 'equipment': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading chatbot data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Chatbot Control Panel</h1>
          <p className="text-gray-400">Manage automated responses and chatbot settings</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Reply
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Chatbot Reply</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={newReply.keywords}
                  onChange={(e) => setNewReply({...newReply, keywords: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="e.g., hours, schedule, time"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter keywords that will trigger this response
                </p>
              </div>
              
              <div>
                <Label htmlFor="answer">Response</Label>
                <Textarea
                  id="answer"
                  value={newReply.answer}
                  onChange={(e) => setNewReply({...newReply, answer: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Enter the chatbot response..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newReply.category}
                  onChange={(e) => setNewReply({...newReply, category: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="fitness">Fitness</option>
                  <option value="membership">Membership</option>
                  <option value="classes">Classes</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newReply.isActive}
                  onCheckedChange={(checked) => setNewReply({...newReply, isActive: checked})}
                />
                <Label>Active</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddReply} disabled={adding} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reply
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Replies</p>
                <p className="text-2xl font-bold text-white">{replies.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Replies</p>
                <p className="text-2xl font-bold text-white">
                  {replies.filter(r => r.isActive).length}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Chat Messages</p>
                <p className="text-2xl font-bold text-white">{chatMessages.length}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Chatbot Status</p>
                <p className="text-lg font-bold text-green-500">Active</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbot Replies */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Chatbot Replies ({replies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {replies.length > 0 ? (
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex justify-between items-start p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(reply.category)}>
                        {reply.category}
                      </Badge>
                      <Badge className={reply.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                        {reply.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-400">Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {reply.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-500 text-gray-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Response:</p>
                      <p className="text-white mt-1">{reply.answer}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        setSelectedReply({
                          ...reply,
                          keywords: reply.keywords.join(', ')
                        } as any);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={reply.isActive ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white" : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"}
                      onClick={() => toggleReplyStatus(reply)}
                    >
                      {reply.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeleteReply(reply.id!)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No chatbot replies configured yet.</p>
                <p className="text-sm text-gray-500">Add your first reply to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Reply Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Chatbot Reply</DialogTitle>
          </DialogHeader>
          {selectedReply && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
                <Input
                  id="edit-keywords"
                  value={selectedReply.keywords as any}
                  onChange={(e) => setSelectedReply({...selectedReply, keywords: e.target.value as any})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-answer">Response</Label>
                <Textarea
                  id="edit-answer"
                  value={selectedReply.answer}
                  onChange={(e) => setSelectedReply({...selectedReply, answer: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={selectedReply.category}
                  onChange={(e) => setSelectedReply({...selectedReply, category: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="fitness">Fitness</option>
                  <option value="membership">Membership</option>
                  <option value="classes">Classes</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedReply.isActive}
                  onCheckedChange={(checked) => setSelectedReply({...selectedReply, isActive: checked})}
                />
                <Label>Active</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleUpdateReply} disabled={updating} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Reply
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatbotControl;