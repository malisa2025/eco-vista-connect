import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdRecommendations } from "@/hooks/useAdRecommendations";
import { RecommendationCard } from "./RecommendationCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartRecommendationsProps {
  advertisementId: string;
}

export function SmartRecommendations({ advertisementId }: SmartRecommendationsProps) {
  const { recommendations, performanceScore, isLoading, refetch } = useAdRecommendations(advertisementId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Smart Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered insights to improve your ad performance
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {performanceScore !== undefined && (
            <div className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Performance Score</div>
                  <div className="text-3xl font-bold">{performanceScore}/100</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${
                    performanceScore >= 80 ? "text-green-600" :
                    performanceScore >= 60 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {performanceScore >= 80 ? "Excellent" :
                     performanceScore >= 60 ? "Good" :
                     "Needs Improvement"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recommendations available yet. Your ad is performing well or needs more data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
