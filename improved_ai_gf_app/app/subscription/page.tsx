"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionPlan from "@/components/subscription-plan";
import { SUBSCRIPTION_PLANS } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const { toast } = useToast();
  
  const handleSelectPlan = (plan: string) => {
    toast({
      title: "Subscription Updated",
      description: `You've selected the ${plan.toLowerCase()} plan with ${billingCycle} billing.`,
    });
  };
  
  const getDiscountedPrice = (price: number) => {
    return billingCycle === "annual" ? (price * 0.8).toFixed(2) : price.toFixed(2);
  };
  
  const getAnnualSavings = (price: number) => {
    return ((price * 12) - (price * 0.8 * 12)).toFixed(2);
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="gradient-text">Subscription Plan</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan to enhance your AI girlfriend experience with additional features and benefits.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <Tabs 
            defaultValue="monthly" 
            value={billingCycle} 
            onValueChange={setBillingCycle}
            className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
          >
            <TabsList className="grid grid-cols-2 w-[300px]">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">
                Annual
                <span className="ml-2 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-xs py-0.5 px-1.5 rounded-full">
                  Save 20%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SubscriptionPlan
            name="Free"
            description="Basic access with limited features"
            price={0}
            features={SUBSCRIPTION_PLANS.FREE.features}
            onSelect={() => handleSelectPlan("FREE")}
          />
          
          <SubscriptionPlan
            name="Basic"
            description="Enhanced experience with more features"
            price={Number(getDiscountedPrice(SUBSCRIPTION_PLANS.BASIC.price))}
            features={[
              ...SUBSCRIPTION_PLANS.BASIC.features,
              billingCycle === "annual" ? `Save $${getAnnualSavings(SUBSCRIPTION_PLANS.BASIC.price)} with annual billing` : "",
            ].filter(Boolean)}
            isPopular={true}
            onSelect={() => handleSelectPlan("BASIC")}
          />
          
          <SubscriptionPlan
            name="Premium"
            description="Full access to all features"
            price={Number(getDiscountedPrice(SUBSCRIPTION_PLANS.PREMIUM.price))}
            features={[
              ...SUBSCRIPTION_PLANS.PREMIUM.features,
              billingCycle === "annual" ? `Save $${getAnnualSavings(SUBSCRIPTION_PLANS.PREMIUM.price)} with annual billing` : "",
            ].filter(Boolean)}
            onSelect={() => handleSelectPlan("PREMIUM")}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Why Subscribe?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CreditCard className="h-6 w-6 text-pink-500" />,
                title: "Flexible Billing",
                description: "Choose between monthly or annual billing with significant savings on longer commitments."
              },
              {
                icon: <Shield className="h-6 w-6 text-pink-500" />,
                title: "Secure Payments",
                description: "All transactions are encrypted and processed securely through our trusted payment providers."
              },
              {
                icon: <Clock className="h-6 w-6 text-pink-500" />,
                title: "Cancel Anytime",
                description: "No long-term contracts. You can cancel or change your subscription at any time."
              }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Can I change my subscription plan later?",
                answer: "Yes, you can upgrade or downgrade your subscription at any time. Changes will be applied immediately, with prorated charges or credits for the remaining billing period."
              },
              {
                question: "How do the message limits work?",
                answer: "Message limits reset daily at midnight in your local time zone. Free users get 15 messages per day, Basic subscribers get 150 messages per day, and Premium subscribers have unlimited messaging."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and Apple Pay for subscription payments. All transactions are securely processed and encrypted."
              },
              {
                question: "Is my subscription automatically renewed?",
                answer: "Yes, subscriptions automatically renew at the end of each billing period (monthly or annually) until canceled. You'll receive a reminder email before renewal."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}