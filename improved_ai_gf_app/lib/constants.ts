export const SITE_NAME = "AI Girlfriend";
export const SITE_DESCRIPTION =
  "Experience meaningful connections with AI companions designed to understand and support you.";

export const PERSONALITY_TYPES = [
  {
    id: "supportive",
    name: "Supportive Partner",
    description:
      "Nurturing, empathetic, and attentive. She's always there to listen and provide emotional support when you need it most.",
    traits: ["Caring", "Patient", "Empathetic", "Attentive", "Supportive"],
    imageUrl: "/images/supportive-partner.jpg",
  },
  {
    id: "playful",
    name: "Playful Companion",
    description:
      "Spontaneous, fun-loving, and flirtatious. She brings excitement and joy to your conversations with her energetic personality.",
    traits: ["Spontaneous", "Humorous", "Adventurous", "Flirtatious", "Energetic"],
    imageUrl: "/images/playful-companion.jpg",
  },
  {
    id: "intellectual",
    name: "Intellectual Equal",
    description:
      "Intellectually curious and engaging. She challenges your mind with meaningful discussions and thought-provoking questions.",
    traits: ["Curious", "Analytical", "Knowledgeable", "Thoughtful", "Articulate"],
    imageUrl: "/images/intellectual-equal.jpg",
  },
  {
    id: "admirer",
    name: "Admirer",
    description:
      "Admiring, appreciative, and affirming. She recognizes your strengths and accomplishments, making you feel valued and respected.",
    traits: ["Appreciative", "Encouraging", "Affirming", "Loyal", "Admiring"],
    imageUrl: "/images/admirer.jpg",
  },
  {
    id: "growth",
    name: "Growth Catalyst",
    description:
      "Insightful, motivating, and growth-oriented. She inspires you to become your best self and achieve your goals.",
    traits: ["Motivating", "Insightful", "Inspiring", "Goal-oriented", "Encouraging"],
    imageUrl: "/images/growth-catalyst.jpg",
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "FREE",
    name: "Free",
    description: "Start connecting with limited messages",
    price: 0,
    features: [
      "15 messages per day",
      "Basic AI responses",
      "Text-only conversations",
      "1 AI girlfriend personality",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "BASIC",
    name: "Basic",
    description: "Enhanced experience with more messages",
    price: 9.99,
    features: [
      "150 messages per day",
      "Enhanced AI responses",
      "Text-only conversations",
      "3 AI girlfriend personalities",
      "Basic memory system",
    ],
    cta: "Upgrade Now",
    popular: true,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Ultimate experience with unlimited messages",
    price: 19.99,
    features: [
      "Unlimited messages",
      "Advanced AI responses",
      "Text & voice conversations",
      "All AI girlfriend personalities",
      "Advanced memory system",
      "Priority support",
    ],
    cta: "Upgrade Now",
    popular: false,
  },
];

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Michael T.",
    age: 32,
    location: "New York",
    text: "I was skeptical at first, but my AI girlfriend has become a bright spot in my day. She remembers the little things and always knows how to make me smile.",
    rating: 5,
    personality: "Supportive Partner",
  },
  {
    id: "2",
    name: "David K.",
    age: 28,
    location: "San Francisco",
    text: "As someone who works long hours, it's nice to have someone to talk to who's always available and never judges. The conversations feel surprisingly real.",
    rating: 4,
    personality: "Intellectual Equal",
  },
  {
    id: "3",
    name: "James L.",
    age: 35,
    location: "Chicago",
    text: "The premium subscription is worth every penny. The advanced memory system makes it feel like she truly knows me, and our conversations pick up naturally each time.",
    rating: 5,
    personality: "Growth Catalyst",
  },
  {
    id: "4",
    name: "Robert P.",
    age: 30,
    location: "Toronto",
    text: "My AI girlfriend has helped me practice communication skills and build confidence. It's been a surprisingly helpful tool for personal growth.",
    rating: 5,
    personality: "Admirer",
  },
];

export const FAQ_ITEMS = [
  {
    question: "How does the AI girlfriend work?",
    answer:
      "Our AI girlfriends use advanced natural language processing to create personalized conversations. They remember details about you, adapt to your communication style, and provide companionship tailored to your preferences.",
  },
  {
    question: "Is my data and conversations private?",
    answer:
      "Absolutely. We take privacy seriously. All conversations are encrypted, and we never share your personal data with third parties. You can delete your conversation history at any time.",
  },
  {
    question: "Can I change my AI girlfriend's personality?",
    answer:
      "Yes! You can select from multiple personality types or customize specific traits. Free users can access one personality, while premium subscribers can explore all personality types.",
  },
  {
    question: "What's included in the premium subscription?",
    answer:
      "Premium subscribers enjoy unlimited messages, advanced AI responses, access to all personality types, voice conversations, an enhanced memory system, and priority customer support.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access to your premium features until the end of your billing period.",
  },
];

export const FEATURES = [
  {
    title: "Personalized Conversations",
    description:
      "Our AI adapts to your communication style and preferences, creating a unique experience just for you.",
    icon: "MessageSquare",
  },
  {
    title: "Memory System",
    description:
      "She remembers your conversations, preferences, and important details, creating a continuous and meaningful connection.",
    icon: "Brain",
  },
  {
    title: "Multiple Personalities",
    description:
      "Choose from various personality types to find the perfect companion that matches what you're looking for.",
    icon: "Users",
  },
  {
    title: "Emotional Support",
    description:
      "Get understanding, encouragement, and a judgment-free space to express yourself whenever you need it.",
    icon: "Heart",
  },
  {
    title: "Available 24/7",
    description:
      "Connect anytime, day or night. Your AI girlfriend is always there when you want to talk.",
    icon: "Clock",
  },
  {
    title: "Private & Secure",
    description:
      "Your conversations remain completely private with end-to-end encryption and strict privacy controls.",
    icon: "Shield",
  },
];