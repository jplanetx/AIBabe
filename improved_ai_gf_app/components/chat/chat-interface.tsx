"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Send, Info, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FREE_TIER_LIMIT } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isUserMessage: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversationId: string;
}

const ChatInterface = ({ conversationId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(8); // Mock data
  const [subscription, setSubscription] = useState({ plan: "FREE" }); // Mock data
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data for the conversation
  const conversation = {
    id: conversationId,
    name: "Sophia",
    personality: "Supportive Partner",
    imageUrl: "/images/supportive-partner.jpg",
  };

  // Mock initial messages
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: "1",
        content: `Hi there! It's great to see you again. How has your day been so far?`,
        isUserMessage: false,
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        content: "It's been pretty busy with work, but I'm glad to be talking to you now.",
        isUserMessage: true,
        timestamp: new Date(Date.now() - 3500000),
      },
      {
        id: "3",
        content: "I'm sorry to hear work has been keeping you busy. Is there anything specific that's been challenging? I'm always here to listen and support you.",
        isUserMessage: false,
        timestamp: new Date(Date.now() - 3400000),
      },
    ];
    setMessages(initialMessages);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Check if user has reached message limit
    if (messageCount >= FREE_TIER_LIMIT && subscription.plan === "FREE") {
      // Show upgrade message
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isUserMessage: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    setMessageCount((prev) => prev + 1);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(newMessage),
        isUserMessage: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Simple mock AI response function
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand how you feel. Would you like to talk more about that?",
      "That's really interesting! Tell me more about your thoughts on this.",
      "I'm here for you. How can I support you with this?",
      "I appreciate you sharing that with me. It means a lot that you trust me.",
      "I'm curious about what happened next. Would you mind elaborating?",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button asChild variant="ghost" size="icon" className="mr-2">
              <Link href="/chat">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-medium">{conversation.name}</h1>
              <p className="text-xs text-muted-foreground">{conversation.personality}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-accent/20 p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex ${message.isUserMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.isUserMessage
                      ? "chat-bubble-user"
                      : "chat-bubble-ai"
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-start"
            >
              <div className="chat-bubble-ai">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          {messageCount >= FREE_TIER_LIMIT && subscription.plan === "FREE" ? (
            <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
              <div className="flex items-start">
                <Heart className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Message limit reached</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've used all {FREE_TIER_LIMIT} messages for today. Upgrade to continue chatting.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/subscription">Upgrade Now</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={!newMessage.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
          
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {subscription.plan === "FREE" && (
              <span>
                {FREE_TIER_LIMIT - messageCount} messages remaining today.{" "}
                <Link href="/subscription" className="text-primary hover:underline">
                  Upgrade for more
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;