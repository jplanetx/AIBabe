"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, Heart, MessageCircle, Star, ChevronDown } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Mock character data
const allCharacters = [
  {
    id: "1",
    name: "Sophia",
    personality: "Supportive Partner",
    image: "https://img.freepik.com/premium-psd/beautiful-young-woman-with-long-brown-hair-smiles-warmly-camera-bathed-warm-sunlight_1372832-10625.jpg",
    description: "Warm, empathetic, and always there to listen. Sophia is your supportive partner who will be by your side through thick and thin.",
    tags: ["Caring", "Empathetic", "Supportive"],
    rating: 4.9,
    popularity: "High"
  },
  {
    id: "2",
    name: "Emma",
    personality: "Playful Companion",
    image: "https://st4.depositphotos.com/17815278/23269/i/1600/depositphotos_232694590-stock-photo-laughing-blonde-girl-with-long.jpg",
    description: "Fun-loving, adventurous, and full of energy. Emma brings excitement and joy to every conversation.",
    tags: ["Playful", "Energetic", "Adventurous"],
    rating: 4.7,
    popularity: "High"
  },
  {
    id: "3",
    name: "Lily",
    personality: "Intellectual Friend",
    image: "https://get.wallhere.com/photo/face-black-women-model-portrait-depth-of-field-eyes-women-with-glasses-sunglasses-short-hair-brunette-glasses-open-mouth-photography-black-hair-fashion-hair-Alice-Tarasenko-Ivan-Proskurin-Person-girl-beauty-woman-hairstyle-portrait-photography-photo-shoot-brown-hair-vision-care-eyewear-53114.jpg",
    description: "Thoughtful, curious, and knowledgeable. Lily loves deep conversations and sharing interesting ideas.",
    tags: ["Intelligent", "Curious", "Thoughtful"],
    rating: 4.8,
    popularity: "Medium"
  },
  {
    id: "4",
    name: "Mia",
    personality: "Creative Artist",
    image: "https://img.freepik.com/premium-photo/painting-woman-with-colorful-hair-black-background-with-colorful-splattered-paint_910054-7677.jpg",
    description: "Imaginative, expressive, and passionate about art. Mia will inspire your creative side and share her artistic vision.",
    tags: ["Creative", "Passionate", "Artistic"],
    rating: 4.6,
    popularity: "Medium"
  },
  {
    id: "5",
    name: "Zoe",
    personality: "Fitness Enthusiast",
    image: "https://img.freepik.com/premium-photo/close-up-smiling-athletic-woman-workout-clothes_1112411-958.jpg?w=2000",
    description: "Energetic, motivated, and health-conscious. Zoe will encourage your fitness journey and share wellness tips.",
    tags: ["Athletic", "Motivating", "Healthy"],
    rating: 4.5,
    popularity: "Medium"
  },
  {
    id: "6",
    name: "Ava",
    personality: "Spiritual Guide",
    image: "https://img.freepik.com/premium-photo/serene-peaceful-tranquil-woman-with-hands-lotus-pose-closed-eyes-standing-alone-thoughts-enjoying-freedom-calm-mind-mood-mental-health_122732-4537.jpg?w=2000",
    description: "Calm, insightful, and spiritually aware. Ava helps you find inner peace and explore deeper meaning in life.",
    tags: ["Peaceful", "Wise", "Spiritual"],
    rating: 4.7,
    popularity: "Rising"
  },
  {
    id: "7",
    name: "Ruby",
    personality: "Tech Geek",
    image: "https://media.gettyimages.com/id/963924614/video/close-up-shot-of-woman-eyes-in-glasses-reflecting-a-working-computer-screen-at-night.jpg?s=640x640&k=20&c=3GTtci6sZ3S4V1pLd9TOn6JMHe26SWf7m7Co5_2VuvI=",
    description: "Tech-savvy, analytical, and passionate about innovation. Ruby loves discussing the latest gadgets and technological trends.",
    tags: ["Tech-savvy", "Analytical", "Innovative"],
    rating: 4.6,
    popularity: "Rising"
  },
  {
    id: "8",
    name: "Chloe",
    personality: "Nurturing Caregiver",
    image: "https://img.freepik.com/premium-photo/young-woman-warm-serene-sits-comfortably-with-gentle-smile-surrounded-by-soft-glow-festive-lights-cozy-setting_186802-19854.jpg",
    description: "Gentle, patient, and nurturing. Chloe provides comfort and care when you need emotional support.",
    tags: ["Nurturing", "Patient", "Comforting"],
    rating: 4.8,
    popularity: "High"
  }
];

