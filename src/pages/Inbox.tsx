import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useMessages, useMessageMutations } from '@/hooks/useMessages';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Inbox = () => {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations(user?.id);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { data: messages = [] } = useMessages(selectedConversationId || undefined);
  const { sendMessage } = useMessageMutations();
  const [messageText, setMessageText] = useState('');

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations && conversations.length > 0 ? (
                  conversations.map((conv: any) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                        selectedConversationId === conv.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.businesses?.logo_url} />
                          <AvatarFallback>
                            {conv.businesses?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {conv.businesses?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.messages?.[0]?.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(conv.last_message_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No conversations yet. Start chatting with businesses!
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="md:col-span-2">
            {selectedConversationId ? (
              <>
                <CardHeader>
                  <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[440px] p-4">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Inbox;
