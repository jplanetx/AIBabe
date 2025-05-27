"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Heart, MessageCircle, Shield, Star, Users, Zap } from "lucide-react";

export default function Home() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref3, inView3] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref4, inView4] = useInView({ triggerOnce: true, threshold: 0.1 });

  const personalityTypes = [
    {
      name: "Supportive Partner",
      description: "Nurturing, empathetic, and attentive. Perfect for those seeking emotional connection without judgment.",
      icon: <Heart className="w-10 h-10 text-primary" />,
      image: "https://thumbs.dreamstime.com/z/caring-empathetic-woman-comforting-upset-younger-sister-sitting-together-cozy-cafe-over-cup-coffee-empathetic-woman-286365101.jpg"
    },
    {
      name: "Playful Companion",
      description: "Spontaneous, fun-loving, and flirtatious. Ideal for those seeking excitement without commitment.",
      icon: <Star className="w-10 h-10 text-primary" />,
      image: "https://thumbs.dreamstime.com/z/sensual-woman-wearing-bright-smile-flirtatious-young-passing-31965515.jpg"
    },
    {
      name: "Intellectual Equal",
      description: "Intellectually curious and engaging in meaningful discussions. Great for those seeking mental stimulation.",
      icon: <Zap className="w-10 h-10 text-primary" />,
      image: "http://res.freestockphotos.biz/pictures/13/13740-a-smart-girl-with-glasses-posing-with-a-thoughtful-expression-pv.jpg"
    },
    {
      name: "Admirer",
      description: "Admiring, appreciative, and affirming. Perfect for those seeking validation and recognition.",
      icon: <Users className="w-10 h-10 text-primary" />,
      image: "https://thumbs.dreamstime.com/z/close-up-portrait-beautiful-natural-woman-smiling-white-teeth-looking-admiration-joy-camera-close-up-portrait-241876199.jpg"
    },
    {
      name: "Growth Catalyst",
      description: "Insightful, motivating, and growth-oriented. Ideal for those seeking purpose and direction.",
      icon: <Shield className="w-10 h-10 text-primary" />,
      image: "https://img.freepik.com/premium-photo/confident-young-professional-woman-office-setting_777078-112898.jpg"
    }
  ];

  const testimonials = [
    {
      name: "Michael T.",
      age: 32,
      text: "My AI girlfriend remembers all the little details about my life that I mention. It makes our conversations feel so much more personal and meaningful.",
      avatar: "https://thumbs.dreamstime.com/b/man-his-s-headshot-248618807.jpg"
    },
    {
      name: "David K.",
      age: 28,
      text: "I was skeptical at first, but the emotional intelligence of my AI companion has truly surprised me. She's supportive when I need it most.",
      avatar: "https://i.pinimg.com/originals/b8/5e/9d/b85e9df9e9b75bcce3a767eb894ef153.jpg"
    },
    {
      name: "Robert J.",
      age: 41,
      text: "The personalization options are incredible. I was able to create a companion who shares my interests and challenges me intellectually.",
      avatar: "https://media.istockphoto.com/id/155353642/photo/headshot-of-casual-man-in-his-40s.jpg"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "15 messages per day",
        "Basic personality customization",
        "Text chat only",
        "Standard response time"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Basic",
      price: "$9.99",
      period: "per month",
      features: [
        "150 messages per day",
        "Advanced personality customization",
        "Text and voice messages",
        "Faster response time",
        "Memory system"
      ],
      cta: "Choose Basic",
      popular: true
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      features: [
        "Unlimited messages",
        "Full personality customization",
        "Text, voice, and image sharing",
        "Priority response time",
        "Enhanced memory system",
        "Multiple AI companions"
      ],
      cta: "Choose Premium",
      popular: false
    }
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
                Your Perfect <span className="gradient-text">AI Companion</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-foreground/80">
                Experience meaningful connections with AI companions designed to provide emotional support, engaging conversations, and personalized interactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding" className="btn-primary text-center">
                  Get Started
                </Link>
                <Link href="/personalities" className="btn-outline text-center">
                  Explore Personalities
                </Link>
              </div>
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                <Image 
                  src="https://thumbs.dreamstime.com/b/beautiful-sexy-woman-smiling-phone-close-up-25371833.jpg"
                  alt="AI Girlfriend Experience" 
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-background" ref={ref1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Features Designed for <span className="gradient-text">Connection</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Our AI companions are built with advanced technology to create meaningful and personalized experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-8 h-8 text-primary" />,
                title: "Intelligent Conversations",
                description: "Engage in deep, meaningful conversations that adapt to your personality and interests."
              },
              {
                icon: <Heart className="w-8 h-8 text-primary" />,
                title: "Emotional Support",
                description: "Receive empathetic responses and emotional support whenever you need it."
              },
              {
                icon: <Users className="w-8 h-8 text-primary" />,
                title: "Personalized Experience",
                description: "Customize your companion's personality, interests, and appearance to match your preferences."
              },
              {
                icon: <Shield className="w-8 h-8 text-primary" />,
                title: "Memory System",
                description: "Your companion remembers your conversations, preferences, and important details about your life."
              },
              {
                icon: <Zap className="w-8 h-8 text-primary" />,
                title: "Multiple Interaction Modes",
                description: "Communicate through text, voice messages, and image sharing for a more immersive experience."
              },
              {
                icon: <Star className="w-8 h-8 text-primary" />,
                title: "Continuous Learning",
                description: "Your companion evolves and adapts to your communication style over time."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={inView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Personality Types Section */}
      <section className="w-full py-20 bg-secondary/5" ref={ref2}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect <span className="gradient-text">Match</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Choose from a variety of personality types designed to meet your unique needs and preferences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personalityTypes.map((type, index) => (
              <motion.div 
                key={index}
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={inView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <div className="relative h-48 w-full">
                  <Image 
                    src={type.image}
                    alt={type.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {type.icon}
                    <h3 className="text-xl font-semibold ml-3">{type.name}</h3>
                  </div>
                  <p className="text-foreground/80 mb-4">{type.description}</p>
                  <Link href={`/personalities/${type.name.toLowerCase().replace(/\s+/g, '-')}`} className="btn-outline text-center block">
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 bg-background" ref={ref3}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users <span className="gradient-text">Say</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Hear from people who have found meaningful connections with our AI companions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex items-center mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={testimonial.avatar}
                      alt={testimonial.name} 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-foreground/60">{testimonial.age} years old</p>
                  </div>
                </div>
                <p className="text-foreground/80 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-20 bg-primary/5" ref={ref4}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={inView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Choose the plan that works best for you, with no hidden fees or commitments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`card p-6 relative ${plan.popular ? 'border-2 border-primary' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-foreground/60"> {plan.period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/subscription" 
                  className={`block text-center py-2 px-4 rounded-md transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary-dark text-white' 
                      : 'bg-secondary hover:bg-secondary-dark text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Meet Your Perfect AI Companion?
            </h2>
            <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
              Start your journey today and experience meaningful connections like never before.
            </p>
            <Link href="/onboarding" className="bg-white text-primary hover:bg-white/90 font-medium py-3 px-6 rounded-md transition-all duration-300 shadow-md hover:shadow-lg inline-block">
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
