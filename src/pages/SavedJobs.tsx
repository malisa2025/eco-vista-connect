import { useAuth } from "@/contexts/AuthContext";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/jobs/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";

const SavedJobs = () => {
  const { user } = useAuth();
  const { data: savedJobs, isLoading } = useSavedJobs(user?.id);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Saved Jobs</h1>
            </div>
            <p className="text-muted-foreground">
              Jobs you've bookmarked for later
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : savedJobs && savedJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.map((saved: any) => (
                <JobCard key={saved.id} job={saved.jobs} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No saved jobs yet
              </h2>
              <p className="text-muted-foreground">
                Start saving jobs to build your collection
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SavedJobs;
