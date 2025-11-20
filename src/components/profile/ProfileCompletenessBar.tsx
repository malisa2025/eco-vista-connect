import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useProfileCompleteness } from "@/hooks/useProfileCompleteness";

const ProfileCompletenessBar = () => {
  const { completionPercentage, incompleteSections } = useProfileCompleteness();

  const getColor = () => {
    if (completionPercentage >= 80) return "text-green-600";
    if (completionPercentage >= 50) return "text-yellow-600";
    return "text-destructive";
  };

  const getMessage = () => {
    if (completionPercentage === 100) {
      return "Your profile is complete! Great job!";
    }
    if (completionPercentage >= 80) {
      return "Almost there! Just a few more details.";
    }
    if (completionPercentage >= 50) {
      return "Good progress! Keep filling out your profile.";
    }
    return "Let's build your profile to unlock all features.";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Profile Completeness</h3>
            <span className={`text-2xl font-bold ${getColor()}`}>
              {completionPercentage}%
            </span>
          </div>

          <Progress value={completionPercentage} className="h-3" />

          <p className="text-sm text-muted-foreground">{getMessage()}</p>

          {incompleteSections.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                To improve your profile:
              </p>
              <ul className="space-y-1">
                {incompleteSections.map((section) =>
                  section.suggestions?.map((suggestion, idx) => (
                    <li
                      key={`${section.name}-${idx}`}
                      className="text-sm text-muted-foreground pl-6 flex items-start gap-2"
                    >
                      <span className="text-yellow-600 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {completionPercentage === 100 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Profile complete - you're ready to apply!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletenessBar;
