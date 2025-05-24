// components/chat/conversation-list.tsx
'use client';

import React from 'react';

interface Conversation {
  id: string;
  name: string; // e.g., "Chat with AI Assistant" or a user's name
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation 
}: ConversationListProps) {
  if (!conversations || conversations.length === 0) {
    return <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No conversations yet.</p>;
  }

  return (
    <div style={{ width: '300px', borderRight: '1px solid #eee', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #eee', fontSize: '1.1em' }}>Conversations</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            style={{
              padding: '12px 15px',
              borderBottom: '1px solid #f5f5f5',
              cursor: 'pointer',
              backgroundColor: conv.id === selectedConversationId ? '#e9f5ff' : 'transparent',
              fontWeight: conv.id === selectedConversationId ? 'bold' : 'normal',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95em' }}>{conv.name}</span>
              {conv.unreadCount && conv.unreadCount > 0 && (
                <span style={{ backgroundColor: '#007bff', color: 'white', borderRadius: '50%', padding: '2px 7px', fontSize: '0.7em' }}>
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8em', color: '#666', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {conv.lastMessage}
            </p>
            <small style={{ fontSize: '0.7em', color: '#999', display: 'block', textAlign: 'right' }}>
              {new Date(conv.timestamp).toLocaleTimeString()}
            </small>
          </li>
        ))}
      </ul>
      <p style={{fontSize: '0.8em', color: 'gray', marginTop: '20px', textAlign: 'center'}}>Chat UI: Conversation List Placeholder ([`components/chat/conversation-list.tsx`](components/chat/conversation-list.tsx))</p>
    </div>
  );
}