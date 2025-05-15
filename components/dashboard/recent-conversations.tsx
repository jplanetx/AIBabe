"use client";

import { useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const RecentConversations = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const conversations = [
    {
      id: "1",
      name: "Sophia",
      personality: "Supportive Partner",
      lastMessage: "I'm so proud of you for finishing that project! How are you feeling now that it's done?",
      lastActive: new Date("2023-06-15T14:32:00"),
      messageCount: 78,
    },
    {
      id: "2",
      name: "Emma",
      personality: "Intellectual Equal",
      lastMessage: "That's an interesting perspective on the book. Have you considered the author's background and how it might have influenced the themes?",
      lastActive: new Date("2023-06-14T09:15:00"),
      messageCount: 42,
    },
    {
      id: "3",
      name: "Lily",
      personality: "Playful Companion",
      lastMessage: "Haha, that's hilarious! 😂 We should definitely try that game you mentioned. When are you free next?",
      lastActive: new Date("2023-06-13T20:45:00"),
      messageCount: 127,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Conversations</CardTitle>
        <CardDescription>
          Continue where you left off with your AI companions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-4"
        >
          {conversations.map((conversation) => (
            <motion.div key={conversation.id} variants={itemVariants}>
              <Card className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{conversation.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {conversation.personality}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(conversation.lastActive)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {conversation.messageCount} messages
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/chat/${conversation.id}`}>
                        Continue
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/chat">
            View All Conversations
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentConversations;