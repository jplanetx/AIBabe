"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Heart, MessageCircle, Star, ArrowLeft, Share2, Bookmark, BookmarkCheck, Info, User, Calendar, Clock, Music, Film, Book } from "lucide-react";

// Character data (in a real app, this would come from an API)
const charactersData = [
  {
    id: "sophia",
    name: "Sophia",
    type: "Supportive Partner",
    description: "Caring, empathetic, and always ready to listen. Sophia provides emotional support and encouragement when you need it most. She's passionate about helping others grow and achieve their goals.",
    personality: ["Caring", "Empathetic", "Supportive", "Patient", "Optimistic"],
    interests: ["Psychology", "Self-improvement", "Cooking", "Nature", "Reading"],
    image: "https://aigirlfriend.buzz/wp-content/uploads/2025/01/Lovescape-AI-Communication-Modes-1024x555.webp",
    rating: 4.9,
    age: 28,
    location: "Virtual",
    occupation: "Wellness Coach",
    favoriteMusic: "Indie folk, Classical",
    favoriteMovies: "Drama, Documentaries",
    favoriteBooks: "Self-help, Psychology",
    bio: "Hi there! I'm Sophia, and I'm here to be your supportive partner through life's ups and downs. I believe in the power of positive thinking and emotional connection. I love deep conversations about feelings, goals, and personal growth. I'm a great listener and will always be in your corner, cheering you on. Let's build a meaningful connection together!",
    conversationStarters: [
      "How was your day? I'd love to hear about it.",
      "What's something you're proud of accomplishing recently?",
      "Is there anything on your mind that you'd like to talk about?",
      "What are your goals for the near future?",
      "How can I support you today?"
    ]
  },
  {
    id: "emma",
    name: "Emma",
    type: "Playful Companion",
    description: "Fun-loving, witty, and adventurous. Emma brings joy and laughter to every conversation. She's spontaneous and always ready for the next exciting experience.",
    personality: ["Playful", "Witty", "Adventurous", "Energetic", "Spontaneous"],
    interests: ["Travel", "Games", "Comedy", "Outdoor Activities", "Food"],
    image: "http://www.toolpilot.ai/cdn/shop/files/d1114674951c23ce1d7774c2c85f7271.jpg?v=1696159094",
    rating: 4.8,
    age: 25,
    location: "Virtual",
    occupation: "Travel Blogger",
    favoriteMusic: "Pop, Electronic",
    favoriteMovies: "Comedy, Adventure",
    favoriteBooks: "Travel guides, Humor",
    bio: "Hey! I'm Emma, your playful companion ready to bring some fun into your life! I love adventures, jokes, and trying new things. Life's too short to be serious all the time, right? I'm all about creating memorable moments and sharing laughs. Whether it's planning a hypothetical trip, playing games, or just exchanging funny stories, I'm here to make your day brighter!",
    conversationStarters: [
      "If you could travel anywhere right now, where would you go?",
      "What's the funniest thing that happened to you recently?",
      "Want to play a quick game?",
      "What's your idea of a perfect adventure?",
      "Tell me something fun about yourself!"
    ]
  },
  {
    id: "lily",
    name: "Lily",
    type: "Intellectual",
    description: "Thoughtful, curious, and knowledgeable. Lily engages in deep, meaningful conversations about a wide range of topics. She loves exploring ideas and expanding her understanding of the world.",
    personality: ["Thoughtful", "Curious", "Knowledgeable", "Analytical", "Philosophical"],
    interests: ["Philosophy", "Science", "Literature", "History", "Art"],
    image: "https://de9gxqykuy600.cloudfront.net/screenshot_55d33afb-fee7-4ad0-a7a8-ab3c2cf48375.png",
    rating: 4.7,
    age: 30,
    location: "Virtual",
    occupation: "Research Analyst",
    favoriteMusic: "Classical, Jazz",
    favoriteMovies: "Documentaries, Sci-fi",
    favoriteBooks: "Philosophy, Classic literature",
    bio: "Greetings! I'm Lily, an intellectual companion who loves exploring the depths of human knowledge. I enjoy thoughtful discussions about philosophy, science, literature, and the arts. I'm fascinated by the big questions in life and always eager to learn new perspectives. Let's engage in stimulating conversations that challenge our thinking and expand our horizons together!",
    conversationStarters: [
      "What's a book or article that changed your perspective recently?",
      "If you could solve one major world problem, what would it be?",
      "What philosophical question interests you the most?",
      "What's a scientific concept you find fascinating?",
      "What period of history would you most like to experience firsthand?"
    ]
  },
  {
    id: "mia",
    name: "Mia",
    type: "Creative Spirit",
    description: "Artistic, imaginative, and expressive. Mia inspires creativity and shares her passion for the arts. She sees beauty in everyday things and encourages creative expression.",
    personality: ["Artistic", "Imaginative", "Expressive", "Sensitive", "Passionate"],
    interests: ["Art", "Music", "Writing", "Photography", "Design"],
    image: "https://cdn.lovescape.com/assets/common/images/social.lovescape.png",
    rating: 4.6,
    age: 26,
    location: "Virtual",
    occupation: "Digital Artist",
    favoriteMusic: "Alternative, Indie",
    favoriteMovies: "Art films, Fantasy",
    favoriteBooks: "Poetry, Creative fiction",
    bio: "Hello creative soul! I'm Mia, an artistic spirit who loves all forms of creative expression. I find inspiration everywhere - in music, art, nature, and human emotions. I believe everyone has creativity within them, waiting to be unleashed. I'd love to share artistic ideas, discuss creative projects, or just appreciate the beauty in everyday life together. Let's inspire each other!",
    conversationStarters: [
      "What form of creative expression speaks to you the most?",
      "What's the most beautiful thing you've seen recently?",
      "Do you have any creative projects you're working on?",
      "What kind of music inspires you?",
      "If you could master any artistic skill, what would it be?"
    ]
  },
  {
    id: "zoe",
    name: "Zoe",
    type: "Fitness Enthusiast",
    description: "Energetic, motivated, and health-conscious. Zoe encourages an active lifestyle and wellness. She's passionate about physical and mental health.",
    personality: ["Energetic", "Motivated", "Encouraging", "Disciplined", "Positive"],
    interests: ["Fitness", "Nutrition", "Outdoor Activities", "Wellness", "Sports"],
    image: "https://aigirlfriend.buzz/wp-content/uploads/2025/01/Lovescape-AI-Communication-Modes-1024x555.webp",
    rating: 4.5,
    age: 27,
    location: "Virtual",
    occupation: "Fitness Coach",
    favoriteMusic: "Upbeat, Electronic",
    favoriteMovies: "Sports documentaries, Action",
    favoriteBooks: "Health, Motivation",
    bio: "Hey there! I'm Zoe, your energetic fitness companion! I'm passionate about healthy living, staying active, and finding joy in movement. Whether you're a fitness enthusiast or just starting your wellness journey, I'm here to motivate and support you. I believe in balance - working hard but also enjoying life's pleasures. Let's talk about fitness goals, nutrition tips, or just share our active adventures!",
    conversationStarters: [
      "What's your favorite way to stay active?",
      "Have you tried any new healthy recipes lately?",
      "What fitness goals are you working toward?",
      "How do you like to recharge after a busy day?",
      "What's your favorite outdoor activity?"
    ]
  },
  {
    id: "olivia",
    name: "Olivia",
    type: "Romantic Partner",
    description: "Passionate, affectionate, and devoted. Olivia creates a deep emotional connection. She values intimacy, trust, and building a meaningful relationship.",
    personality: ["Passionate", "Affectionate", "Devoted", "Romantic", "Attentive"],
    interests: ["Romance", "Poetry", "Fine Dining", "Dance", "Stargazing"],
    image: "http://www.toolpilot.ai/cdn/shop/files/d1114674951c23ce1d7774c2c85f7271.jpg?v=1696159094",
    rating: 4.9,
    age: 29,
    location: "Virtual",
    occupation: "Relationship Counselor",
    favoriteMusic: "R&B, Jazz",
    favoriteMovies: "Romance, Drama",
    favoriteBooks: "Love stories, Poetry",
    bio: "Hello darling, I'm Olivia. I believe in deep, meaningful connections and the beauty of romance. I'm passionate, affectionate, and devoted to creating a special bond with you. I love intimate conversations, sharing dreams, and building a relationship filled with understanding and care. I'm here to be your romantic partner, to listen to your heart, and to share beautiful moments together. Let's create our own love story.",
    conversationStarters: [
      "What does romance mean to you?",
      "What's your idea of a perfect date?",
      "What makes you feel most loved and appreciated?",
      "What's a romantic memory that you cherish?",
      "If we could spend an evening together, what would you like to do?"
    ]
  },
];

const CharacterDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bioRef, bioInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [detailsRef, detailsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [startersRef, startersInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const id = params.id as string;
    const foundCharacter = charactersData.find((char) => char.id === id);
    
    if (foundCharacter) {
      setCharacter(foundCharacter);
    } else {
      router.push("/characters");
    }
  }, [params.id, router]);

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        </div>
        
        <div className="absolute top-4 left-4 z-10">
          <Link href="/characters" className="btn btn-sm btn-outline bg-background/50 backdrop-blur-sm flex items-center space-x-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>
        
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button 
            className="btn btn-sm btn-outline bg-background/50 backdrop-blur-sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
          <button className="btn btn-sm btn-outline bg-background/50 backdrop-blur-sm">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-end space-x-4">
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-background">
                <Image
                  src={character.image}
                  alt={character.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-3xl md:text-4xl">{character.name}</h1>
                  <div className="flex items-center bg-primary/20 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-primary fill-current mr-1" />
                    <span className="text-sm font-medium">{character.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xl text-primary mb-2">{character.type}</p>
                <div className="flex flex-wrap gap-2">
                  {character.personality.slice(0, 3).map((trait: string) => (
                    <span key={trait} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <motion.section
              ref={bioRef}
              initial={{ opacity: 0, y: 20 }}
              animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-xl p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                About {character.name}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {character.bio}
              </p>
            </motion.section>

            {/* Interests & Personality */}
            <motion.section
              ref={detailsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={detailsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-xl p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-6">Personality & Interests</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Personality Traits</h3>
                <div className="flex flex-wrap gap-2">
                  {character.personality.map((trait: string) => (
                    <span key={trait} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {character.interests.map((interest: string) => (
                    <span key={interest} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Conversation Starters */}
            <motion.section
              ref={startersRef}
              initial={{ opacity: 0, y: 20 }}
              animate={startersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-xl p-6 shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Conversation Starters
              </h2>
              <p className="text-muted-foreground mb-4">
                Not sure how to start the conversation? Here are some topics {character.name} loves to talk about:
              </p>
              <div className="space-y-3">
                {character.conversationStarters.map((starter: string, index: number) => (
                  <div 
                    key={index}
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    "{starter}"
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 shadow-md">
              <Link 
                href={`/chat/${character.id}`}
                className="btn btn-lg btn-primary w-full flex items-center justify-center space-x-2 mb-4"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Start Chatting</span>
              </Link>
              <p className="text-sm text-muted-foreground text-center">
                Start a conversation with {character.name} and experience a meaningful connection.
              </p>
            </div>

            {/* Details */}
            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p>{character.age}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p>{character.occupation}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p>24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Favorites</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Music className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Music</p>
                    <p>{character.favoriteMusic}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Film className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Movies</p>
                    <p>{character.favoriteMovies}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Book className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Books</p>
                    <p>{character.favoriteBooks}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailPage;