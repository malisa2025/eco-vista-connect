import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanCalculatorProps {
  planType: "business" | "job_seeker";
  plans: Array<{
    id: string;
    name: string;
    usage_limits?: any;
  }>;
}

export function PlanCalculator({ planType, plans }: PlanCalculatorProps) {
  const [jobsPerMonth, setJobsPerMonth] = useState(5);
  const navigate = useNavigate();

  const getRecommendedPlan = () => {
    if (planType === "business") {
      const sortedPlans = [...plans].sort((a, b) => {
        const aLimit = a.usage_limits?.jobs_per_month || 0;
        const bLimit = b.usage_limits?.jobs_per_month || 0;
        return aLimit - bLimit;
      });

      for (const plan of sortedPlans) {
        const limit = plan.usage_limits?.jobs_per_month;
        if (limit === -1 || limit >= jobsPerMonth) {
          return plan;
        }
      }
      return sortedPlans[sortedPlans.length - 1];
    }

    return null;
  };

  const recommendedPlan = getRecommendedPlan();

  if (planType !== "business") return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle>Find Your Perfect Plan</CardTitle>
        <CardDescription>
          Tell us your needs and we'll recommend the best plan for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>How many jobs do you need to post per month?</Label>
            <span className="font-bold">{jobsPerMonth}</span>
          </div>
          <Slider
            value={[jobsPerMonth]}
            onValueChange={(value) => setJobsPerMonth(value[0])}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {recommendedPlan && (
          <div className="p-4 bg-card rounded-lg border-2 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">We recommend</p>
                <h3 className="text-2xl font-bold">{recommendedPlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {jobsPerMonth <= 3
                    ? "Perfect for small teams just getting started."
                    : jobsPerMonth <= 10
                    ? "Great for growing businesses with regular hiring needs."
                    : "Ideal for companies with high-volume recruitment."}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate(`/business-subscription-checkout?plan=${recommendedPlan.id}`)}
              >
                Choose Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