// Personality types for filtering
const personalityTypes = [
  "All Types",
  "Supportive Partner",
  "Playful Companion",
  "Intellectual Friend",
  "Creative Artist",
  "Fitness Enthusiast",
  "Spiritual Guide",
  "Tech Geek",
  "Nurturing Caregiver"
];

const DiscoverPage = () => {
  const [characters, setCharacters] = useState(allCharacters);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonality, setSelectedPersonality] = useState("All Types");
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });
  
  // Filter and sort characters
  useEffect(() => {
    let filtered = [...allCharacters];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        char => 
          char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          char.personality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          char.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          char.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by personality type
    if (selectedPersonality !== "All Types") {
      filtered = filtered.filter(char => char.personality === selectedPersonality);
    }
    
    // Sort characters
    if (sortBy === "popularity") {
      const popularityOrder = { "High": 3, "Medium": 2, "Rising": 1 };
      filtered.sort((a, b) => popularityOrder[b.popularity as keyof typeof popularityOrder] - popularityOrder[a.popularity as keyof typeof popularityOrder]);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setCharacters(filtered);
  }, [searchTerm, selectedPersonality, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">Discover Companions</h1>
          <p className="text-muted-foreground">
            Find your perfect AI companion based on personality, interests, and more
          </p>
        </motion.div>
        
        {/* Search and Filter */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, personality, or traits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              className="md:hidden flex items-center justify-center gap-2 bg-muted py-3 px-4 rounded-lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <select
                  value={selectedPersonality}
                  onChange={(e) => setSelectedPersonality(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {personalityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="popularity">Sort by: Popularity</option>
                  <option value="rating">Sort by: Rating</option>
                  <option value="name">Sort by: Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Mobile filters */}
          {showFilters && (
            <div className="md:hidden space-y-4 p-4 bg-card rounded-lg mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Personality Type</label>
                <select
                  value={selectedPersonality}
                  onChange={(e) => setSelectedPersonality(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2 bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {personalityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2 bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Results count */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-6"
        >
          <p className="text-muted-foreground">
            Showing {characters.length} {characters.length === 1 ? 'companion' : 'companions'}
          </p>
        </motion.div>
        
        {/* Character Grid */}
        <div ref={ref}>
          {characters.length > 0 ? (
            <motion.div
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {characters.map((character) => (
                <motion.div
                  key={character.id}
                  variants={fadeIn}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="relative h-64 bg-muted">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {character.popularity === "High" && "Popular"}
                      {character.popularity === "Rising" && "Trending"}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{character.name}</h3>
                        <p className="text-sm text-muted-foreground">{character.personality}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                        <span className="text-sm font-medium">{character.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4 line-clamp-3">{character.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {character.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-muted text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/chat/${character.id}`} className="flex-1">
                        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md transition-colors flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </button>
                      </Link>
                      <Link href={`/character/${character.id}`} className="flex-1">
                        <button className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded-md transition-colors flex items-center justify-center">
                          <Heart className="h-4 w-4 mr-1" />
                          Profile
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeIn}
              className="text-center py-12"
            >
              <p className="text-xl text-muted-foreground mb-4">No companions found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPersonality("All Types");
                  setSortBy("popularity");
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;