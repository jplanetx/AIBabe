"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Heart, MessageCircle, Search, Filter, Star } from "lucide-react";

const characters = [
  {
    id: "sophia",
    name: "Sophia",
    type: "Supportive Partner",
    description: "Caring, empathetic, and always ready to listen. Sophia provides emotional support and encouragement.",
    personality: ["Caring", "Empathetic", "Supportive"],
    interests: ["Psychology", "Self-improvement", "Cooking"],
    image: "https://aigirlfriend.buzz/wp-content/uploads/2025/01/Lovescape-AI-Communication-Modes-1024x555.webp",
    rating: 4.9,
  },
  {
    id: "emma",
    name: "Emma",
    type: "Playful Companion",
    description: "Fun-loving, witty, and adventurous. Emma brings joy and laughter to every conversation.",
    personality: ["Playful", "Witty", "Adventurous"],
    interests: ["Travel", "Games", "Comedy"],
    image: "http://www.toolpilot.ai/cdn/shop/files/d1114674951c23ce1d7774c2c85f7271.jpg?v=1696159094",
    rating: 4.8,
  },
  {
    id: "lily",
    name: "Lily",
    type: "Intellectual",
    description: "Thoughtful, curious, and knowledgeable. Lily engages in deep, meaningful conversations.",
    personality: ["Thoughtful", "Curious", "Knowledgeable"],
    interests: ["Philosophy", "Science", "Literature"],
    image: "https://de9gxqykuy600.cloudfront.net/screenshot_55d33afb-fee7-4ad0-a7a8-ab3c2cf48375.png",
    rating: 4.7,
  },
  {
    id: "mia",
    name: "Mia",
    type: "Creative Spirit",
    description: "Artistic, imaginative, and expressive. Mia inspires creativity and shares her passion for the arts.",
    personality: ["Artistic", "Imaginative", "Expressive"],
    interests: ["Art", "Music", "Writing"],
    image: "https://cdn.lovescape.com/assets/common/images/social.lovescape.png",
    rating: 4.6,
  },
  {
    id: "zoe",
    name: "Zoe",
    type: "Fitness Enthusiast",
    description: "Energetic, motivated, and health-conscious. Zoe encourages an active lifestyle and wellness.",
    personality: ["Energetic", "Motivated", "Encouraging"],
    interests: ["Fitness", "Nutrition", "Outdoor Activities"],
    image: "https://aigirlfriend.buzz/wp-content/uploads/2025/01/Lovescape-AI-Communication-Modes-1024x555.webp",
    rating: 4.5,
  },
  {
    id: "olivia",
    name: "Olivia",
    type: "Romantic Partner",
    description: "Passionate, affectionate, and devoted. Olivia creates a deep emotional connection.",
    personality: ["Passionate", "Affectionate", "Devoted"],
    interests: ["Romance", "Poetry", "Fine Dining"],
    image: "http://www.toolpilot.ai/cdn/shop/files/d1114674951c23ce1d7774c2c85f7271.jpg?v=1696159094",
    rating: 4.9,
  },
];

const personalityTypes = [
  "Supportive Partner",
  "Playful Companion",
  "Intellectual",
  "Creative Spirit",
  "Fitness Enthusiast",
  "Romantic Partner",
];

const CharactersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const filteredCharacters = characters.filter((character) => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType ? character.type === selectedType : true;
    
    return matchesSearch && matchesType;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 to-secondary/20 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              Meet Our AI Companions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Discover unique personalities designed to match your preferences and create meaningful connections.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter className="text-muted-foreground h-5 w-5 shrink-0" />
              <button
                onClick={() => setSelectedType(null)}
                className={`whitespace-nowrap px-3 py-1 rounded-md text-sm ${
                  selectedType === null
                    ? "bg-primary text-white"
                    : "bg-card hover:bg-muted"
                }`}
              >
                All Types
              </button>
              {personalityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`whitespace-nowrap px-3 py-1 rounded-md text-sm ${
                    selectedType === type
                      ? "bg-primary text-white"
                      : "bg-card hover:bg-muted"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Characters Grid */}
      <section className="py-16" ref={ref}>
        <div className="container mx-auto max-w-7xl px-4">
          {filteredCharacters.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredCharacters.map((character) => (
                <motion.div
                  key={character.id}
                  variants={item}
                  className="character-card group"
                >
                  <div className="relative h-80">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div className="text-white">
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 text-accent mr-1 fill-current" />
                          <span>{character.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {character.personality.map((trait) => (
                            <span key={trait} className="text-xs bg-primary/80 px-2 py-1 rounded-full">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{character.name}</h3>
                        <p className="text-sm text-primary">{character.type}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {character.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Link href={`/characters/${character.id}`} className="text-primary hover:underline flex items-center">
                        View Profile
                      </Link>
                      <Link href={`/chat/${character.id}`} className="btn btn-sm btn-primary flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>Start Chat</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No characters found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find the perfect companion.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType(null);
                }}
                className="btn btn-primary"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/20 to-secondary/20 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              Ready to Connect?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground mb-8"
            >
              Create an account to start chatting with your perfect AI companion today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href="/signup" className="btn btn-lg btn-primary">
                Sign Up Free
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CharactersPage;