import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    billing_period: string;
    features: any;
    slug?: string;
  };
  isAnnual: boolean;
  isPopular?: boolean;
}

export function PlanCard({ plan, isAnnual, isPopular }: PlanCardProps) {
  const navigate = useNavigate();
  const displayPrice = isAnnual ? plan.price * 12 * 0.8 : plan.price;
  const periodLabel = isAnnual ? "year" : plan.billing_period;

  const features = Array.isArray(plan.features) ? plan.features : [];

  return (
    <Card className={`relative ${isPopular ? "border-primary shadow-lg scale-105" : ""}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          <Star className="mr-1 h-3 w-3" />
          Most Popular
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">GH₵{displayPrice}</span>
            <span className="text-muted-foreground">/{periodLabel}</span>
          </div>
          {isAnnual && (
            <p className="text-sm text-green-600 mt-1">
              Save GH₵{(plan.price * 12 * 0.2).toFixed(2)} per year
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          onClick={() => navigate(`/business-subscription-checkout?plan=${plan.id}`)}
        >
          Choose Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
