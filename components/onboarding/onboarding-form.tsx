"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { PERSONALITY_TYPES } from "@/lib/constants";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const OnboardingForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    preferredPersonality: "",
    communicationStyle: "",
    interests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/chat");
    }, 1500);
  };

  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== "" && formData.email.trim() !== "";
      case 2:
        return formData.preferredPersonality !== "";
      case 3:
        return formData.communicationStyle !== "";
      case 4:
        return formData.interests.trim() !== "";
      default:
        return false;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 mx-1 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              ></div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of 4
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Let's get to know you
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="mt-1"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Choose a personality type
                </h2>
                <p className="text-muted-foreground mb-4">
                  Select the personality type that best matches what you're looking for
                </p>
                <RadioGroup
                  value={formData.preferredPersonality}
                  onValueChange={(value) =>
                    handleRadioChange("preferredPersonality", value)
                  }
                  className="space-y-3"
                >
                  {PERSONALITY_TYPES.map((personality) => (
                    <div
                      key={personality.id}
                      className={`flex items-start space-x-3 p-3 rounded-md border ${
                        formData.preferredPersonality === personality.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem
                        value={personality.id}
                        id={personality.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={personality.id}
                          className="font-medium cursor-pointer"
                        >
                          {personality.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {personality.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Communication Style
                </h2>
                <p className="text-muted-foreground mb-4">
                  How would you prefer your AI companion to communicate with you?
                </p>
                <RadioGroup
                  value={formData.communicationStyle}
                  onValueChange={(value) =>
                    handleRadioChange("communicationStyle", value)
                  }
                  className="space-y-3"
                >
                  <div
                    className={`flex items-start space-x-3 p-3 rounded-md border ${
                      formData.communicationStyle === "casual"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="casual" id="casual" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="casual" className="font-medium cursor-pointer">
                        Casual & Friendly
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Relaxed, conversational tone with occasional humor
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-start space-x-3 p-3 rounded-md border ${
                      formData.communicationStyle === "deep"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="deep" id="deep" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="deep" className="font-medium cursor-pointer">
                        Deep & Thoughtful
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Meaningful conversations with insightful questions
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-start space-x-3 p-3 rounded-md border ${
                      formData.communicationStyle === "supportive"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem
                      value="supportive"
                      id="supportive"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="supportive"
                        className="font-medium cursor-pointer"
                      >
                        Supportive & Encouraging
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Positive, uplifting messages that provide emotional support
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-start space-x-3 p-3 rounded-md border ${
                      formData.communicationStyle === "flirty"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="flirty" id="flirty" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="flirty" className="font-medium cursor-pointer">
                        Flirty & Playful
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Lighthearted, teasing, and romantic communication
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Your Interests
                </h2>
                <p className="text-muted-foreground mb-4">
                  What topics would you like to discuss with your AI companion?
                </p>
                <div>
                  <Label htmlFor="interests">Interests & Topics</Label>
                  <Input
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g., movies, books, travel, technology, personal growth"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This helps your AI companion understand what you enjoy talking about
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={!isStepValid() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Start Chatting
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OnboardingForm;