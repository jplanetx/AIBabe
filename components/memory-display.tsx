"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Memory {
  id: string;
  content: string;
  importance: number;
  createdAt: Date;
}

interface MemoryDisplayProps {
  memories: Memory[];
}

const MemoryDisplay = ({ memories }: MemoryDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (memories.length === 0) {
    return null;
  }

  const sortedMemories = [...memories].sort((a, b) => b.importance - a.importance);
  const displayMemories = isExpanded ? sortedMemories : sortedMemories.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2 text-pink-500" />
            Memories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <AnimatePresence>
            {displayMemories.map((memory) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-start">
                  <Badge
                    variant="secondary"
                    className="mr-2 mt-0.5 flex-shrink-0"
                  >
                    {memory.importance}
                  </Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {memory.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {memories.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show More ({memories.length - 3} more)
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MemoryDisplay;