import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'inquiry' | 'complaint' | 'feedback' | 'general';
}

const TrainerMessages = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread' | 'inquiry' | 'complaint' | 'feedback'>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
    type: "general" as Message['type']
  });

  useEffect(() => {
    // Load sample messages
    loadSampleMessages();
  }, []);

  const loadSampleMessages = () => {
    const sampleMessages: Message[] = [
      {
        id: '1',
        from: 'member1',
        fromName: 'Sarah Johnson',
        to: currentUser?.uid || '',
        toName: userProfile?.displayName || 'Trainer',
        subject: 'Question about workout routine',
        content: 'Hi! I wanted to ask about modifying my current workout routine. I\'ve been following the strength training program for 3 months now and I\'m ready to increase the intensity. What would you recommend?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        type: 'inquiry'
      },
      {
        id: '2',
        from: 'member2',
        fromName: 'Mike Chen',
        to: currentUser?.uid || '',
        toName: userProfile?.displayName || 'Trainer',
        subject: 'Great session today!',
        content: 'Thank you for the amazing HIIT session today. I really felt the burn and learned some new techniques. Looking forward to the next class!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        type: 'feedback'
      },
      {
        id: '3',
        from: 'member3',
        fromName: 'Emma Davis',
        to: currentUser?.uid || '',
        toName: userProfile?.displayName || 'Trainer',
        subject: 'Schedule conflict',
        content: 'I have a scheduling conflict with my regular Tuesday session. Would it be possible to reschedule to Wednesday this week? Please let me know what times are available.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        type: 'inquiry'
      },
      {
        id: '4',
        from: 'member4',
        fromName: 'John Smith',
        to: currentUser?.uid || '',
        toName: userProfile?.displayName || 'Trainer',
        subject: 'Equipment issue',
        content: 'During today\'s session, I noticed that the cable machine in station 3 was making unusual noises. Thought you should know for safety reasons.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        type: 'complaint'
      }
    ];

    setMessages(sampleMessages);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !message.read) ||
                         message.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyContent.trim()) return;

    // In a real app, this would send the reply to the database
    toast({
      title: "Reply Sent",
      description: `Your reply to ${selectedMessage.fromName} has been sent.`,
    });

    setReplyContent("");
    setSelectedMessage(null);
  };

  const handleComposeMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send the message to the database
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    });

    setNewMessage({ to: "", subject: "", content: "", type: "general" });
    setIsComposeOpen(false);
  };

  const getMessageTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'inquiry': return 'bg-blue-500 text-white';
      case 'complaint': return 'bg-red-500 text-white';
      case 'feedback': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getMessageTypeIcon = (type: Message['type']) => {
    switch (type) {
      case 'inquiry': return <MessageCircle className="h-4 w-4" />;
      case 'complaint': return <AlertCircle className="h-4 w-4" />;
      case 'feedback': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-400">Communicate with your members</p>
        </div>
        
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">To (Member Email)</label>
                <Input
                  value={newMessage.to}
                  onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="member@example.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Subject</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Message subject"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage({...newMessage, type: e.target.value as Message['type']})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Message</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleComposeMessage} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button onClick={() => setIsComposeOpen(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold text-white">{messages.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-white">{unreadCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Inquiries</p>
                <p className="text-2xl font-bold text-white">
                  {messages.filter(m => m.type === 'inquiry').length}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Feedback</p>
                <p className="text-2xl font-bold text-white">
                  {messages.filter(m => m.type === 'feedback').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Messages ({filteredMessages.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="inquiry">Inquiries</option>
                <option value="complaint">Complaints</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    message.read 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) {
                      handleMarkAsRead(message.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <User className="h-8 w-8 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{message.fromName}</h4>
                          <Badge className={`${getMessageTypeColor(message.type)} text-xs`}>
                            {getMessageTypeIcon(message.type)}
                            <span className="ml-1 capitalize">{message.type}</span>
                          </Badge>
                          {!message.read && (
                            <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                          )}
                        </div>
                        <h5 className="font-medium text-gray-300 mb-1">{message.subject}</h5>
                        <p className="text-gray-400 text-sm line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No messages found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                <User className="h-8 w-8 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{selectedMessage.fromName}</h4>
                    <Badge className={`${getMessageTypeColor(selectedMessage.type)} text-xs`}>
                      {getMessageTypeIcon(selectedMessage.type)}
                      <span className="ml-1 capitalize">{selectedMessage.type}</span>
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {selectedMessage.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-white mb-2">Subject: {selectedMessage.subject}</h5>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Reply</label>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Type your reply here..."
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSendReply} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
                <Button onClick={() => setSelectedMessage(null)} variant="outline" className="flex-1 border-gray-600">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerMessages;