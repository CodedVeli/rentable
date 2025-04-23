import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Message, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, Send, User as UserIcon, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch conversations (in a real app, this would be a proper contacts/conversations endpoint)
  // For now, we'll simulate this with a hardcoded list of users
  const { data: contacts = [], isLoading: contactsLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    // This is a placeholder since we don't have a real contacts API
    queryFn: async () => {
      return [];
    },
    enabled: !!user,
  });

  // Fetch messages between current user and selected user
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/messages/${selectedUserId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!user && !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; content: string; propertyId?: number }) => {
      const res = await apiRequest("POST", "/api/messages", messageData);
      return await res.json();
    },
    onSuccess: () => {
      setMessageText("");
      // Invalidate messages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate messages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
    },
  });

  // Helper function to format date
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // For messages from today, show time
    if (messageDay.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
    }
    
    // For messages from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDay.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    // For other days
    return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  // Function to handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUserId) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedUserId,
      content: messageText
    });
  };

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedUserId && messages) {
      // Mark unread messages as read
      messages
        .filter(msg => msg.receiverId === user?.id && !msg.isRead)
        .forEach(msg => {
          markAsReadMutation.mutate(msg.id);
        });
    }
  }, [selectedUserId, messages, user?.id]);

  // Filtered contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Messages</h1>
          
          <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-180px)]">
            <div className="flex h-full">
              {/* Contacts Sidebar */}
              <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search contacts..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {contactsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? "No contacts found" : "No contacts yet"}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredContacts.map(contact => (
                        <div
                          key={contact.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            selectedUserId === contact.id ? 'bg-primary-50' : ''
                          }`}
                          onClick={() => setSelectedUserId(contact.id)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={contact.profileImage || undefined} />
                              <AvatarFallback>
                                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {contact.firstName} {contact.lastName}
                                </h3>
                                <span className="text-xs text-gray-500">12:45 PM</span>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                Last message preview...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Demo contacts for UI presentation */}
                  <div className="divide-y divide-gray-200">
                    <div
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedUserId === 101 ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedUserId(101)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              John Doe
                            </h3>
                            <span className="text-xs text-gray-500">2:35 PM</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            I'm interested in the downtown condo...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedUserId === 102 ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedUserId(102)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              Sarah Chen
                            </h3>
                            <span className="text-xs text-gray-500">Yesterday</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            When can I schedule a viewing for...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedUserId === 103 ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedUserId(103)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>MT</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              Michael Thompson
                            </h3>
                            <span className="text-xs text-gray-500">Jul 24</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            Thanks for approving my application!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedUserId ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {selectedUserId === 101 ? 'JD' : selectedUserId === 102 ? 'SC' : 'MT'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {selectedUserId === 101 ? 'John Doe' : 
                           selectedUserId === 102 ? 'Sarah Chen' : 'Michael Thompson'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedUserId === 101 ? 'Tenant' : 
                           selectedUserId === 102 ? 'Tenant' : 'Landlord'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {messagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <UserIcon className="h-12 w-12 mb-4 text-gray-300" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Start the conversation by sending a message</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* We'd use real messages here, for now using demo messages */}
                          <div className="flex items-end">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>
                                {selectedUserId === 101 ? 'JD' : 
                                 selectedUserId === 102 ? 'SC' : 'MT'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-2 max-w-xs sm:max-w-md break-words">
                              <p className="text-sm text-gray-900">
                                {selectedUserId === 101 
                                  ? "Hello! I'm interested in your downtown condo listing. Is it still available?"
                                  : selectedUserId === 102
                                  ? "Hi there! I saw your 2-bedroom apartment listing and would love to schedule a viewing."
                                  : "Thanks for approving my application! When can I move in?"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {selectedUserId === 101 ? '2:35 PM' : selectedUserId === 102 ? 'Yesterday' : 'Jul 24'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-end">
                            <div className="bg-primary-100 rounded-lg rounded-br-none px-4 py-2 max-w-xs sm:max-w-md break-words">
                              <p className="text-sm text-gray-900">
                                {selectedUserId === 101 
                                  ? "Yes, it's still available! Would you like to schedule a viewing?"
                                  : selectedUserId === 102
                                  ? "Hi Sarah, I'd be happy to show you the apartment. Are you available this weekend?"
                                  : "Hi Michael, congratulations! You can move in on August 1st. Let me know if that works for you."}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {selectedUserId === 101 ? '2:37 PM' : selectedUserId === 102 ? 'Yesterday' : 'Jul 24'}
                              </p>
                            </div>
                          </div>
                          
                          {selectedUserId === 101 && (
                            <div className="flex items-end">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-2 max-w-xs sm:max-w-md break-words">
                                <p className="text-sm text-gray-900">
                                  That would be great! Are there any times available this Saturday?
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  2:40 PM
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex">
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          className="flex-1 mr-2"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                    <MessageIcon className="h-16 w-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
                    <p>Choose a contact from the list to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Import a message icon for the empty state
import { MessageSquare as MessageIcon } from "lucide-react";
