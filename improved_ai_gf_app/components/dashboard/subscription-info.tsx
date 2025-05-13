"use client";

import { useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { FREE_TIER_LIMIT } from "@/lib/utils";

const SubscriptionInfo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Mock data - in a real app, this would come from the user's subscription
  const subscription = {
    plan: "FREE",
    messageCount: 8,
    messageLimit: FREE_TIER_LIMIT,
    renewalDate: new Date("2023-07-15"),
  };

  const messagePercentage = Math.min(
    100,
    Math.round((subscription.messageCount / subscription.messageLimit) * 100)
  );

  const containerVariants = {
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
    >
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Your current plan and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{subscription.plan} Plan</h4>
              <p className="text-xs text-muted-foreground">
                {subscription.messageLimit} messages per day
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/subscription">Upgrade</Link>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Message Usage</span>
              <span>
                {subscription.messageCount} / {subscription.messageLimit}
              </span>
            </div>
            <Progress value={messagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {subscription.messageLimit - subscription.messageCount} messages remaining today
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/subscription">
              View Subscription Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SubscriptionInfo;