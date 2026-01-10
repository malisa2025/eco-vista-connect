import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useMessages, useMessageMutations } from '@/hooks/useMessages';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, ArrowLeft, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Inbox = () => {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations(user?.id);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { data: messages = [] } = useMessages(selectedConversationId || undefined);
  const { sendMessage } = useMessageMutations();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedConversation = conversations?.find((c: any) => c.id === selectedConversationId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId || !user) return;

    await sendMessage.mutateAsync({
      conversationId: selectedConversationId,
      content: messageText,
      senderId: user.id,
    });

    setMessageText('');
  };

  const filteredConversations = conversations?.filter((conv: any) =>
    conv.businesses?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-dashboard bg-dashboard-animated">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dashboard bg-dashboard-animated">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-white/60 mt-1">Chat with businesses</p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden h-[600px] flex">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {filteredConversations && filteredConversations.length > 0 ? (
                filteredConversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 ${
                      selectedConversationId === conv.id 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-2 border-l-cyan-400' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white/10">
                        <AvatarImage src={conv.businesses?.logo_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {conv.businesses?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">
                          {conv.businesses?.name}
                        </h4>
                        <p className="text-sm text-white/50 truncate mt-0.5">
                          {conv.messages?.[0]?.content || 'No messages yet'}
                        </p>
                        <p className="text-xs text-white/30 mt-1">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-white/20" />
                  </div>
                  <p className="text-white/50">No conversations yet</p>
                  <p className="text-sm text-white/30 mt-1">Start chatting with businesses!</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages */}
          <div className={`flex-1 flex flex-col ${selectedConversationId ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-white/10"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-white/10">
                    <AvatarImage src={selectedConversation?.businesses?.logo_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {selectedConversation?.businesses?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-white">
                      {selectedConversation?.businesses?.name}
                    </h4>
                    <p className="text-xs text-white/50">Online</p>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 ${
                            message.sender_id === user?.id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm'
                              : 'bg-white/10 text-white rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.sender_id === user?.id ? 'text-white/70' : 'text-white/40'
                          }`}>
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!messageText.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl h-10 w-10 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-10 w-10 text-white/20" />
                  </div>
                  <p className="text-white/50 text-lg">Select a conversation</p>
                  <p className="text-sm text-white/30 mt-1">Choose from your existing conversations</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Inbox;