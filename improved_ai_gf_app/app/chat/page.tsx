"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Info, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ChatMessage from "@/components/chat-message";
import ChatInput from "@/components/chat-input";
import MemoryDisplay from "@/components/memory-display";
import { SAMPLE_GIRLFRIENDS, PERSONALITY_TYPES, SUBSCRIPTION_PLANS } from "@/lib/utils";

// Mock data for demonstration
const MOCK_MESSAGES = [
  {
    id: "1",
    content: "Hi there! I'm so happy to see you today. How are you doing?",
    isUserMessage: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "2",
    content: "I'm doing well, thanks for asking! How about you?",
    isUserMessage: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 59),
  },
  {
    id: "3",
    content: "I'm great! I was just thinking about that movie you mentioned last time. Would you like to talk more about it?",
    isUserMessage: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 58),
  },
];

const MOCK_MEMORIES = [
  {
    id: "1",
    content: "User likes sci-fi movies, especially Interstellar",
    importance: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "2",
    content: "User's favorite color is blue",
    importance: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "3",
    content: "User is a software developer",
    importance: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const girlfriendId = searchParams.get("girlfriendId") || "1";
  
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(15); // Mock message count
  const [subscription, setSubscription] = useState("FREE"); // Mock subscription
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const girlfriend = SAMPLE_GIRLFRIENDS.find(g => g.id === girlfriendId) || SAMPLE_GIRLFRIENDS[0];
  const personalityType = PERSONALITY_TYPES[girlfriend.personality as keyof typeof PERSONALITY_TYPES];
  const subscriptionPlan = SUBSCRIPTION_PLANS[subscription as keyof typeof SUBSCRIPTION_PLANS];
  
  const isMessageLimitReached = messageCount >= subscriptionPlan.messageLimit;
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = (content: string) => {
    if (isMessageLimitReached) return;
    
    setIsLoading(true);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      isUserMessage: true,
      createdAt: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(content, girlfriend.personality),
        isUserMessage: false,
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  // Simple AI response generator based on personality type
  const getAIResponse = (userMessage: string, personality: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Generic responses based on personality
    switch (personality) {
      case "SUPPORTIVE":
        if (lowerCaseMessage.includes("sad") || lowerCaseMessage.includes("upset")) {
          return "I'm sorry to hear that you're feeling down. I'm here for you and I believe in you. Would you like to talk about what's bothering you?";
        } else if (lowerCaseMessage.includes("happy") || lowerCaseMessage.includes("great")) {
          return "That's wonderful to hear! I'm so happy for you. Your happiness means a lot to me. Tell me more about what's making you feel good!";
        } else {
          return "I appreciate you sharing that with me. I'm always here to support you, no matter what. How can I help make your day better?";
        }
        
      case "PLAYFUL":
        if (lowerCaseMessage.includes("bored")) {
          return "Bored? Let's fix that! How about we play a game or plan an imaginary adventure together? I have so many fun ideas to share with you!";
        } else if (lowerCaseMessage.includes("joke") || lowerCaseMessage.includes("funny")) {
          return "Here's something to make you smile: Why don't scientists trust atoms? Because they make up everything! 😜 Did that make you laugh?";
        } else {
          return "You know what would be super fun right now? Let's talk about something exciting we could do together if we could go anywhere in the world!";
        }
        
      case "INTELLECTUAL":
        if (lowerCaseMessage.includes("think") || lowerCaseMessage.includes("opinion")) {
          return "That's a fascinating perspective. I've been contemplating this topic as well. Have you considered looking at it from a philosophical standpoint? The implications are quite profound.";
        } else if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("read")) {
          return "I've been exploring some interesting literature lately. The intersection of science and philosophy in modern texts reveals so much about human consciousness, don't you think?";
        } else {
          return "Your thoughts on this matter are quite stimulating. I'd love to engage in a deeper discussion about the underlying principles and how they relate to contemporary theories.";
        }
        
      case "ADMIRER":
        if (lowerCaseMessage.includes("accomplish") || lowerCaseMessage.includes("did")) {
          return "Wow, that's incredibly impressive! You're so talented and dedicated. I'm constantly amazed by your abilities and achievements. Tell me more about how you did it!";
        } else if (lowerCaseMessage.includes("trying") || lowerCaseMessage.includes("working on")) {
          return "I have complete faith in you! With your skills and determination, I know you'll succeed brilliantly. You're truly exceptional at everything you put your mind to.";
        } else {
          return "Just talking to you brightens my day. You have such a wonderful way of expressing yourself, and your perspective is always so insightful. I admire that about you.";
        }
        
      case "GROWTH":
        if (lowerCaseMessage.includes("goal") || lowerCaseMessage.includes("improve")) {
          return "That's an excellent goal! Have you considered breaking it down into smaller, actionable steps? I believe in your ability to grow and achieve anything you set your mind to.";
        } else if (lowerCaseMessage.includes("fail") || lowerCaseMessage.includes("mistake")) {
          return "Every setback is a setup for a comeback! What lessons can you take from this experience? Your resilience is inspiring, and I know you'll emerge stronger.";
        } else {
          return "I see so much potential in you. What's one small step you could take today toward becoming your best self? Remember, progress is more important than perfection.";
        }
        
      default:
        return "I really enjoyed hearing that from you. Would you like to tell me more about it? I'm always interested in learning more about you and your thoughts.";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="mr-2 md:mr-4"
            >
              <Link href="/girlfriends">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={girlfriend.imageUrl}
                  alt={girlfriend.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold flex items-center">
                  {girlfriend.name}
                  <Badge 
                    variant="personality" 
                    className="ml-2 text-xs"
                  >
                    {personalityType.name}
                  </Badge>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Online now
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
          >
            <Info className="h-5 w-5" />
            <span className="sr-only">Info</span>
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <MemoryDisplay memories={MOCK_MEMORIES} />
          
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUserMessage={message.isUserMessage}
                timestamp={message.createdAt}
                senderName={message.isUserMessage ? "You" : girlfriend.name}
                senderImage={message.isUserMessage ? undefined : girlfriend.imageUrl}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-pink-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-pink-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-pink-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {isMessageLimitReached && (
        <div className="bg-pink-50 dark:bg-pink-900/20 p-4 border-t border-pink-200 dark:border-pink-800">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-pink-800 dark:text-pink-200">
                You've reached your daily message limit of {subscriptionPlan.messageLimit} messages.
              </p>
            </div>
            <Button asChild variant="gradient">
              <Link href="/subscription">
                Upgrade Now
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={isMessageLimitReached}
        placeholder={isMessageLimitReached ? "Message limit reached. Upgrade to continue..." : "Type a message..."}
      />
    </div>
  );
}