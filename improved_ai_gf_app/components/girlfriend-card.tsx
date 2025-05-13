"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PERSONALITY_TYPES } from "@/lib/utils";

interface GirlfriendCardProps {
  id: string;
  name: string;
  description: string;
  personality: string;
  imageUrl: string;
  traits: string[];
  interests: string[];
}

const GirlfriendCard = ({
  id,
  name,
  description,
  personality,
  imageUrl,
  traits,
  interests,
}: GirlfriendCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const personalityType = PERSONALITY_TYPES[personality as keyof typeof PERSONALITY_TYPES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card 
        className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
          <div className="absolute top-4 right-4">
            <Badge 
              variant="personality" 
              className="font-medium"
            >
              {personalityType.name}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-between">
            {name}
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="h-5 w-5 text-pink-500" />
            </motion.div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description.length > 120 ? `${description.substring(0, 120)}...` : description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {traits.slice(0, 3).map((trait, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
            {traits.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{traits.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-500">
            <span className="font-medium">Interests:</span>{" "}
            {interests.slice(0, 3).join(", ")}
            {interests.length > 3 && ` and ${interests.length - 3} more`}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button 
            asChild 
            variant="gradient" 
            className="w-full"
          >
            <Link href={`/chat?girlfriendId=${id}`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chatting
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GirlfriendCard;