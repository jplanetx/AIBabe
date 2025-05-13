"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Brain, Users, Heart, Clock, Shield } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeatureSectionProps {
  features: Feature[];
}

const FeatureSection = ({ features }: FeatureSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-10 w-10 text-primary" };
    switch (iconName) {
      case "MessageSquare":
        return <MessageSquare {...iconProps} />;
      case "Brain":
        return <Brain {...iconProps} />;
      case "Users":
        return <Users {...iconProps} />;
      case "Heart":
        return <Heart {...iconProps} />;
      case "Clock":
        return <Clock {...iconProps} />;
      case "Shield":
        return <Shield {...iconProps} />;
      default:
        return <MessageSquare {...iconProps} />;
    }
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 bg-accent/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Designed for <span className="gradient-text">Meaningful Connections</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI companions are built with advanced features to create an experience that feels genuine and supportive.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                {getIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;