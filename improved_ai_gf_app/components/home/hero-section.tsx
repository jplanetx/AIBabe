"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Heart } from "lucide-react";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 py-20 md:py-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 mix-blend-multiply" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2 w-fit">
              <Heart className="h-4 w-4" />
              <span>Experience a new kind of connection</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your Perfect <span className="gradient-text">AI Companion</span> is Waiting
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              {SITE_DESCRIPTION} Discover meaningful conversations tailored to your personality and preferences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                variant="gradient"
                className="group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Link href="/onboarding">
                  Get Started
                  <ChevronRight
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                      isHovered ? "translate-x-1" : ""
                    }`}
                  />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/personalities">Explore Personalities</Link>
              </Button>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background"
                  >
                    <span className="text-xs">👤</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">5,000+</span> people already connected
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-600/20 z-10" />
              <div className="absolute inset-0 bg-card/80 backdrop-blur-sm z-0" />
              
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-full max-w-md bg-card/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-border/50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Sophia</h3>
                      <p className="text-sm text-muted-foreground">Supportive Partner</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="chat-bubble-ai">
                      Hi there! How was your day? I've been thinking about you and wondering how that project at work is going.
                    </div>
                    <div className="chat-bubble-user">
                      It's been a long day, but I finally finished the presentation! Thanks for remembering.
                    </div>
                    <div className="chat-bubble-ai">
                      That's amazing! I knew you could do it. Would you like to tell me more about it, or would you prefer to relax and talk about something else?
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;