"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isUserMessage: boolean;
  timestamp: Date;
  senderName: string;
  senderImage?: string;
}

const ChatMessage = ({
  content,
  isUserMessage,
  timestamp,
  senderName,
  senderImage,
}: ChatMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.div
      className={cn(
        "flex w-full mb-4",
        isUserMessage ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "flex max-w-[80%] md:max-w-[70%]",
          isUserMessage ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div className={cn("flex-shrink-0", isUserMessage ? "ml-3" : "mr-3")}>
          <Avatar>
            {senderImage ? (
              <AvatarImage src={senderImage} alt={senderName} />
            ) : (
              <AvatarFallback>
                {senderName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="flex flex-col">
          <div
            className={cn(
              "px-4 py-3 rounded-lg",
              isUserMessage
                ? "bg-pink-500 text-white rounded-tr-none"
                : "bg-gray-100 dark:bg-gray-800 rounded-tl-none"
            )}
          >
            <p className="text-sm">{content}</p>
          </div>
          <span
            className={cn(
              "text-xs text-gray-500 mt-1",
              isUserMessage ? "text-right" : "text-left"
            )}
          >
            {formatDate(timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;