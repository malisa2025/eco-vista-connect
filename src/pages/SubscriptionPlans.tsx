import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { PlanCard } from "@/components/subscriptions/PlanCard";
import { FeatureComparisonTable } from "@/components/subscriptions/FeatureComparisonTable";
import { PlanCalculator } from "@/components/subscriptions/PlanCalculator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";

export default function SubscriptionPlans() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { plans, isLoading } = useSubscriptionPlans();

  const businessPlans = plans?.filter(p => p.target_audience === "business") || [];
  const jobSeekerPlans = plans?.filter(p => p.target_audience === "job_seeker") || [];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">Loading plans...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Unlock premium features and grow your career or business with our flexible subscription plans
            </p>

            <div className="flex items-center justify-center gap-3 mb-8">
              <Label htmlFor="billing-toggle">Monthly</Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label htmlFor="billing-toggle">
                Annual <span className="text-green-600 font-semibold">(Save 20%)</span>
              </Label>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="business">For Businesses</TabsTrigger>
              <TabsTrigger value="jobseeker">For Job Seekers</TabsTrigger>
            </TabsList>

            <TabsContent value="business">
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {businessPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAnnual={isAnnual}
                    isPopular={plan.name === "Professional"}
                  />
                ))}
              </div>

              <PlanCalculator planType="business" plans={businessPlans} />
              
              <div className="mt-12">
                <FeatureComparisonTable plans={businessPlans} />
              </div>
            </TabsContent>

            <TabsContent value="jobseeker">
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {jobSeekerPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAnnual={isAnnual}
                    isPopular={plan.name === "Pro"}
                  />
                ))}
              </div>

              <div className="mt-12">
                <FeatureComparisonTable plans={jobSeekerPlans} />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Kwame Mensah",
                  role: "Business Owner",
                  quote: "The Professional plan helped us find qualified candidates 3x faster!",
                },
                {
                  name: "Ama Asante",
                  role: "Job Seeker",
                  quote: "Pro membership gave me early access to jobs and I landed my dream role in 2 weeks.",
                },
                {
                  name: "Kofi Owusu",
                  role: "Startup Founder",
                  quote: "Best investment for our hiring process. Worth every cedi!",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I switch plans anytime?</AccordionTrigger>
              <AccordionContent>
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the charges.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major payment methods through Paystack, including mobile money, cards, and bank transfers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Is there a free trial?</AccordionTrigger>
              <AccordionContent>
                Yes! All paid plans come with a 7-day free trial. No credit card required to start.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What happens when I hit my limits?</AccordionTrigger>
              <AccordionContent>
                You'll receive a notification when approaching your limits. You can upgrade anytime to continue without interruption.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
      <Footer />
    </>
  );
}
