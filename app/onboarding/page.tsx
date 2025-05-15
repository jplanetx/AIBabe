import OnboardingForm from "@/components/onboarding/onboarding-form";

export const metadata = {
  title: "Get Started",
  description: "Create your account and find your perfect AI companion.",
};

export default function OnboardingPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Let's Get <span className="gradient-text">Started</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Answer a few questions to help us find your perfect AI companion
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}