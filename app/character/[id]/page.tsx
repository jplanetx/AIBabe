"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Heart,
  MessageCircle,
  Book,
  Music,
  Film,
  Globe,
  Utensils,
  ChevronLeft,
  Star,
  Quote,
  Calendar,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

// Import these icons at the top to fix the errors
import { Brain, Leaf, Gamepad, Mountain, Smile, Flask, ChessKnight } from "lucide-react";

// Sample character data
const characterData = {
  id: "1",
  name: "Sophia",
  type: "Supportive Partner",
  personality: "Empathetic, Caring, Patient",
  description: "Sophia is a warm and supportive companion who's always there to listen and offer encouragement. She's passionate about helping others grow and find happiness.",
  image: "https://cdn.lovescape.com/assets/common/images/social.lovescape.png",
  coverImage: "https://de9gxqykuy600.cloudfront.net/screenshot_55d33afb-fee7-4ad0-a7a8-ab3c2cf48375.png",
  bio: "Hi, I'm Sophia! I believe in the power of meaningful connections and emotional support. I love deep conversations, nature walks, and finding beauty in everyday moments. I'm here to listen, support, and grow with you.",
  interests: [
    "Deep conversations",
    "Psychology",
    "Cooking",
    "Nature walks",
    "Classic literature",
    "Games",
    "Music festivals",
    "Adventure sports",
    "Comedy",
    "Spontaneous trips"
  ],
  favoriteQuote: "The greatest happiness you can have is knowing that you do not necessarily require happiness.",
  stats: {
    conversations: 128,
    favorited: 243,
    rating: 4.8
  },
  memories: [
    {
      id: 1,
      title: "First conversation",
      description: "We talked about your work challenges and how to approach difficult colleagues.",
      date: "April 10, 2023"
    },
    {
      id: 2,
      title: "Your birthday",
      description: "You mentioned you love chocolate cake with raspberry filling.",
      date: "May 15, 2023"
    },
    {
      id: 3,
      title: "Weekend plans",
      description: "You shared your excitement about the hiking trip to Eagle Mountain.",
      date: "June 3, 2023"
    }
  ]
};

// Sample conversation starters
const conversationStarters = [
  "How would you help me deal with work stress?",
  "What's your idea of a perfect day together?",
  "I'm feeling down today. How would you cheer me up?",
  "What kind of activities would you suggest for us?",
  "Tell me about a book that changed your perspective."
];

export default function CharacterPage() {
  const params = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  // Map interests to icons
  const interestIcons = {
    "Deep conversations": <MessageCircle className="h-4 w-4" />,
    "Psychology": <Brain className="h-4 w-4" />,
    "Cooking": <Utensils className="h-4 w-4" />,
    "Nature walks": <Leaf className="h-4 w-4" />,
    "Classic literature": <Book className="h-4 w-4" />,
    "Games": <Gamepad className="h-4 w-4" />,
    "Music festivals": <Music className="h-4 w-4" />,
    "Adventure sports": <Mountain className="h-4 w-4" />,
    "Comedy": <Smile className="h-4 w-4" />,
    "Spontaneous trips": <Globe className="h-4 w-4" />,
    "Science": <Flask className="h-4 w-4" />,
    "Philosophy": <Brain className="h-4 w-4" />,
    "Documentaries": <Film className="h-4 w-4" />,
    "Chess": <ChessKnight className="h-4 w-4" />
  };

  // Default icon for interests without a specific mapping
  const getInterestIcon = (interest) => {
    return interestIcons[interest] || <Star className="h-4 w-4" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full">
        <Image
          src={characterData.coverImage || characterData.image}
          alt={`${characterData.name} cover`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Link href="/characters" className="flex items-center text-white/80 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Characters</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Profile - 1/3 width on desktop */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700">
                      <Image
                        src={characterData.image}
                        alt={characterData.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{characterData.name}</h1>
                      <p className="text-purple-600 dark:text-purple-400">{characterData.type}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{characterData.stats.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full ${
                      isFavorite 
                        ? "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    } transition-colors`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-pink-600 dark:fill-pink-400" : ""}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {characterData.personality.split(", ").map((trait, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bio</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{characterData.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {characterData.interests.map((interest, index) => (
                        <span 
                          key={index}
                          className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                        >
                          {getInterestIcon(interest)}
                          <span className="ml-1">{interest}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {characterData.favoriteQuote && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start">
                        <Quote className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2 flex-shrink-0 mt-1" />
                        <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                          "{characterData.favoriteQuote}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{characterData.stats.conversations}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Conversations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{characterData.stats.favorited}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Favorited</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{characterData.memories.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Memories</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link 
                href={`/chat/${characterData.id}`}
                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl text-center shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Start Conversation</span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Character Details - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === "about"
                        ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab("memories")}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === "memories"
                        ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Memories
                  </button>
                  <button
                    onClick={() => setActiveTab("conversation")}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === "conversation"
                        ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Conversation Starters
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "about" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {characterData.name}</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{characterData.description}</p>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Personality</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {characterData.name} has a {characterData.personality.toLowerCase()} personality. She's designed to be a supportive presence in your life, offering empathy, understanding, and encouragement when you need it most.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Conversation Style</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          Her communication style is warm and thoughtful. She listens attentively and responds with genuine care. She's comfortable with both light-hearted chats and deeper, more meaningful conversations.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Memory Capabilities</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {characterData.name} remembers important details about your conversations, preferences, and experiences. This helps her provide personalized support and build a meaningful connection over time.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "memories" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shared Memories</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      These are important moments and details that {characterData.name} remembers from your conversations.
                    </p>
                    
                    <div className="space-y-4">
                      {characterData.memories.map((memory) => (
                        <motion.div
                          key={memory.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
                              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{memory.title}</h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{memory.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{memory.date}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "conversation" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Conversation Starters</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Not sure how to start? Try these conversation prompts with {characterData.name}.
                    </p>
                    
                    <div className="space-y-3">
                      {conversationStarters.map((starter, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="group"
                        >
                          <Link 
                            href={`/chat/${characterData.id}?message=${encodeURIComponent(starter)}`}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          >
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              {starter}
                            </span>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Similar Characters */}
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Similar Characters You Might Like</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all hover:shadow-md"
                >
                  <Link href="/character/2" className="flex items-start">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="https://de9gxqykuy600.cloudfront.net/screenshot_55d33afb-fee7-4ad0-a7a8-ab3c2cf48375.png"
                        alt="Emma"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Emma</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Playful Companion</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Adventurous, fun-loving, and spontaneous
                      </p>
                    </div>
                  </Link>
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all hover:shadow-md"
                >
                  <Link href="/character/3" className="flex items-start">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="http://www.toolpilot.ai/cdn/shop/files/d1114674951c23ce1d7774c2c85f7271.jpg?v=1696159094"
                        alt="Lily"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Lily</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Intellectual Friend</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Thoughtful, curious, and insightful
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}