import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Image, Target, TrendingUp, Lightbulb } from "lucide-react";

interface RecommendationCardProps {
  recommendation: {
    type: string;
    priority: string;
    title: string;
    description: string;
    expectedImpact?: string;
    actionable?: boolean;
  };
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "timing":
        return <Clock className="h-5 w-5" />;
      case "budget":
        return <DollarSign className="h-5 w-5" />;
      case "creative":
        return <Image className="h-5 w-5" />;
      case "targeting":
        return <Target className="h-5 w-5" />;
      case "performance":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {getIcon(recommendation.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold">{recommendation.title}</h4>
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority} Priority
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {recommendation.description}
          </p>

          {recommendation.expectedImpact && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
              <TrendingUp className="h-4 w-4" />
              <span>Expected impact: {recommendation.expectedImpact}</span>
            </div>
          )}

          {recommendation.actionable && (
            <div className="flex gap-2">
              <Button size="sm" variant="default">
                Apply This
              </Button>
              <Button size="sm" variant="ghost">
                Learn More
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
