import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobRecommendations } from "@/hooks/useJobRecommendations";
import JobCard from "./JobCard";
import { Skeleton } from "@/components/ui/skeleton";

const JobRecommendations = () => {
  const { user } = useAuth();
  const { data: recommendations, isLoading } = useJobRecommendations(user?.id);

  if (!user || !recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
      </div>
      
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((job: any) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
