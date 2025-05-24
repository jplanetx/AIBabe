// components/chat/message-input.tsx
'use client';

import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (messageText: string) => void; // Callback to send the message
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim()) {
      console.log('Sending message (placeholder):', message);
      onSendMessage(message.trim()); // Call the passed-in function
      setMessage(''); // Clear input after sending
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ display: 'flex', padding: '10px', borderTop: '1px solid #eee' }}
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ 
          flexGrow: 1, 
          padding: '10px', 
          borderRadius: '20px', 
          border: '1px solid #ccc', 
          marginRight: '10px' 
        }}
      />
      <button 
        type="submit"
        style={{ 
          padding: '10px 15px', 
          borderRadius: '20px', 
          border: 'none', 
          backgroundColor: '#007bff', 
          color: 'white', 
          cursor: 'pointer' 
        }}
      >
        Send
      </button>
      <p style={{fontSize: '0.8em', color: 'gray', marginLeft: '10px', alignSelf: 'center'}}>Chat UI: Message Input Placeholder ([`components/chat/message-input.tsx`](components/chat/message-input.tsx))</p>
    </form>
  );
}