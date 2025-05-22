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
  const [messageCount, setMessageCount] = useState(8); // Will be updated by API
  const [subscription, setSubscription] = useState({ plan: "FREE" }); // Mock data, API will drive limits
  const [chatError, setChatError] = useState<string | null>(null);
  const [messageLimit, setMessageLimit] = useState(FREE_TIER_LIMIT); // Default, will be updated by API

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistically add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isUserMessage: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentNewMessage = newMessage;
    setNewMessage("");
    setIsLoading(true);
    setChatError(null); // Clear previous errors

    try {
      const requestBody = {
        userId: "mockUserId", // Mock user ID
        personalityId: conversation.id,
        message: currentNewMessage,
      };
      console.log("CHAT_UI_SENDING_REQUEST:", requestBody);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("CHAT_UI_RECEIVED_RESPONSE_SUCCESS:", data);
        
        setMessageCount(data.messageCount);
        if (data.messageLimit) {
          setMessageLimit(data.messageLimit);
        }

        if (data.limitReached) {
          // The UI for limitReached is already handled by the component's main render logic
          // based on messageCount and messageLimit. We just need to ensure these are set.
          console.log("Message limit reached according to API.");
        } else if (data.error_code) {
          const errorMessage = data.message || "An API error occurred.";
          console.log("CHAT_UI_DISPLAYING_ERROR (from data.error_code):", errorMessage);
          setChatError(errorMessage);
          // Optionally, remove the optimistically added user message if the API indicates a persistent error for it
          // setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        } else if (data.aiMessage && data.aiMessage.text) {
          const aiMessage: Message = {
            id: data.aiMessage.id || (Date.now() + 1).toString(),
            content: data.aiMessage.text,
            isUserMessage: false,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          setChatError(null);
        } else {
          // Handle cases where AI message might be missing but no explicit error_code
          const errorMessage = "Received an unexpected response from the server.";
          console.log("CHAT_UI_DISPLAYING_ERROR (unexpected response):", errorMessage);
          setChatError(errorMessage);
        }
      } else {
        const errorData = await response.json();
        console.log("CHAT_UI_RECEIVED_RESPONSE_ERROR_DATA:", errorData);
        const errorMessage = errorData.message || "An error occurred while sending your message.";
        console.log("CHAT_UI_DISPLAYING_ERROR (response not ok):", errorMessage);
        setChatError(errorMessage);
        // Optionally, remove the optimistically added user message
        // setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      }
    } catch (error) {
      console.error("CHAT_UI_FETCH_ERROR_CAUGHT:", error);
      const errorMessage = "Failed to send message. Please check your connection and try again.";
      console.log("CHAT_UI_DISPLAYING_ERROR (fetch catch):", errorMessage);
      setChatError(errorMessage);
      // Optionally, remove the optimistically added user message
      // setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
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
          {messageCount >= messageLimit && subscription.plan === "FREE" ? (
            <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
              <div className="flex items-start">
                <Heart className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Message limit reached</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've used all {messageLimit} messages for today. Upgrade to continue chatting.
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
          
          {chatError && (
            <div className="mt-2 text-center text-red-500">
              <p>Error: {chatError}</p>
              <Button variant="outline" size="sm" onClick={() => setChatError(null)} className="mt-1">
                Dismiss
              </Button>
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {subscription.plan === "FREE" && (
              <span>
                {Math.max(0, messageLimit - messageCount)} messages remaining today.{" "}
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