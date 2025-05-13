import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PERSONALITY_TYPES } from "@/lib/constants";
import { ChevronLeft, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Start New Chat",
  description: "Choose a personality and start a new conversation.",
};

export default function NewChatPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/chat" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to conversations
        </Link>
        <h1 className="text-3xl font-bold mb-2">Start a New Conversation</h1>
        <p className="text-muted-foreground">
          Choose a personality type that matches what you're looking for
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PERSONALITY_TYPES.map((personality, index) => (
          <Card key={index} className="overflow-hidden card-hover">
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute inset-0 bg-card/50 backdrop-blur-sm z-0" />
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-xl font-semibold text-white">{personality.name}</h3>
              </div>
            </div>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">{personality.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {personality.traits.map((trait, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/chat/${personality.id}/new`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Chatting
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}