import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PERSONALITY_TYPES } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Personalities",
  description: "Explore our range of AI girlfriend personalities, each designed with unique traits and characteristics.",
};

export default function PersonalitiesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Find Your <span className="gradient-text">Perfect Match</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our range of AI girlfriend personalities, each designed with unique traits and characteristics to match your preferences.
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
            <CardFooter className="flex justify-between">
              <Button asChild variant="outline">
                <Link href={`/personalities/${personality.id}`}>
                  Learn More
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/chat/new?personality=${personality.id}`}>
                  Start Chat
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}