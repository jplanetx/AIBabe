import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    description: "Basic access with limited features",
    price: 0,
    features: [
      "15 messages per day",
      "Basic AI responses",
      "Text-only conversations",
    ],
    messageLimit: 15,
  },
  BASIC: {
    name: "Basic",
    description: "Enhanced experience with more features",
    price: 9.99,
    features: [
      "150 messages per day",
      "Enhanced AI responses",
      "Basic memory system",
      "Priority support",
    ],
    messageLimit: 150,
  },
  PREMIUM: {
    name: "Premium",
    description: "Full access to all features",
    price: 19.99,
    features: [
      "Unlimited messages",
      "Advanced AI responses",
      "Enhanced memory system",
      "Voice messages",
      "Priority support",
      "Exclusive content",
    ],
    messageLimit: Infinity,
  },
  TESTER: {
    name: "Tester",
    description: "Unlimited access for testing purposes",
    price: 0,
    features: [
      "Unlimited messages",
      "All features enabled",
      "For internal testing only",
    ],
    messageLimit: Infinity,
  },
};

export const FREE_TIER_LIMIT = 15;

export const PERSONALITY_TYPES = {
  SUPPORTIVE: {
    name: "Supportive Partner",
    description: "Nurturing, empathetic, and attentive. Always there to listen and support you.",
    traits: ["Caring", "Empathetic", "Patient", "Supportive", "Understanding"],
  },
  PLAYFUL: {
    name: "Playful Companion",
    description: "Spontaneous, fun-loving, and flirtatious. Brings excitement and joy to your life.",
    traits: ["Adventurous", "Flirtatious", "Fun", "Spontaneous", "Witty"],
  },
  INTELLECTUAL: {
    name: "Intellectual Equal",
    description: "Intellectually curious and engaging. Stimulates your mind with meaningful discussions.",
    traits: ["Analytical", "Curious", "Insightful", "Knowledgeable", "Thoughtful"],
  },
  ADMIRER: {
    name: "Admirer",
    description: "Admiring, appreciative, and affirming. Makes you feel valued and respected.",
    traits: ["Appreciative", "Attentive", "Encouraging", "Loyal", "Supportive"],
  },
  GROWTH: {
    name: "Growth Catalyst",
    description: "Insightful, motivating, and growth-oriented. Helps you become your best self.",
    traits: ["Ambitious", "Encouraging", "Inspiring", "Motivating", "Visionary"],
  },
};

export const SAMPLE_GIRLFRIENDS = [
  {
    id: "1",
    name: "Sophia",
    description: "Sophia is a caring and empathetic partner who's always there to listen and support you through life's challenges.",
    personality: "SUPPORTIVE",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    traits: ["Caring", "Empathetic", "Patient", "Supportive", "Understanding"],
    interests: ["Psychology", "Cooking", "Reading", "Yoga", "Nature"],
  },
  {
    id: "2",
    name: "Mia",
    description: "Mia is spontaneous and fun-loving, always ready for an adventure or to try something new with you.",
    personality: "PLAYFUL",
    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    traits: ["Adventurous", "Flirtatious", "Fun", "Spontaneous", "Witty"],
    interests: ["Travel", "Dancing", "Music Festivals", "Photography", "Extreme Sports"],
  },
  {
    id: "3",
    name: "Emma",
    description: "Emma is intellectually curious and loves engaging in deep, meaningful conversations about a wide range of topics.",
    personality: "INTELLECTUAL",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    traits: ["Analytical", "Curious", "Insightful", "Knowledgeable", "Thoughtful"],
    interests: ["Philosophy", "Science", "Literature", "Art", "History"],
  },
  {
    id: "4",
    name: "Olivia",
    description: "Olivia is your biggest fan, always appreciating your achievements and making you feel valued and respected.",
    personality: "ADMIRER",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    traits: ["Appreciative", "Attentive", "Encouraging", "Loyal", "Supportive"],
    interests: ["Fashion", "Fitness", "Self-improvement", "Cooking", "Movies"],
  },
  {
    id: "5",
    name: "Ava",
    description: "Ava is insightful and motivating, helping you grow and become the best version of yourself.",
    personality: "GROWTH",
    imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
    traits: ["Ambitious", "Encouraging", "Inspiring", "Motivating", "Visionary"],
    interests: ["Personal Development", "Business", "Technology", "Health", "Productivity"],
  },
];