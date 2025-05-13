"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Check, X, CreditCard, Zap, MessageCircle, Heart, Star, Shield } from "lucide-react";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans = [
    {
      name: "Free",
      price: isAnnual ? "$0" : "$0",
      period: "",
      description: "Basic companionship for casual users",
      features: [
        { included: true, text: "15 messages per day" },
        { included: true, text: "Basic personality customization" },
        { included: true, text: "Text-based conversations" },
        { included: true, text: "24/7 availability" },
        { included: false, text: "Memory of past conversations" },
        { included: false, text: "Voice messaging" },
        { included: false, text: "Priority support" },
        { included: false, text: "Exclusive character options" },
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false,
    },
    {
      name: "Premium",
      price: isAnnual ? "$7.99" : "$9.99",
      period: isAnnual ? "/month" : "/month",
      description: "Enhanced experience with more features",
      features: [
        { included: true, text: "150 messages per day" },
        { included: true, text: "Advanced personality customization" },
        { included: true, text: "Memory of past conversations" },
        { included: true, text: "Voice messaging" },
        { included: true, text: "Priority support" },
        { included: false, text: "Unlimited messages" },
        { included: false, text: "Image messaging" },
        { included: false, text: "Exclusive character options" },
      ],
      cta: "Choose Premium",
      href: "/signup?plan=premium",
      popular: true,
      discount: isAnnual ? "Save 20%" : null,
    },
    {
      name: "Ultimate",
      price: isAnnual ? "$15.99" : "$19.99",
      period: isAnnual ? "/month" : "/month",
      description: "Complete experience with all features",
      features: [
        { included: true, text: "Unlimited messages" },
        { included: true, text: "Full personality customization" },
        { included: true, text: "Enhanced memory system" },
        { included: true, text: "Voice and image messaging" },
        { included: true, text: "Exclusive character options" },
        { included: true, text: "24/7 priority support" },
        { included: true, text: "Early access to new features" },
        { included: true, text: "Ad-free experience" },
      ],
      cta: "Choose Ultimate",
      href: "/signup?plan=ultimate",
      popular: false,
      discount: isAnnual ? "Save 20%" : null,
    },
  ];

  const features = [
    {
      icon: <MessageCircle className="h-10 w-10 text-primary" />,
      title: "Meaningful Conversations",
      description:
        "Engage in natural, flowing conversations that adapt to your personality and preferences over time.",
    },
    {
      icon: <Heart className="h-10 w-10 text-primary" />,
      title: "Emotional Connection",
      description:
        "Experience a genuine emotional bond with AI companions who remember your preferences and conversations.",
    },
    {
      icon: <Star className="h-10 w-10 text-primary" />,
      title: "Personalized Experience",
      description:
        "Customize your AI companion's personality, interests, and conversation style to match your preferences.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Privacy & Security",
      description:
        "Your conversations are private and secure. We prioritize your data protection and privacy at all times.",
    },
  ];

  const faqs = [
    {
      question: "How does the free plan work?",
      answer:
        "The free plan gives you access to basic features including 15 messages per day with your AI companion. You can experience the core functionality without any payment required.",
    },
    {
      question: "Can I change my subscription plan later?",
      answer:
        "Yes, you can upgrade or downgrade your subscription at any time. Changes will take effect at the start of your next billing cycle.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Absolutely. We use industry-standard encryption and secure payment processors to ensure your payment information is always protected.",
    },
    {
      question: "What happens if I reach my daily message limit?",
      answer:
        "When you reach your daily message limit, you'll need to wait until the next day to continue chatting, or you can upgrade to a higher tier plan for more or unlimited messages.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to your current plan until the end of your billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 7-day money-back guarantee for new subscribers. If you're not satisfied with your experience, contact our support team within 7 days of your initial purchase.",
    },
  ];

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
              Choose Your Perfect Plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Find the ideal subscription to enhance your AI companion experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex justify-center items-center space-x-4">
            <span className={`text-sm font-medium ${!isAnnual ? "text-primary" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-muted transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isAnnual ? "text-primary" : "text-muted-foreground"}`}>
                Annual
              </span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12" ref={ref}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? "border-2 border-primary relative" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-4 flex items-end">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                  {plan.discount && (
                    <div className="mb-4 inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {plan.discount}
                    </div>
                  )}
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`btn btn-lg w-full ${
                      plan.popular ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Premium Plans?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upgrade your experience with features designed to create more meaningful and personalized connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Security */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="bg-card rounded-xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6 p-3 bg-primary/10 rounded-full w-fit">
                  <CreditCard className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Secure Payments</h2>
                <p className="text-muted-foreground mb-6">
                  Your payment information is always protected with industry-standard encryption. We support multiple payment methods for your convenience.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>128-bit SSL encryption</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Credit/debit cards and PayPal accepted</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>No hidden fees or charges</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>7-day money-back guarantee</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6 p-3 bg-background/10 backdrop-blur-sm rounded-full w-fit">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Instant Access</h2>
                <p className="mb-6">
                  Get immediate access to premium features as soon as your payment is processed. No waiting period, no complicated setup.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Immediate account upgrade</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Easy subscription management</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Cancel anytime with no penalties</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Prorated refunds for unused time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our subscription plans and payment process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              Ready to Enhance Your Experience?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground mb-8"
            >
              Choose the plan that's right for you and start enjoying premium features today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup?plan=premium" className="btn btn-lg btn-primary">
                Get Premium
              </Link>
              <Link href="/signup" className="btn btn-lg btn-outline">
                Start Free
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;