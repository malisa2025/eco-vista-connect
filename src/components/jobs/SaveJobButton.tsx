import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsSaved, useSavedJobMutations } from "@/hooks/useSavedJobs";
import { useNavigate } from "react-router-dom";

interface SaveJobButtonProps {
  jobId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const SaveJobButton = ({ jobId, variant = "ghost", size = "icon" }: SaveJobButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isSaved, isLoading } = useIsSaved(jobId, user?.id);
  const { saveJob, unsaveJob } = useSavedJobMutations();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (isSaved) {
      unsaveJob.mutate({ jobId, userId: user.id });
    } else {
      saveJob.mutate({ jobId, userId: user.id });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || saveJob.isPending || unsaveJob.isPending}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
};

export default SaveJobButton;
