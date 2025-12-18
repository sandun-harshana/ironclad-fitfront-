import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Trash2, Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { generateGeminiResponse } from "@/lib/gemini";
import { addChatMessage, getChatMessagesByUser, getAllChatbotReplies } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

interface ChatMessage {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const MemberChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [chatbotReplies, setChatbotReplies] = useState<any[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Load chat history and chatbot replies on component mount
  useEffect(() => {
    if (currentUser) {
      loadChatHistory();
      loadChatbotReplies();
    }
  }, [currentUser]);

  const loadChatHistory = async () => {
    if (!currentUser) return;
    
    try {
      const chatHistory = await getChatMessagesByUser(currentUser.uid);
      const formattedMessages: ChatMessage[] = [];
      
      chatHistory.forEach(chat => {
        formattedMessages.push({
          id: chat.id,
          sender: 'user',
          text: chat.message,
          timestamp: new Date(chat.timestamp.seconds * 1000)
        });
        formattedMessages.push({
          id: `${chat.id}-response`,
          sender: 'bot',
          text: chat.response,
          timestamp: new Date(chat.timestamp.seconds * 1000)
        });
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadChatbotReplies = async () => {
    try {
      const replies = await getAllChatbotReplies();
      setChatbotReplies(replies.filter(reply => reply.isActive));
    } catch (error) {
      console.error('Error loading chatbot replies:', error);
    }
  };

  const findChatbotReply = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const reply of chatbotReplies) {
      const matchingKeywords = reply.keywords.filter((keyword: string) => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      if (matchingKeywords.length > 0) {
        return reply.answer;
      }
    }
    
    return null;
  };

  const handleSend = async () => {
    if (!input.trim()) {
      setInputError("Please enter a message");
      return;
    }
    if (input.length > 500) {
      setInputError("Message is too long (max 500 characters)");
      return;
    }
    if (!currentUser) {
      setInputError("Please log in to use the chatbot");
      return;
    }

    setInputError("");
    const userMessage: ChatMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      let botResponse: string;
      
      // First, check if there's a predefined reply
      const predefinedReply = findChatbotReply(userInput);
      
      if (predefinedReply) {
        botResponse = predefinedReply;
      } else {
        // If no predefined reply, use AI
        botResponse = await generateGeminiResponse(userInput, 'fitness');
      }
      
      const botMessage: ChatMessage = {
        sender: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);

      // Save to Firestore
      await addChatMessage({
        userId: currentUser.uid,
        message: userInput,
        response: botResponse,
        timestamp: Timestamp.now(),
        type: 'question',
        status: 'resolved'
      });

    } catch (error) {
      console.error('Error getting bot response:', error);
      
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: "I'm sorry, I'm having trouble responding right now. Please try again later or contact our support team for assistance.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setInputError("");
    toast({
      title: "Chat cleared",
      description: "Your chat history has been cleared locally",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    "What are the gym hours?",
    "How do I book a class?",
    "What equipment is available?",
    "How can I cancel my membership?",
    "What are the membership types?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-800 border-gray-700 text-white shadow-2xl">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-500" />
            <span>AI Fitness Assistant</span>
            <Button 
              onClick={clearChat} 
              variant="outline"
              size="sm"
              className="ml-auto border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Ask me about workouts, nutrition, fitness goals, or gym-related questions!
          </p>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto border border-gray-600 p-4 rounded-lg mb-4 bg-gray-900/50 backdrop-blur-sm"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-lg mb-2">Hi {userProfile?.displayName || 'there'}! 👋</p>
                <p>I'm your AI fitness assistant. I can help you with:</p>
                <ul className="mt-4 text-sm space-y-1">
                  <li>• Workout routines and exercises</li>
                  <li>• Nutrition and diet advice</li>
                  <li>• Fitness goals and planning</li>
                  <li>• Equipment usage tips</li>
                  <li>• General health and wellness</li>
                </ul>
                
                {/* Quick Questions */}
                <div className="mt-6">
                  <p className="text-sm mb-3">Quick questions to get started:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'bot' && <Bot className="h-4 w-4 text-blue-400" />}
                      <p className={`font-semibold text-sm ${
                        message.sender === 'user' ? "text-blue-100" : "text-blue-400"
                      }`}>
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </p>
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setInputError("");
                }}
                placeholder="Ask me about fitness, workouts, nutrition..."
                className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                  inputError ? "border-red-500" : "focus:border-blue-500"
                }`}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isLoading}
                maxLength={500}
              />
              <Button 
                onClick={handleSend} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {inputError && (
              <p className="text-red-400 text-sm">{inputError}</p>
            )}
            
            <p className="text-xs text-gray-500">
              {input.length}/500 characters • Press Enter to send
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberChatbot;