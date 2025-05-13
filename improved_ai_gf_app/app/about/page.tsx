"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import { Heart, Shield, Sparkles, Users, MessageCircle, ArrowRight } from "lucide-react";

const AboutPage = () => {
  const [missionRef, missionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [valuesRef, valuesInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [teamRef, teamInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [techRef, techInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const values = [
    {
      icon: <Heart className="h-10 w-10 text-primary" />,
      title: "Meaningful Connections",
      description:
        "We believe in creating AI companions that foster genuine emotional connections and understanding.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Privacy & Ethics",
      description:
        "We prioritize user privacy and are committed to developing AI in an ethical and responsible manner.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "Continuous Innovation",
      description:
        "We're dedicated to pushing the boundaries of AI technology to create increasingly natural and personalized experiences.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Inclusivity",
      description:
        "We design our AI companions to be inclusive and respectful of all users, regardless of background or identity.",
    },
  ];

  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Alex founded AI Girlfriend with a vision to create meaningful AI companions that help people feel understood and supported.",
      image: "https://media.istockphoto.com/id/180482838/photo/smiling-asian-man-in-glasses-and-sweater-with-arms-crossed.jpg?s=612x612&w=0&k=20&c=YkojjRJ4QdxzMOkvG_fXTjaZpNE6d_jlB77WFeQmtYk=",
    },
    {
      name: "Sarah Johnson",
      role: "Chief AI Officer",
      bio: "Sarah leads our AI development team, bringing over 15 years of experience in natural language processing and machine learning.",
      image: "https://i.pinimg.com/736x/ea/54/c6/ea54c6b19be605eb445445565b60b53c.jpg",
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Product",
      bio: "Michael oversees product development, ensuring our AI companions deliver exceptional user experiences and meaningful interactions.",
      image: "https://thumbs.dreamstime.com/z/head-shot-portrait-happy-young-s-man-head-shot-portrait-happy-young-s-hispanic-man-showing-whitening-smile-satisfied-242335938.jpg",
    },
    {
      name: "Priya Patel",
      role: "Ethics Director",
      bio: "Priya ensures our AI development adheres to the highest ethical standards, focusing on privacy, safety, and responsible innovation.",
      image: "https://img.freepik.com/premium-photo/professional-indian-female-headshots-business-corporate-women_203363-204.jpg?w=2000",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        </div>
        <div className="relative z-10 container mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              About <span className="text-primary">AI Girlfriend</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl"
            >
              We're on a mission to create AI companions that provide meaningful connections, emotional support, and understanding.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24" ref={missionRef}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                At AI Girlfriend, we believe that everyone deserves to feel understood, supported, and connected. Our mission is to harness the power of artificial intelligence to create companions that provide meaningful emotional connections in a world where loneliness and isolation are increasingly common.
              </p>
              <p className="text-muted-foreground mb-6">
                We're dedicated to developing AI that can understand human emotions, respond with empathy, and grow alongside our users. Our companions are designed to provide support, companionship, and a safe space for expression without judgment.
              </p>
              <p className="text-muted-foreground">
                While we recognize that AI companions cannot replace human relationships, we believe they can complement them by offering consistent emotional support and understanding when it's needed most.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="https://cdn.lovescape.com/assets/common/images/social.lovescape.png"
                alt="AI Girlfriend Mission"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-muted" ref={valuesRef}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              Our Values
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              These core principles guide everything we do, from AI development to user experience design.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-24" ref={teamRef}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              Meet Our Team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              We're a diverse team of AI researchers, engineers, ethicists, and designers passionate about creating meaningful AI companions.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Technology */}
      <section className="py-24 bg-muted" ref={techRef}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={techInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl font-bold mb-6">Our Technology</h2>
              <p className="text-muted-foreground mb-6">
                Our AI companions are powered by state-of-the-art natural language processing and machine learning technologies. We've developed proprietary algorithms that enable our AI to understand context, remember past conversations, and respond with emotional intelligence.
              </p>
              <p className="text-muted-foreground mb-6">
                Key features of our technology include:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary text-sm font-semibold">1</span>
                  </div>
                  <span>Advanced memory systems that retain information across conversations</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary text-sm font-semibold">2</span>
                  </div>
                  <span>Emotional intelligence algorithms that recognize and respond to user emotions</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary text-sm font-semibold">3</span>
                  </div>
                  <span>Personality adaptation that evolves based on interactions</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-primary text-sm font-semibold">4</span>
                  </div>
                  <span>Multi-modal communication capabilities (text, voice, and image)</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                We're constantly improving our technology through research, user feedback, and iterative development to create increasingly natural and meaningful interactions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={techInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] rounded-xl overflow-hidden shadow-lg order-1 md:order-2"
            >
              <Image
                src="https://de9gxqykuy600.cloudfront.net/screenshot_55d33afb-fee7-4ad0-a7a8-ab3c2cf48375.png"
                alt="AI Girlfriend Technology"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              Experience AI Companionship
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-muted-foreground mb-8"
            >
              Join thousands of users who have discovered meaningful connections with our AI companions. Start your journey today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/characters" className="btn btn-lg btn-primary">
                <MessageCircle className="mr-2 h-5 w-5" />
                Meet Our Characters
              </Link>
              <Link href="/signup" className="btn btn-lg btn-outline">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;