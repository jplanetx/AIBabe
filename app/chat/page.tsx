// app/chat/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ConversationList from '@/components/chat/conversation-list';
import MessageDisplay from '@/components/chat/message-display';
import MessageInput from '@/components/chat/message-input';
// import { createClient } from '@/lib/supabaseClients'; // Example import for Supabase

// Define types for messages and conversations
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  conversationId: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
}

// Mock data - replace with actual data fetching
const mockConversations: Conversation[] = [
  { id: 'conv1', name: 'General Chat', lastMessage: 'Sounds good!', timestamp: new Date(Date.now() - 1000 * 60 * 5), unreadCount: 2 },
  { id: 'conv2', name: 'Support Query', lastMessage: 'I need help with...', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'conv3', name: 'Project Alpha', lastMessage: 'Meeting at 3 PM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
];

const mockMessages: Message[] = [
  { id: 'msg1', conversationId: 'conv1', text: 'Hello there!', sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 7) },
  { id: 'msg2', conversationId: 'conv1', text: 'Hi! How are you?', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 6) },
  { id: 'msg3', conversationId: 'conv1', text: 'I am good, thanks! And you?', sender: 'ai', timestamp: new Date(Date.now() - 1000 * 60 * 5.5) },
  { id: 'msg4', conversationId: 'conv1', text: 'Doing well. Sounds good!', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'msg5', conversationId: 'conv2', text: 'I need help with my account.', sender: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
];

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(mockConversations[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);

  // const supabase = createClient(); // Example Supabase client

  // Effect to load messages for the selected conversation
  useEffect(() => {
    if (selectedConversationId) {
      console.log(`Loading messages for conversation: ${selectedConversationId} (placeholder)`);
      // Placeholder: Filter mock messages or fetch from backend
      const currentConversationMessages = mockMessages.filter(msg => msg.conversationId === selectedConversationId);
      setMessages(currentConversationMessages);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Optionally, mark conversation as read or perform other actions
    console.log(`Selected conversation: ${conversationId}`);
  };

  const handleSendMessage = (messageText: string) => {
    if (!selectedConversationId) {
      console.warn('No conversation selected to send message to.');
      // Potentially create a new conversation or prompt user to select one
      alert("Please select a conversation first or implement new conversation logic.");
      return;
    }
    console.log(`Sending message to ${selectedConversationId}: ${messageText} (placeholder)`);
    const newMessage: Message = {
      id: `msg${Date.now()}`, // Temporary ID
      conversationId: selectedConversationId,
      text: messageText,
      sender: 'user', // Assuming the user is sending
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Placeholder: Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg${Date.now() + 1}`, // Temporary ID
        conversationId: selectedConversationId,
        text: `AI response to: "${messageText}" (placeholder)`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);

    // Update last message in conversation list (mock)
    setConversations(prevConvs => prevConvs.map(conv => 
        conv.id === selectedConversationId 
        ? { ...conv, lastMessage: messageText, timestamp: new Date() } 
        : conv
    ));
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', border: '1px solid #ccc', margin: '10px', borderRadius: '8px', overflow: 'hidden' }}>
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
      />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversationId ? (
          <>
            <MessageDisplay messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
         <p style={{fontSize: '0.8em', color: 'gray', padding: '5px', textAlign: 'center', borderTop: '1px solid #eee'}}>Chat UI: Main Chat Page Placeholder ([`app/chat/page.tsx`](app/chat/page.tsx))</p>
      </div>
    </div>
  );
}