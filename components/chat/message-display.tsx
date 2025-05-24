// components/chat/message-display.tsx
'use client';

import React from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // Or more specific types
  timestamp: Date;
}

interface MessageDisplayProps {
  messages: Message[];
}

export default function MessageDisplay({ messages }: MessageDisplayProps) {
  if (!messages || messages.length === 0) {
    return <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No messages yet. Start the conversation!</p>;
  }

  return (
    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 20px' }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            marginBottom: '10px',
            padding: '8px 12px',
            borderRadius: '10px',
            maxWidth: '70%',
            wordWrap: 'break-word',
            backgroundColor: msg.sender === 'user' ? '#007bff' : (msg.sender === 'ai' ? '#e9ecef' : '#f8f9fa'),
            color: msg.sender === 'user' ? 'white' : 'black',
            marginLeft: msg.sender === 'user' ? 'auto' : '0',
            marginRight: msg.sender === 'ai' || msg.sender === 'system' ? 'auto' : '0',
            textAlign: msg.sender === 'user' ? 'right' : 'left',
          }}
        >
          <p style={{ margin: 0 }}>{msg.text}</p>
          <small style={{ fontSize: '0.7em', color: msg.sender === 'user' ? '#f0f0f0' : '#555', display: 'block', marginTop: '3px' }}>
            {msg.sender} - {new Date(msg.timestamp).toLocaleTimeString()}
          </small>
        </div>
      ))}
      <p style={{fontSize: '0.8em', color: 'gray', marginTop: '20px', textAlign: 'center'}}>Chat UI: Message Display Placeholder ([`components/chat/message-display.tsx`](components/chat/message-display.tsx))</p>
    </div>
  );
}