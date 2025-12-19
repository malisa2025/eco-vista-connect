import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "GHS 0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Basic business profile",
      "Up to 5 photos",
      "Customer reviews",
      "Business hours display",
      "Contact information",
    ],
    buttonText: "Get Started",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "GHS 99",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Everything in Free",
      "Unlimited photos & videos",
      "Featured in search results",
      "Lead capture forms",
      "Analytics dashboard",
      "Priority support",
    ],
    buttonText: "Start Free Trial",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Business",
    price: "GHS 299",
    period: "/month",
    description: "For established enterprises",
    features: [
      "Everything in Pro",
      "Multiple locations",
      "Team member accounts",
      "API access",
      "Custom branding",
      "Dedicated account manager",
    ],
    buttonText: "Contact Sales",
    variant: "outline" as const,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="font-display mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your business needs. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative group hover:shadow-elegant transition-smooth animate-fade-in-up ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border/50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.variant}
                  className="w-full"
                  onClick={() => navigate("/subscription-plans")}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="link"
            className="text-primary"
            onClick={() => navigate("/subscription-plans")}
          >
            View all plans and features <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
