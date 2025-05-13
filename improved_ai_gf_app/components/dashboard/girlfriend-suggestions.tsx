"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { PERSONALITY_TYPES } from "@/lib/constants";

const GirlfriendSuggestions = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Take just 3 personalities for suggestions
  const suggestions = PERSONALITY_TYPES.slice(0, 3);

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
        <CardTitle>Suggested Personalities</CardTitle>
        <CardDescription>
          Discover new AI companions that match your preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {suggestions.map((personality, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="hover:shadow-md transition-all duration-300 h-full">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-2xl">👩</span>
                    </div>
                    <h4 className="font-medium mb-1">{personality.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {personality.description}
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/chat/new?personality=${personality.id}`}>
                        Start Chat
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
          <Link href="/personalities">
            View All Personalities
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GirlfriendSuggestions;