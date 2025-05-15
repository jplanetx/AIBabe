"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Clock, Heart, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";

const DashboardStats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    {
      title: "Total Messages",
      value: "247",
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      change: "+12% from last week",
    },
    {
      title: "Active Conversations",
      value: "3",
      icon: <Heart className="h-5 w-5 text-primary" />,
      change: "+1 new conversation",
    },
    {
      title: "Time Spent",
      value: "14h",
      icon: <Clock className="h-5 w-5 text-primary" />,
      change: "+2h from last week",
    },
    {
      title: "Favorite Personality",
      value: "Supportive",
      icon: <Star className="h-5 w-5 text-primary" />,
      change: "Based on message count",
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
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-medium text-muted-foreground">
                  {stat.title}
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.change}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;