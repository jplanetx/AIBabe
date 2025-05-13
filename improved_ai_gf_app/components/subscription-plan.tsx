"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SubscriptionPlanProps {
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  onSelect: (plan: string) => void;
}

const SubscriptionPlan = ({
  name,
  description,
  price,
  features,
  isPopular = false,
  onSelect,
}: SubscriptionPlanProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: name === "Basic" ? 0.1 : name === "Premium" ? 0.2 : 0 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card 
        className={cn(
          "h-full flex flex-col transition-all duration-300",
          isPopular ? "border-pink-500 dark:border-pink-400 shadow-lg" : "",
          isHovered ? "shadow-xl transform -translate-y-1" : "shadow"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </div>
          </div>
        )}
        
        <CardHeader className={cn(
          "pb-8",
          isPopular ? "bg-gradient-to-r from-pink-500/10 to-violet-500/10" : ""
        )}>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{name}</div>
          <CardTitle className="text-2xl font-bold mt-2">
            {price === 0 ? (
              "Free"
            ) : (
              <>
                ${price}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li 
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={cn(
                  "flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center mr-2 mt-0.5",
                  isPopular ? "bg-pink-500" : "bg-green-500"
                )}>
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="pt-6">
          <Button 
            onClick={() => onSelect(name.toUpperCase())}
            variant={isPopular ? "gradient" : "default"}
            className="w-full"
            size="lg"
          >
            {price === 0 ? "Get Started" : "Subscribe Now"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SubscriptionPlan;